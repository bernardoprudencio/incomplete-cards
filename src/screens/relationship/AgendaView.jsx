import { R, fontFamily } from './theme'
import { PROTO_TODAY } from '../../data/owners'
import { parseDate, dateKey, fmtDate, fmtMonthYear, fmtTime, addDays, isToday, isPast } from '../../lib/dateUtils'
import { getWeekMonday, shortRuleLabel } from '../../lib/scheduleHelpers'
import Button from '../../components/Button'
import { MoreIcon } from '../../assets/icons'

export default function AgendaView({agenda, upcomingRef, currentWeekRef, firstUpcomingKey, relEndDate, incompleteKey, onTap, onReview}) {
  if(agenda.length === 0) return (
    <div style={{textAlign:"center",padding:"48px 20px",color:R.grayLight}}>
      <div style={{fontSize:32,marginBottom:8}}>📅</div>
      <div style={{fontSize:14,fontWeight:600,fontFamily}}>No upcoming services</div>
    </div>
  )

  const monthGroups = []
  let _lastMo = null, _lastWk = null
  const todayMid = new Date(PROTO_TODAY); todayMid.setHours(0,0,0,0)
  agenda.forEach(([dayKey, occs]) => {
    const d      = parseDate(dayKey)
    const monday = getWeekMonday(d)
    const sunday = addDays(monday, 6)
    const mo     = `${sunday.getFullYear()}-${sunday.getMonth()}`
    const wk     = dateKey(monday)
    if(mo !== _lastMo) { monthGroups.push({mo, label: fmtMonthYear(sunday), weeks: []}); _lastMo = mo; _lastWk = null }
    const curMonth = monthGroups[monthGroups.length-1]
    if(wk !== _lastWk) { curMonth.weeks.push({monday, wk, entries: []}); _lastWk = wk }
    curMonth.weeks[curMonth.weeks.length-1].entries.push([dayKey, occs])
  })

  const totalWeeks = monthGroups.reduce((n, m) => n + m.weeks.length, 0)
  let wkIdxGlobal = 0

  return (
    <div>
      {monthGroups.map(({mo, label, weeks}) => (
        <div key={mo}>
          <div style={{position:"sticky",top:0,zIndex:2,background:R.white,paddingTop:24,paddingBottom:16,borderBottom:`1px solid ${R.separator}`}}>
            <p style={{fontFamily,fontWeight:600,fontSize:20,color:R.navy,margin:0,lineHeight:1.25}}>{label}</p>
          </div>
          {weeks.map(({monday, wk, entries}) => {
            const wkIdx        = wkIdxGlobal++
            const isPaid       = monday <= todayMid
            const weekTotal    = entries.reduce((sum, [,occs]) => sum + occs.reduce((s, occ) => s + (occ.unit.cost || 0), 0), 0)
            const fmtMoney     = n => `$${n.toFixed(2)}`
            const paymentLabel = isPaid ? `Paid ${fmtMoney(weekTotal)}` : `Will be charged ${fmtMoney(weekTotal)}`
            const isLastWeek   = wkIdx === totalWeeks - 1
            const isCurrentWk  = dateKey(monday) === dateKey(getWeekMonday(todayMid))
            return (
              <div key={wk}>
                <div ref={isCurrentWk ? currentWeekRef : null} style={{paddingTop:16,paddingBottom:8}}>
                  <p style={{fontFamily,fontWeight:600,fontSize:16,color:R.navy,margin:0,lineHeight:1.25}}>Week of {fmtDate(monday)}</p>
                  <p style={{fontFamily,fontSize:14,color:R.gray,margin:"4px 0 0",lineHeight:1.25}}>{paymentLabel}</p>
                </div>
                {entries.map(([dayKey, occs], entryIdx) => {
                  const d             = parseDate(dayKey)
                  const today         = isToday(d), past = isPast(d)
                  const isLastEntry   = isLastWeek && entryIdx === entries.length - 1
                  const showEndMarker = relEndDate && isLastEntry
                  const DAY_NAMES_FULL= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
                  return (
                    <div key={dayKey} ref={dayKey === firstUpcomingKey ? upcomingRef : null} style={{marginBottom:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:44,height:44,borderRadius:8,flexShrink:0,background:"#FFECBD",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:13,fontWeight:600,color:R.navy,fontFamily}}>{d.getDate()}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <p style={{fontFamily,fontWeight:600,fontSize:16,color:R.navy,margin:0,lineHeight:1.25}}>{DAY_NAMES_FULL[d.getDay()]}</p>
                        </div>
                      </div>
                      {occs.map((occ, occIdx) => {
                        const isOccToday    = today && !past
                        const isBlocked     = isOccToday && occIdx > 0
                        const showReviewBtn = occ.key === incompleteKey
                        const overnight     = occ.svc.type === "overnight"
                        const timeLabel     = overnight
                          ? `${fmtDate(occ.start)} – ${fmtDate(occ.end)}`
                          : fmtTime(occ.unit.startTime)
                        return (
                          <div key={`${occ.key}-${occ.nightIndex || 0}`} style={{border:`2px solid #D7DCE0`,borderRadius:8,padding:"0 16px",background:R.white,marginBottom:8}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:16,paddingBottom:isOccToday || showReviewBtn ? 8 : 16}}>
                              <div style={{flex:1}}>
                                <p style={{fontFamily,fontWeight:600,fontSize:16,color:R.navy,margin:"0 0 4px",lineHeight:1.5}}>{timeLabel}</p>
                                <p style={{fontFamily,fontSize:14,color:R.gray,margin:0,lineHeight:1.25}}>{shortRuleLabel(occ.unit)}</p>
                              </div>
                              {(!past || showReviewBtn) && <Button variant="default" icon={<MoreIcon size={16}/>} onClick={e => {e.stopPropagation(); onTap(occ)}}/>}
                            </div>
                            {isOccToday && (
                              <div style={{display:"flex",gap:8,paddingTop:8,paddingBottom:16}}>
                                <Button variant="primary" style={{flex:1}} disabled={isBlocked}>Start Rover Card</Button>
                              </div>
                            )}
                            {showReviewBtn && (
                              <div style={{display:"flex",gap:8,paddingBottom:8}}>
                                <Button variant="flat" style={{flex:1}} onClick={e => {e.stopPropagation(); onReview(occ)}}>Review and complete</Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {showEndMarker && (
                        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
                          <div style={{flex:1,height:1,background:R.amberBorder}}/>
                          <div style={{display:"flex",alignItems:"center",gap:6,background:R.amberLight,border:`1.5px solid ${R.amberBorder}`,borderRadius:99,padding:"5px 14px",whiteSpace:"nowrap"}}>
                            <span style={{fontSize:13}}>⏰</span>
                            <span style={{fontSize:12,fontWeight:600,color:"#7A5800",fontFamily}}>Relationship ends {fmtDate(parseDate(relEndDate))}</span>
                          </div>
                          <div style={{flex:1,height:1,background:R.amberBorder}}/>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      ))}
      <div style={{height:80}}/>
    </div>
  )
}
