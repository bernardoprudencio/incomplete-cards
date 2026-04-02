import { useState, useRef, useEffect, useMemo } from 'react'
import { PETS_SEED, PROTO_TODAY } from '../../data/owners'
import { parseDate, dateKey, fmtRelDate, fmtTime, addDays, isPast, endTimeFromDuration } from '../../lib/dateUtils'
import { buildAgenda, expandUnit, getWeekMonday, getPaidThruSunday, isPaidOcc, defaultUnit, newId } from '../../lib/scheduleHelpers'
import Button from '../../components/Button'
import ReviewSheet from '../../components/ReviewSheet'
import { R, fontFamily } from './theme'
import AgendaView from './AgendaView'
import AddSheet from './AddSheet'
import OccActionSheet from './OccActionSheet'
import ManageSheet from './ManageSheet'
import DeleteConfirmDialog from './DeleteConfirmDialog'

export default function RelationshipScreen({initialPets, initialUnits}) {
  const [pets,       setPets]       = useState(initialPets || PETS_SEED)
  const [units,      setUnits]      = useState(initialUnits || [])
  const [relEndDate, setRelEndDate] = useState("")
  const [showAdd,    setShowAdd]    = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [activeOcc,  setActiveOcc]  = useState(null)
  const [reviewOcc,  setReviewOcc]  = useState(null)
  const [cancelUnit, setCancelUnit] = useState(null)
  const [pastWeeksVisible,  setPastWeeksVisible]  = useState(0)
  const [currentWeekHidden, setCurrentWeekHidden] = useState(false)
  const [isBelowToday,      setIsBelowToday]      = useState(false)
  const [isLoadingPast,     setIsLoadingPast]     = useState(false)

  const PAST_PAGE          = 2
  const WEEK_HEIGHT        = 150
  const scrollRef          = useRef(null)
  const upcomingRef        = useRef(null)
  const currentWeekRef     = useRef(null)
  const prevScrollHeightRef= useRef(null)
  const hiddenPastWeeksRef = useRef(0)

  const checkScrollPosition = () => {
    if(!scrollRef.current || !upcomingRef.current) return
    const cRect = scrollRef.current.getBoundingClientRect()
    const aTop  = upcomingRef.current.getBoundingClientRect().top
    setIsBelowToday(aTop < cRect.top)
    setCurrentWeekHidden(aTop < cRect.top - WEEK_HEIGHT || aTop > cRect.bottom)
  }

  const triggerLoadPast = () => {
    if(isLoadingPast || hiddenPastWeeksRef.current <= 0) return
    setIsLoadingPast(true)
    prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null
  }

  useEffect(() => {
    checkScrollPosition()
    window.addEventListener('resize', checkScrollPosition)
    return () => window.removeEventListener('resize', checkScrollPosition)
  }, [pastWeeksVisible, units])

  useEffect(() => {
    const el = scrollRef.current; if(!el) return
    const onWheel = e => { if(el.scrollTop === 0 && e.deltaY < 0) triggerLoadPast() }
    el.addEventListener('wheel', onWheel, {passive:true})
    return () => el.removeEventListener('wheel', onWheel)
  }, [isLoadingPast])

  useEffect(() => {
    const el = scrollRef.current; if(!el) return
    let touchStartY = 0
    const onTouchStart = e => { touchStartY = e.touches[0].clientY }
    const onTouchEnd   = e => { const deltaY = e.changedTouches[0].clientY - touchStartY; if(el.scrollTop === 0 && deltaY > 30) triggerLoadPast() }
    el.addEventListener('touchstart', onTouchStart, {passive:true})
    el.addEventListener('touchend',   onTouchEnd,   {passive:true})
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd) }
  }, [isLoadingPast])

  useEffect(() => {
    if(currentWeekRef.current && scrollRef.current) {
      const containerTop = scrollRef.current.getBoundingClientRect().top
      const elTop        = currentWeekRef.current.getBoundingClientRect().top
      scrollRef.current.scrollTop += (elTop - containerTop) - 72
    }
  }, [])

  useEffect(() => {
    if(!isLoadingPast) return
    const t = setTimeout(() => { setPastWeeksVisible(v => v + PAST_PAGE); setIsLoadingPast(false) }, 600)
    return () => clearTimeout(t)
  }, [isLoadingPast])

  useEffect(() => {
    if(prevScrollHeightRef.current == null || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevScrollHeightRef.current
    prevScrollHeightRef.current = null
  }, [pastWeeksVisible])

  const updateUnit = u => setUnits(prev => prev.map(x => x.id === u.id ? u : x))

  const skipOccurrence = (occKey, skip) => {
    setUnits(prev => prev.map(u => {
      const occs = expandUnit(u)
      if(!occs.find(o => o.key === occKey)) return u
      const dayKey2 = occKey.replace(`${u.id}-`, "")
      const keys    = u.skippedKeys || []
      return {...u, skippedKeys: skip ? [...new Set([...keys, dayKey2])] : keys.filter(k => k !== dayKey2)}
    }))
  }

  const overrideOccurrence = (occ, draft) => {
    const dk       = dateKey(occ.start)
    const parentId = occ.parentUnit ? occ.parentUnit.id : occ.unit.id
    setUnits(prev => prev.map(u => {
      if(u.id !== parentId) return u
      const overrides = {...(u.overrides || {})}
      overrides[dk]   = {serviceId:draft.serviceId, startTime:draft.startTime, durationMins:draft.durationMins, petIds:draft.petIds}
      return {...u, overrides}
    }))
  }

  const cancelDayFromDate = occ => {
    const parentUnit  = occ.parentUnit || occ.unit
    const occDow      = occ.start.getDay()
    const newWeekDays = (parentUnit.weekDays || []).filter(d => d !== occDow)
    const dk          = dateKey(occ.start)
    setUnits(prev => {
      const updated = prev.map(u => u.id !== parentUnit.id ? u : {...u, repeatEndDate: dateKey(addDays(occ.start, -1))})
      const newUnit = {
        ...defaultUnit(parentUnit.serviceId, {
          petIds:      parentUnit.petIds,
          startDate:   dk,
          startTime:   parentUnit.startTime,
          durationMins:parentUnit.durationMins,
          frequency:   parentUnit.frequency,
          weekDays:    newWeekDays,
          everyNWeeks: parentUnit.everyNWeeks,
        }),
        repeatEndDate: parentUnit.repeatEndDate || "",
      }
      return [...updated, newUnit]
    })
  }

  const overrideFromDate = (occ, draft) => {
    const dk       = dateKey(occ.start)
    const parentId = occ.parentUnit ? occ.parentUnit.id : occ.unit.id
    setUnits(prev => {
      const parent  = prev.find(u => u.id === parentId); if(!parent) return prev
      const updated = prev.map(u => u.id !== parentId ? u : {...u, repeatEndDate: dateKey(addDays(occ.start, -1))})
      const newUnit = {
        ...defaultUnit(draft.serviceId, {
          petIds:      draft.petIds,
          startDate:   dk,
          startTime:   draft.startTime,
          durationMins:draft.durationMins,
          frequency:   draft.frequency,
          weekDays:    draft.weekDays,
          everyNWeeks: draft.everyNWeeks,
        }),
        repeatEndDate: parent.repeatEndDate || "",
        endDate:       parent.endDate || "",
      }
      return [...updated, newUnit]
    })
  }

  const agenda = buildAgenda(units, relEndDate)
  const incompleteKey = useMemo(() => {
    const thisMonday   = getWeekMonday(PROTO_TODAY)
    const lastMonday   = addDays(thisMonday, -7)
    const lastWeekOccs = agenda.flatMap(([, occs]) => occs).filter(occ => occ.start >= lastMonday && occ.start < thisMonday)
    if(!lastWeekOccs.length) return null
    return lastWeekOccs.reduce((max, occ) => occ.start > max.start ? occ : max).key
  }, [agenda])

  const allPastEntries = agenda.filter(([dk]) => isPast(parseDate(dk)))
  const allUpcoming    = agenda.filter(([dk]) => !isPast(parseDate(dk)))
  const pastWeekGroups = []; let _lastWk = null
  allPastEntries.forEach(entry => {
    const wk = dateKey(getWeekMonday(parseDate(entry[0])))
    if(wk !== _lastWk) { pastWeekGroups.push([]); _lastWk = wk }
    pastWeekGroups[pastWeekGroups.length-1].push(entry)
  })
  const totalPastWeeks       = pastWeekGroups.length
  const hiddenPastWeeks      = Math.max(0, totalPastWeeks - pastWeeksVisible)
  hiddenPastWeeksRef.current = hiddenPastWeeks
  const visiblePastEntries   = pastWeeksVisible > 0 ? pastWeekGroups.slice(-pastWeeksVisible).flat() : []

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:R.white,position:"relative"}}>
      <div ref={scrollRef} onScroll={checkScrollPosition} className="hide-scrollbar" style={{flex:1,overflowY:"auto",padding:"0 16px 0"}}>
        {(isLoadingPast || hiddenPastWeeksRef.current > 0) && (
          <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {isLoadingPast && <div style={{width:18,height:18,border:`2px solid ${R.border}`,borderTopColor:R.blue,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>}
          </div>
        )}
        <AgendaView
          agenda={[...visiblePastEntries, ...allUpcoming]}
          upcomingRef={upcomingRef}
          currentWeekRef={currentWeekRef}
          firstUpcomingKey={allUpcoming[0]?.[0]}
          relEndDate={relEndDate}
          incompleteKey={incompleteKey}
          onTap={setActiveOcc}
          onReview={setReviewOcc}
        />
      </div>
      {currentWeekHidden && (
        <div style={{position:"absolute",bottom:72,left:"50%",transform:"translateX(-50%)",zIndex:10,pointerEvents:"auto"}}>
          <button
            onClick={() => upcomingRef.current?.scrollIntoView({behavior:"smooth",block:"start"})}
            style={{background:R.navy,color:"#fff",border:"none",borderRadius:99,padding:"8px 20px",fontFamily,fontWeight:600,fontSize:14,cursor:"pointer",boxShadow:"0px 2px 12px -1px rgba(27,31,35,0.32)",whiteSpace:"nowrap"}}
          >
            {isBelowToday ? "↑ Current week" : "↓ Current week"}
          </button>
        </div>
      )}
      <div style={{padding:"10px 16px 12px",background:R.white,borderTop:`1px solid ${R.separator}`,flexShrink:0}}>
        <div style={{display:"flex",gap:12}}>
          <Button variant="primary" size="small" onClick={() => setShowAdd(true)} style={{flex:2}}>Add a service</Button>
          <Button variant="default" size="small" onClick={() => setShowManage(true)} style={{flex:1}}>Manage</Button>
        </div>
      </div>

      {showAdd && (
        <AddSheet
          onAdd={u => { setUnits(prev => [...prev, {...u, petIds: u.petIds.length ? u.petIds : pets.map(p => p.id)}]); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
          existing={units}
          allPets={pets}
          defaultServiceId={units[0]?.serviceId}
        />
      )}
      {showManage && (
        <ManageSheet units={units} pets={pets} onUnitsChange={setUnits} onClose={() => setShowManage(false)}/>
      )}
      {activeOcc && (
        <OccActionSheet
          occ={activeOcc}
          allPets={pets}
          onSaveUnit={u => { updateUnit(u); setActiveOcc(null) }}
          onSkip={skipOccurrence}
          onOverride={overrideOccurrence}
          onOverrideFromDate={overrideFromDate}
          onCancelDayFromDate={cancelDayFromDate}
          onCancel={u => { setActiveOcc(null); setCancelUnit(u) }}
          onClose={() => setActiveOcc(null)}
        />
      )}
      {cancelUnit && (
        <DeleteConfirmDialog
          unit={cancelUnit}
          units={units}
          onDelete={id => { setUnits(prev => prev.filter(x => x.id !== id)) }}
          onDeleteKeepPaid={id => {
            const u      = units.find(x => x.id === id); if(!u) return
            const paidThru= getPaidThruSunday(units)
            const occs   = expandUnit(u).filter(o => !o.skipped && isPaidOcc(o.start, paidThru))
            const kept   = occs.map(o => ({...defaultUnit(u.serviceId, {petIds:u.petIds, startDate:dateKey(o.start), endDate:u.endDate?dateKey(o.end||o.start):"", startTime:u.startTime, durationMins:u.durationMins}), frequency:"once"}))
            setUnits(prev => [...prev.filter(x => x.id !== id), ...kept])
          }}
          onRefundAndDelete={id => { setUnits(prev => prev.filter(x => x.id !== id)) }}
          onClose={() => setCancelUnit(null)}
        />
      )}
      {reviewOcc && (() => {
        const occPets = pets.filter(p => reviewOcc.unit.petIds.includes(p.id))
        const endT    = endTimeFromDuration(reviewOcc.unit.startTime, reviewOcc.unit.durationMins)
        const card    = {
          label:    `${reviewOcc.svc.label}${occPets.length > 0 ? `: ${occPets.map(p => p.name).join(", ")}` : ""}`,
          sublabel: `${fmtRelDate(reviewOcc.start)} · ${fmtTime(reviewOcc.unit.startTime)} to ${fmtTime(endT)}`,
          images:   occPets.map(p => p.img),
          cost:     "",
        }
        return <ReviewSheet visible card={card} onClose={() => setReviewOcc(null)} onComplete={() => setReviewOcc(null)} onCancelRefund={() => setReviewOcc(null)}/>
      })()}
    </div>
  )
}
