import { useState, useRef, useEffect } from 'react'
import { colors, typography } from '../tokens'
import Button from '../components/Button'
import Row from '../components/Row'
import PetAvatar from '../components/PetAvatar'
import { ChevronRightIcon } from '../assets/icons'
import boardingIcon   from '../assets/boarding.svg'
import sittingIcon    from '../assets/sitting.svg'
import daycareIcon    from '../assets/daycare.svg'
import dropInIcon     from '../assets/drop-in.svg'
import walkingIcon    from '../assets/walking.svg'

// ─── Local token aliases (values sourced from central tokens where possible) ──
const R = {
  brand:       colors.brand,              brandLight:  colors.brandLight,
  navy:        colors.primary,            navyMid:     colors.secondary,
  gray:        colors.tertiary,           grayMid:     "#767C82",
  grayLight:   colors.disabledText,       border:      colors.borderInteractive,
  separator:   colors.border,             bg:          colors.bgSecondary,
  bgTertiary:  colors.bgTertiary,         white:       colors.white,
  blue:        colors.link,               blueLight:   colors.blueLight,
  green:       colors.brand,              greenLight:  colors.brandLight,
  red:         colors.destructive,        redLight:    "#FDECEA",
  amber:       "#D4860A",                 amberLight:  "#FEF7E6",
  amberBorder: "#F0D48A",                 purple:      "#2741CC",
  purpleLight: "#EBEEFB",                 cardBorder:  colors.border,
  disabled:    colors.bgTertiary,         disabledText:colors.disabledText,
}

const fontFamily = typography.fontFamily

// ─── Constants ───────────────────────────────────────────────────────────────
const SERVICES = [
  { id:"boarding",      label:"Boarding",       icon:"🏠", desc:"Overnight at sitter's home", type:"overnight" },
  { id:"house_sitting", label:"House Sitting",  icon:"🛋️", desc:"Sitter stays at your home",  type:"overnight" },
  { id:"doggy_daycare", label:"Doggy Day Care", icon:"☀️", desc:"Daytime at sitter's home",   type:"daytime", hourBased:true },
  { id:"drop_in",       label:"Drop-In Visit",  icon:"🚪", desc:"30-min visit at your home",  type:"daytime" },
  { id:"dog_walking",   label:"Dog Walking",    icon:"🦮", desc:"30 or 60-min walk",          type:"daytime" },
]
const DURATION_SHORT   = [{label:"30 min",mins:30},{label:"45 min",mins:45},{label:"1 hr",mins:60},{label:"2 hr",mins:120}]
const DURATION_DAYCARE = [{label:"4 hrs",mins:240},{label:"8 hrs",mins:480},{label:"12 hrs",mins:720}]
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const PETS_SEED = [{id:1,name:"Louie",breed:"German Shepherd",emoji:"🐕"},{id:2,name:"Mochi",breed:"Scottish Fold",emoji:"🐈"}]
const PET_EMOJIS = ["🐕","🐈","🐇","🐦","🐠","🦎","🐹","🐾"]
const FREQ = [{id:"once",label:"One-time"},{id:"weekly",label:"Weekly"},{id:"monthly",label:"Monthly"}]

// ─── Service icons ────────────────────────────────────────────────────────────
const SvcIcon = ({ src }) => <img src={src} alt="" style={{ width: 24, height: 24 }} />

const SERVICE_ICONS = {
  boarding:      <SvcIcon src={boardingIcon} />,
  house_sitting: <SvcIcon src={sittingIcon} />,
  doggy_daycare: <SvcIcon src={daycareIcon} />,
  drop_in:       <SvcIcon src={dropInIcon} />,
  dog_walking:   <SvcIcon src={walkingIcon} />,
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS_S   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function parseDate(s)  { return s?new Date(s+"T00:00:00"):null }
function dateKey(d)    { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }
function fmtDate(d)    { if(!d)return""; return`${MONTHS_S[d.getMonth()]} ${d.getDate()}` }
function fmtDateFull(d){ if(!d)return""; return`${MONTHS_S[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
function fmtDateLong(d){ if(!d)return""; return`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` }
function fmtMonthYear(d){ if(!d)return""; return`${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
function fmtTime(t)    { if(!t)return""; const[h,m]=t.split(":").map(Number); return`${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}` }
function addDays(d,n)  { const r=new Date(d); r.setDate(r.getDate()+n); return r }
function addWeeks(d,n) { return addDays(d,n*7) }
function addMonths(d,n){ const r=new Date(d); r.setMonth(r.getMonth()+n); return r }
function nightCount(u) { if(!u.startDate||!u.endDate)return 1; return Math.max(1,Math.round((parseDate(u.endDate)-parseDate(u.startDate))/86400000)) }
function endTimeFromDuration(t,mins){ if(!t||!mins)return""; const[h,m]=t.split(":").map(Number),tot=h*60+m+mins; return`${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}` }
function isToday(d)    { const t=new Date(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate() }
function isYesterday(d){ const y=addDays(new Date(new Date().setHours(0,0,0,0)),-1); return d.getFullYear()===y.getFullYear()&&d.getMonth()===y.getMonth()&&d.getDate()===y.getDate() }
function fmtRelDate(d) { if(isToday(d))return"Today"; if(isYesterday(d))return"Yesterday"; return fmtDate(d) }
function isPast(d)     { return d<new Date(new Date().setHours(0,0,0,0)) }
function durLabel(svc,mins){ const opts=(svc&&svc.id==="doggy_daycare")?DURATION_DAYCARE:DURATION_SHORT; const f=opts.find(d=>d.mins===mins); return f?f.label:(mins+"min") }

// ─── Billing helpers ──────────────────────────────────────────────────────────
function getWeekMonday(d){ const r=new Date(d); r.setHours(0,0,0,0); const day=r.getDay(); const diff=day===0?-6:1-day; r.setDate(r.getDate()+diff); return r }
function getWeekSunday(d){ return addDays(getWeekMonday(d),6) }
function getPaidThruSunday(units){ const starts=units.map(u=>u.startDate?parseDate(u.startDate):null).filter(Boolean); if(!starts.length)return null; return getWeekSunday(starts.reduce((a,b)=>a<b?a:b)) }
function isPaidOcc(occStart, paidThruSunday){ return paidThruSunday && occStart<=paidThruSunday }

// ─── Unit factory ─────────────────────────────────────────────────────────────
let _nextId=100
function newId(){ return ++_nextId }
function defaultUnit(serviceId, overrides={}){
  const svc=SERVICES.find(s=>s.id===serviceId)
  return { id:newId(), serviceId, startDate:"", endDate:"", repeatEndDate:"", startTime:"09:00", durationMins:(svc&&svc.id)==="doggy_daycare"?480:60, petIds:[], frequency:"once", weekDays:[], everyNWeeks:1, skippedKeys:[], overrides:{}, ...overrides }
}
function cloneUnit(u, newServiceId){
  const targetId=newServiceId||u.serviceId
  const svc=SERVICES.find(s=>s.id===targetId)
  const newDuration=(svc&&svc.id)==="doggy_daycare"?480:(svc&&svc.type)==="overnight"?u.durationMins:(u.durationMins<=240?u.durationMins:60)
  const freq=((svc&&svc.type)==="overnight"&&nightCount({...u,serviceId:targetId})>=7)?"once":u.frequency
  return { ...u, id:newId(), serviceId:targetId, startDate:"", endDate:"", repeatEndDate:"", skippedKeys:[], overrides:{}, durationMins:newDuration, frequency:freq }
}

// ─── Overlap detection ────────────────────────────────────────────────────────
function overlaps(units,u){
  const svc=SERVICES.find(s=>s.id===u.serviceId)
  if(!svc||!u.startDate) return false
  return units.filter(x=>{ if(x.id===u.id) return false; const xSvc=SERVICES.find(s=>s.id===x.serviceId); return xSvc?.type===svc.type }).some(x=>{
    if(!x.startDate) return false
    return u.startDate<=( x.endDate||x.startDate)&&(u.endDate||u.startDate)>=x.startDate
  })
}
function overnightCanRepeat(u){ const svc=SERVICES.find(s=>s.id===u.serviceId); if((svc&&svc.type)!=="overnight") return true; return nightCount(u)<7 }

// ─── Expand unit → occurrences ────────────────────────────────────────────────
function expandUnit(unit){
  const svc=SERVICES.find(s=>s.id===unit.serviceId)
  if(!svc||!unit.startDate) return []
  const base=parseDate(unit.startDate)
  const today=new Date(); today.setHours(0,0,0,0)
  let horizon=addMonths(base,6)
  const hB=addWeeks(today,8); if(hB>horizon) horizon=hB
  if(unit.repeatEndDate){ const cap=parseDate(unit.repeatEndDate); if(cap<horizon) horizon=cap }
  const MAX=120
  const makeOcc=(start,dk)=>{
    const overrideData=(unit.overrides&&unit.overrides[dk])||null
    return { unit:overrideData?{...unit,...overrideData,id:unit.id}:unit, svc:overrideData&&overrideData.serviceId?SERVICES.find(s=>s.id===overrideData.serviceId)||svc:svc, start:new Date(start), end:svc.type==="overnight"&&unit.endDate?addDays(start,nightCount(unit)):null, key:`${unit.id}-${dk}`, skipped:(unit.skippedKeys&&unit.skippedKeys.indexOf(dk)>=0), isOverride:!!overrideData, parentUnit:unit }
  }
  const occs=[]
  if(unit.frequency==="once"){ occs.push(makeOcc(base,dateKey(base))) }
  else if(unit.frequency==="weekly"){
    const overnight=svc.type==="overnight"; const step=Math.max(1,unit.everyNWeeks||1)
    if(overnight){ let cur=new Date(base); while(cur<=horizon&&occs.length<MAX){ occs.push(makeOcc(cur,dateKey(cur))); cur=addWeeks(cur,step) } }
    else{
      const days=(unit.weekDays&&unit.weekDays.length)>0?unit.weekDays:[base.getDay()]
      days.forEach(dow=>{ const diff=((dow-base.getDay())+7)%7; let cur=addDays(base,diff); while(cur<=horizon&&occs.length<MAX){ occs.push(makeOcc(cur,dateKey(cur))); cur=addWeeks(cur,step) } })
    }
    occs.sort((a,b)=>a.start-b.start)
  } else if(unit.frequency==="monthly"){ let cur=new Date(base); while(cur<=horizon&&occs.length<MAX){ occs.push(makeOcc(cur,dateKey(cur))); cur=addMonths(cur,1) } }
  return occs
}

// ─── Build agenda ─────────────────────────────────────────────────────────────
function buildAgenda(units,relEndDate){
  let all=units.flatMap(u=>expandUnit(u))
  if(relEndDate){ const cap=parseDate(relEndDate); all=all.filter(o=>o.start<=cap) }
  all.sort((a,b)=>a.start-b.start)
  const byDay={}
  all.forEach(occ=>{
    if(occ.svc.type==="overnight"&&occ.end){
      const nights=nightCount(occ.unit)
      for(let i=0;i<nights;i++){
        const day=addDays(occ.start,i)
        const k=dateKey(day)
        if(!byDay[k]) byDay[k]=[]
        byDay[k].push({...occ,nightIndex:i+1,totalNights:nights})
      }
    } else {
      const k=dateKey(occ.start); if(!byDay[k]) byDay[k]=[]; byDay[k].push(occ)
    }
  })
  return Object.entries(byDay).sort(([a],[b])=>a.localeCompare(b))
}

// ─── Style atoms ─────────────────────────────────────────────────────────────
const labelSt  ={display:"block",fontSize:14,fontWeight:600,color:R.navyMid,marginBottom:4,fontFamily,lineHeight:1.25}
const inputSt  ={width:"100%",padding:"10px 12px",border:`1.5px solid ${R.border}`,borderRadius:8,fontSize:14,fontFamily,color:R.navy,background:R.white,boxSizing:"border-box",lineHeight:1.25}
const btnPrimary={background:R.blue,color:"#fff",border:"none",borderRadius:99999,padding:"12px 24px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily,width:"100%",boxShadow:"0px 2px 12px rgba(27,31,35,0.24)",transition:"all 0.15s ease",lineHeight:1.5}
const btnGhost ={background:"#fff",color:R.navyMid,border:`2px solid ${R.border}`,borderRadius:99999,padding:"12px 24px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily,lineHeight:1.5}
const btnSmall={background:"#fff",color:R.navyMid,border:`2px solid ${R.border}`,borderRadius:99999,padding:"8px 16px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily,lineHeight:1.25}
const btnSmallDestructive={background:"#fff",color:R.red,border:`2px solid ${R.red}`,borderRadius:99999,padding:"8px 16px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily,lineHeight:1.25}
const btnDestructive={background:R.red,color:"#fff",border:"none",borderRadius:99999,padding:"12px 24px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily,boxShadow:"0px 2px 12px rgba(27,31,35,0.24)",lineHeight:1.5}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({label,active,onClick,small,danger}){
  const base={padding:small?"4px 10px":"10px 16px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily,lineHeight:1.25,transition:"all 0.12s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6}
  if(danger) return <button onClick={onClick} style={{...base,border:`2px solid ${R.red}`,background:R.redLight,color:R.red}}>{label}</button>
  if(active) return (
    <button onClick={onClick} style={{...base,border:`2px solid #2E67D1`,background:"#ECF1FB",color:R.navy}}>
      <svg width="16" height="16" viewBox="0 0 32 32" fill="#2E67D1"><path d="M26.191 4.412a1 1 0 1 1 1.618 1.176l-16 22a1 1 0 0 1-1.516.12l-6-6a1 1 0 1 1 1.414-1.415l5.173 5.172L26.19 4.412z"/></svg>
      {label}
    </button>
  )
  return <button onClick={onClick} style={{...base,border:`2px solid ${R.border}`,background:"#fff",color:R.gray}}>{label}</button>
}

// ─── CalInput ─────────────────────────────────────────────────────────────────
function CalInput({value, onChange, minDate, placeholder}){
  const sel=value?parseDate(value):null
  const today=new Date(); today.setHours(0,0,0,0)
  const minD=minDate?parseDate(minDate):today
  const [open,setOpen]=useState(false)
  const [alignRight,setAlignRight]=useState(false)
  const [viewYear,setViewYear]=useState(sel?sel.getFullYear():today.getFullYear())
  const [viewMonth,setViewMonth]=useState(sel?sel.getMonth():today.getMonth())
  const ref=useRef(null)
  useEffect(()=>{ if(!open)return; const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false) }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h) },[open])
  const handleToggle=()=>{ if(!open&&ref.current){ const rect=ref.current.getBoundingClientRect(); setAlignRight(rect.left+276>window.innerWidth) } setOpen(o=>!o) }
  const firstDay=new Date(viewYear,viewMonth,1); const cells=[]
  for(let i=0;i<firstDay.getDay();i++) cells.push(null)
  for(let d=1;d<=new Date(viewYear,viewMonth+1,0).getDate();d++) cells.push(d)
  const prevM=()=>viewMonth===0?(setViewMonth(11),setViewYear(viewYear-1)):setViewMonth(viewMonth-1)
  const nextM=()=>viewMonth===11?(setViewMonth(0),setViewYear(viewYear+1)):setViewMonth(viewMonth+1)
  const pick=day=>{ if(!day)return; const d=new Date(viewYear,viewMonth,day); if(minD&&d<minD)return; onChange(dateKey(d)); setOpen(false) }
  const label=sel?fmtDateLong(sel):(placeholder||"Select date…")
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={handleToggle} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${open?R.blue:R.border}`,borderRadius:8,fontSize:13,fontFamily,color:sel?R.navy:R.grayLight,background:"#fff",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,boxSizing:"border-box"}}>
        <span style={{fontSize:14}}>📅</span>
        <span style={{flex:1,fontWeight:sel?600:400}}>{label}</span>
        <span style={{color:R.grayLight,fontSize:10}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:alignRight?"auto":0,right:alignRight?0:"auto",zIndex:900,background:"#fff",borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:`1.5px solid ${R.border}`,width:276,padding:"14px 12px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button onClick={prevM} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:R.gray,padding:"2px 6px",borderRadius:6}}>‹</button>
            <span style={{fontWeight:600,fontSize:13,color:R.navy}}>{`${MONTHS[viewMonth]} ${viewYear}`}</span>
            <button onClick={nextM} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:R.gray,padding:"2px 6px",borderRadius:6}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
            {WEEKDAYS.map(w=><div key={w} style={{textAlign:"center",fontSize:10,fontWeight:600,color:R.gray,padding:"2px 0"}}>{w}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {cells.map((day,i)=>{
              if(!day) return <div key={"e"+i}/>
              const d=new Date(viewYear,viewMonth,day)
              const isSel=sel&&dateKey(d)===dateKey(sel)
              const dis=d<minD
              const tod=isToday(d)
              return(
                <button key={day} disabled={dis} onClick={()=>pick(day)}
                  style={{padding:"6px 0",borderRadius:8,border:"none",cursor:dis?"not-allowed":"pointer",fontSize:12,fontWeight:isSel?700:tod?600:400,background:isSel?R.blue:tod&&!isSel?R.blueLight:"transparent",color:dis?R.grayLight:isSel?"#fff":tod?R.blue:R.navy,opacity:dis?0.4:1,fontFamily}}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TimeInput ────────────────────────────────────────────────────────────────
function TimeInput({value, onChange, placeholder}){
  const [open,setOpen]=useState(false)
  const ref=useRef(null)
  useEffect(()=>{ if(!open)return; const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false) }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h) },[open])
  const HOURS=[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  const MINS=[0,15,30,45]
  const selH=value?parseInt(value.split(":")[0],10):null
  const selM=value?parseInt(value.split(":")[1],10):null
  const pick=(h,m)=>{ onChange(String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")); setOpen(false) }
  const fH=h=>`${h%12||12} ${h>=12?"PM":"AM"}`
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${open?R.blue:R.border}`,borderRadius:8,fontSize:13,fontFamily,color:value?R.navy:R.grayLight,background:"#fff",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,boxSizing:"border-box"}}>
        <span style={{fontSize:14}}>🕐</span>
        <span style={{flex:1,fontWeight:value?600:400}}>{value?fmtTime(value):(placeholder||"Select time…")}</span>
        <span style={{color:R.grayLight,fontSize:10}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:900,background:"#fff",borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:`1.5px solid ${R.border}`,width:240,padding:"12px"}}>
          <div style={{fontSize:10,fontWeight:600,color:R.gray,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Select time</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,maxHeight:196,overflowY:"auto"}}>
              <div style={{fontSize:10,color:R.grayLight,marginBottom:4,textAlign:"center",fontWeight:600}}>Hour</div>
              {HOURS.map(h=>(
                <button key={h} onClick={()=>pick(h,selM!==null?selM:0)}
                  style={{width:"100%",padding:"6px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:selH===h?700:400,background:selH===h?R.blue:"transparent",color:selH===h?"#fff":R.navy,fontFamily,textAlign:"center",marginBottom:1}}>
                  {fH(h)}
                </button>
              ))}
            </div>
            <div style={{width:58}}>
              <div style={{fontSize:10,color:R.grayLight,marginBottom:4,textAlign:"center",fontWeight:600}}>Min</div>
              {MINS.map(m=>(
                <button key={m} onClick={()=>pick(selH!==null?selH:9,m)}
                  style={{width:"100%",padding:"6px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:selM===m?700:400,background:selM===m?R.blue:"transparent",color:selM===m?"#fff":R.navy,fontFamily,textAlign:"center",marginBottom:1}}>
                  {String(m).padStart(2,"0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pet selector ─────────────────────────────────────────────────────────────
function PetSelector({pets, selectedIds, onChange}){
  const toggle=id=>{ const ids=selectedIds.includes(id)?selectedIds.filter(i=>i!==id):[...selectedIds,id]; if(ids.length) onChange(ids) }
  return(
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {pets.map(p=>{
        const on=selectedIds.includes(p.id)
        return(
          <button key={p.id} onClick={()=>toggle(p.id)} style={{padding:"10px 16px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",border:on?`2px solid #2E67D1`:`2px solid ${R.border}`,background:on?"#ECF1FB":"#fff",color:on?R.navy:R.gray,fontFamily,lineHeight:1.25,transition:"all 0.12s",display:"inline-flex",alignItems:"center",gap:6}}>
            {on&&<svg width="16" height="16" viewBox="0 0 32 32" fill="#2E67D1"><path d="M26.191 4.412a1 1 0 1 1 1.618 1.176l-16 22a1 1 0 0 1-1.516.12l-6-6a1 1 0 1 1 1.414-1.415l5.173 5.172L26.19 4.412z"/></svg>}
            {p.name}
          </button>
        )
      })}
    </div>
  )
}

// ─── Pet panel ────────────────────────────────────────────────────────────────
function PetPanel({pets, setPets, selectedIds, setSelectedIds, unitList, setUnitList, compact}){
  const [adding,setAdding]=useState(false)
  const [newName,setNewName]=useState("")
  const [newBreed,setNewBreed]=useState("")
  const [newEmoji,setNewEmoji]=useState("🐕")
  const addPet=()=>{
    if(!newName.trim()) return
    const p={id:Date.now(),name:newName.trim(),breed:newBreed.trim()||"",emoji:newEmoji}
    setPets(prev=>[...prev,p]); setSelectedIds(prev=>[...prev,p.id])
    if(setUnitList) setUnitList(prev=>prev.map(u=>({...u,petIds:[...new Set([...u.petIds,p.id])]})))
    setAdding(false); setNewName(""); setNewBreed(""); setNewEmoji("🐕")
  }
  const togglePet=id=>{
    const on=selectedIds.includes(id); if(on&&selectedIds.length<=1) return
    const next=on?selectedIds.filter(i=>i!==id):[...selectedIds,id]; setSelectedIds(next)
    if(on&&setUnitList){ setUnitList(prev=>prev.map(u=>{ if(u.petOverride) return u; const newPets=u.petIds.filter(i=>i!==id); return {...u,petIds:newPets.length?newPets:u.petIds} })) }
  }
  return(
    <div>
      {!compact&&<label style={labelSt}>Pets in this relationship</label>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:adding?12:0}}>
        {pets.map(p=>{
          const on=selectedIds.includes(p.id)
          return(
            <button key={p.id} onClick={()=>togglePet(p.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",borderRadius:10,border:`1.5px solid ${on?R.blue:R.border}`,background:on?R.blueLight:"#fff",cursor:"pointer",fontFamily,transition:"all 0.12s"}}>
              <span style={{fontSize:20}}>{p.emoji}</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:12,fontWeight:600,color:on?R.blue:R.navy,lineHeight:1.2}}>{p.name}</div>
                {p.breed&&<div style={{fontSize:10,color:R.gray,lineHeight:1}}>{p.breed}</div>}
              </div>
              {on&&<span style={{fontSize:11,color:R.blue}}>✓</span>}
            </button>
          )
        })}
        <button onClick={()=>setAdding(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:10,border:`1.5px dashed ${R.border}`,background:"#fff",cursor:"pointer",fontFamily,color:R.gray,fontSize:12,fontWeight:600}}>
          + Add pet
        </button>
      </div>
      {adding&&(
        <div style={{background:R.bg,borderRadius:10,padding:"12px",border:`1px solid ${R.border}`,marginTop:4}}>
          <div style={{fontSize:12,fontWeight:600,color:R.navy,marginBottom:10}}>New pet</div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            {PET_EMOJIS.map(e=><button key={e} onClick={()=>setNewEmoji(e)} style={{fontSize:20,padding:"4px",borderRadius:6,border:`1.5px solid ${newEmoji===e?R.blue:R.border}`,background:newEmoji===e?R.blueLight:"#fff",cursor:"pointer"}}>{e}</button>)}
          </div>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name (required)" style={{...inputSt,marginBottom:7,fontSize:13,padding:"8px 10px"}}/>
          <input value={newBreed} onChange={e=>setNewBreed(e.target.value)} placeholder="Breed (optional)" style={{...inputSt,marginBottom:10,fontSize:13,padding:"8px 10px"}}/>
          <div style={{display:"flex",gap:7}}>
            <button onClick={addPet} style={{...btnPrimary,padding:"8px",fontSize:13,borderRadius:8,flex:2}}>Add {newEmoji} {newName||"pet"}</button>
            <button onClick={()=>setAdding(false)} style={{...btnGhost,padding:"8px",fontSize:13,borderRadius:8,flex:1}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Unit editor ─────────────────────────────────────────────────────────────
function UnitEditor({unit, onChange, onRemove, onDuplicate, allUnits, allPets, showRemove=true, showChangeType=false, onChangeType}){
  const svc=SERVICES.find(s=>s.id===unit.serviceId)
  const overnight=(svc&&svc.type)==="overnight"
  const isDaycare=(svc&&svc.id)==="doggy_daycare"
  const conflict=overlaps(allUnits,unit)
  const repeats=unit.frequency!=="once"
  const isWeekly=unit.frequency==="weekly"
  const canRepeat=overnightCanRepeat(unit)
  const durationOpts=isDaycare?DURATION_DAYCARE:DURATION_SHORT
  const pets=allPets||PETS_SEED
  const togglePet=id=>{ const ids=unit.petIds.includes(id)?unit.petIds.filter(i=>i!==id):[...unit.petIds,id]; if(ids.length) onChange({...unit,petIds:ids,petOverride:true}) }
  const toggleWeekDay=d=>{ const days=unit.weekDays||[]; onChange({...unit,weekDays:days.includes(d)?days.filter(x=>x!==d):[...days,d]}) }
  return(
    <div style={{marginBottom:12}}>
      {conflict&&<div style={{fontSize:12,background:R.redLight,color:R.red,fontWeight:600,padding:"8px 12px",borderRadius:8,marginBottom:10}}>⚠ Conflict with another service</div>}
      {overnight?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><label style={labelSt}>Check-in</label><CalInput value={unit.startDate} onChange={v=>onChange({...unit,startDate:v})} placeholder="Check-in date"/></div>
          <div><label style={labelSt}>Check-out</label><CalInput value={unit.endDate} onChange={v=>onChange({...unit,endDate:v})} minDate={unit.startDate} placeholder="Check-out date"/></div>
        </div>
      ):(
        <div style={{marginBottom:14}}>
          <div style={{marginBottom:10}}><label style={labelSt}>Date</label><CalInput value={unit.startDate} onChange={v=>{ const updated={...unit,startDate:v}; if(isWeekly) updated.weekDays=[parseDate(v).getDay()]; onChange(updated) }} placeholder="Select date"/></div>
          <div><label style={labelSt}>Start time</label><TimeInput value={unit.startTime} onChange={v=>onChange({...unit,startTime:v})} placeholder="Select time"/>
            {unit.startTime&&unit.durationMins&&<div style={{fontSize:11,color:R.gray,marginTop:4}}>Ends at {fmtTime(endTimeFromDuration(unit.startTime,unit.durationMins))}</div>}
          </div>
        </div>
      )}
      {!overnight&&(
        <div style={{marginBottom:12}}>
          <label style={labelSt}>{isDaycare?"Hours":"Duration"}</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {durationOpts.map(d=><Chip key={d.mins} label={d.label} active={unit.durationMins===d.mins} onClick={()=>onChange({...unit,durationMins:d.mins})}/>)}
          </div>
        </div>
      )}
      <div style={{marginBottom:isWeekly&&!overnight?0:12}}>
        <label style={labelSt}>Frequency</label>
        {overnight?(
          canRepeat?(
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {FREQ.map(f=><Chip key={f.id} label={f.label} active={unit.frequency===f.id} onClick={()=>onChange({...unit,frequency:f.id,repeatEndDate:f.id==="once"?"":unit.repeatEndDate,weekDays:[],everyNWeeks:unit.everyNWeeks||1})}/>)}
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Chip label="One-time" active={true} onClick={()=>{}}/>
              <span style={{fontSize:11,color:R.gray}}>Stays over 7 nights can't repeat</span>
            </div>
          )
        ):(
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {FREQ.map(f=><Chip key={f.id} label={f.label} active={unit.frequency===f.id} onClick={()=>{ const wd=f.id==="weekly"?((unit.weekDays&&unit.weekDays.length)>0?unit.weekDays:[unit.startDate?parseDate(unit.startDate).getDay():new Date().getDay()]):[]; onChange({...unit,frequency:f.id,repeatEndDate:f.id==="once"?"":unit.repeatEndDate,weekDays:wd,everyNWeeks:unit.everyNWeeks||1}) }}/>)}
          </div>
        )}
      </div>
      {isWeekly&&overnight&&(
        <div style={{background:R.bg,borderRadius:10,padding:"12px 14px",margin:"10px 0 12px",border:`1px solid ${R.border}`}}>
          <label style={{...labelSt,marginBottom:7}}>Every</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[1,2,3,4].map(n=><Chip key={n} small label={n===1?"week":`${n} weeks`} active={(unit.everyNWeeks||1)===n} onClick={()=>onChange({...unit,everyNWeeks:n})}/>)}
          </div>
        </div>
      )}
      {isWeekly&&!overnight&&(
        <div style={{background:R.bg,borderRadius:10,padding:"12px 14px",margin:"10px 0 12px",border:`1px solid ${R.border}`}}>
          <div style={{marginBottom:10}}>
            <label style={{...labelSt,marginBottom:7}}>Repeat on</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {WEEKDAYS.map((d,i)=>{
                const active=(unit.weekDays||[]).includes(i)
                return <button key={i} onClick={()=>toggleWeekDay(i)} style={{width:38,height:38,borderRadius:"50%",border:active?"2px solid transparent":`2px solid ${R.border}`,background:active?R.blue:"#fff",color:active?"#fff":R.navyMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily,transition:"all 0.12s",boxShadow:active?"0px 2px 12px rgba(27,31,35,0.24)":"none"}}>{d}</button>
              })}
            </div>
            {(unit.weekDays||[]).length===0&&<div style={{fontSize:11,color:R.gray,marginTop:5}}>Defaults to same weekday as start date</div>}
            {unit.startDate&&(unit.weekDays||[]).length>0&&(()=>{ const b=parseDate(unit.startDate); const first=unit.weekDays.slice().sort((a,b2)=>a-b2).map(d=>addDays(b,((d-b.getDay())+7)%7)).sort((a,b2)=>a-b2)[0]; return <div style={{fontSize:11,color:R.blue,fontWeight:600,marginTop:5}}>📅 First: {fmtDateLong(first)}</div> })()}
          </div>
          <div>
            <label style={{...labelSt,marginBottom:7}}>Every</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[1,2,3,4].map(n=><Chip key={n} small label={n===1?"week":`${n} weeks`} active={(unit.everyNWeeks||1)===n} onClick={()=>onChange({...unit,everyNWeeks:n})}/>)}
            </div>
          </div>
        </div>
      )}
      {repeats&&(
        <div style={{marginBottom:12,background:R.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${R.border}`}}>
          <label style={{...labelSt,marginBottom:5}}>Series ends <span style={{fontWeight:400,color:R.gray}}>(optional)</span></label>
          <CalInput value={unit.repeatEndDate||""} onChange={v=>onChange({...unit,repeatEndDate:v})} minDate={unit.startDate} placeholder="No end date"/>
          <div style={{fontSize:11,color:R.gray,marginTop:5}}>{unit.repeatEndDate?`Stops after ${fmtDate(parseDate(unit.repeatEndDate))}`:"No end — continues until relationship ends"}</div>
        </div>
      )}
      <div>
        <label style={labelSt}>For which pets?</label>
        <PetSelector pets={pets} selectedIds={unit.petIds} onChange={ids=>onChange({...unit,petIds:ids,petOverride:true})}/>
        {unit.petOverride&&<div style={{fontSize:10,color:R.gray,marginTop:5}}>Custom pet selection</div>}
      </div>
    </div>
  )
}

// ─── Change-type picker ───────────────────────────────────────────────────────
function ChangeTypeSheet({unit, onConfirm, onClose}){
  const [targetId,setTargetId]=useState(unit.serviceId)
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:R.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{background:"#fff",padding:"18px 20px 14px",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${R.border}`,position:"sticky",top:0}}>
          <div style={{width:36,height:4,borderRadius:99,background:R.border,margin:"0 auto 14px"}}/>
          <h3 style={{margin:0,fontSize:17,fontWeight:600,color:R.navy,fontFamily}}>Change service type</h3>
          <p style={{margin:"4px 0 0",fontSize:12,color:R.gray,fontFamily}}>All other settings will be copied over</p>
        </div>
        <div style={{padding:"16px 20px 32px"}}>
          {SERVICES.map(s=>(
            <button key={s.id} onClick={()=>setTargetId(s.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:8,border:`1.5px solid ${targetId===s.id?R.blue:R.cardBorder}`,background:targetId===s.id?R.blueLight:"#fff",cursor:"pointer",fontFamily,textAlign:"left",width:"100%",marginBottom:8,transition:"all 0.1s"}}>
              <span style={{fontSize:22}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:targetId===s.id?R.blue:R.navy}}>{s.label}</div>
                <div style={{fontSize:12,color:R.gray,marginTop:1}}>{s.desc}</div>
              </div>
              {targetId===s.id&&<span style={{color:R.blue,fontWeight:600}}>✓</span>}
            </button>
          ))}
          <button onClick={()=>onConfirm(targetId)} style={{...btnPrimary,marginTop:4}}>Copy as {SERVICES.find(s=>s.id===targetId)&&SERVICES.find(s=>s.id===targetId).label} →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Add-service sheet ────────────────────────────────────────────────────────
function AddSheet({onAdd, onClose, existing, allPets}){
  const [step,setStep]=useState("pick")
  const [svc,setSvc]=useState(null)
  const [unit,setUnit]=useState(null)
  const conflict=unit?overlaps(existing,unit):false
  const canAdd=unit&&unit.startDate&&!conflict&&unit.petIds.length>0
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:R.white,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{background:R.white,padding:"18px 16px 8px",borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:1}}>
          <div style={{width:36,height:4,borderRadius:99,background:R.border,margin:"0 auto 24px"}}/>
          <h3 style={{margin:0,fontSize:18,fontWeight:600,color:R.navy,fontFamily}}>{step==="pick"?"Add a service":`${svc&&svc.label}`}</h3>
        </div>
        <div style={{padding:"8px 16px 36px"}}>
          {step==="pick"&&SERVICES.map(s=>(
            <Row
              key={s.id}
              label={s.label}
              sublabel={s.desc}
              leftItem={SERVICE_ICONS[s.id]}
              rightItem={<ChevronRightIcon />}
              onClick={()=>{setSvc(s);setUnit(defaultUnit(s.id,{petIds:(allPets||PETS_SEED).map(p=>p.id)}));setStep("configure")}}
            />
          ))}
          {step==="configure"&&unit&&<>
            <UnitEditor unit={unit} onChange={setUnit} onRemove={onClose} allUnits={existing} allPets={allPets} showRemove={false}/>
            <Button variant="primary" size="small" fullWidth disabled={!canAdd} onClick={()=>canAdd&&onAdd(unit)}>
              {conflict?"Fix conflict first":!unit.startDate?"Set a date to continue":"Add to request"}
            </Button>
            <Button variant="default" size="small" fullWidth onClick={()=>{setStep("pick");setSvc(null);setUnit(null)}} style={{marginTop:12}}>Go back</Button>
          </>}
        </div>
      </div>
    </div>
  )
}

// ─── Occurrence action sheet ──────────────────────────────────────────────────
function OccActionSheet({occ, allUnits, allPets, onSaveUnit, onSkip, onOverride, onOverrideFromDate, onCancel, onClose}){
  const [view,setView]=useState("actions")
  const [draft,setDraft]=useState({...occ.unit})
  const isRecurring=(occ.parentUnit||occ.unit).frequency!=="once"
  const overnight=occ.svc.type==="overnight"
  const endT=!overnight?endTimeFromDuration(occ.unit.startTime,occ.unit.durationMins):null
  const occPets=allPets.filter(p=>occ.unit.petIds.includes(p.id))
  const dateLabel=overnight
    ?`${fmtDate(occ.start)} to ${fmtDate(occ.end)} · ${occ.totalNights||nightCount(occ.unit)} night${(occ.totalNights||nightCount(occ.unit))!==1?"s":""}`
    :`${fmtRelDate(occ.start)} · ${fmtTime(occ.unit.startTime)} to ${fmtTime(endT)}`

  const headerRow=(
    <Row
      label={`${occ.svc.label}${occPets.length>0?`: ${occPets.map(p=>p.name).join(", ")}`:""}` }
      sublabel={dateLabel}
      rightItem={<PetAvatar size={48} images={occPets.map(p=>p.img)}/>}
      firstRow
    />
  )

  const simpleSheet=(content)=>(
    <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"8px 8px 0 0",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px rgba(0,0,0,0.18)",padding:"0 16px 24px"}}>
        <div style={{display:"flex",justifyContent:"center",paddingTop:8,marginBottom:24}}>
          <div style={{width:36,height:5,borderRadius:35,background:R.border}}/>
        </div>
        {content}
      </div>
    </div>
  )

  const scopeRow=(label,sublabel,onClick,danger)=>(
    <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,minHeight:56,paddingTop:8,paddingBottom:8,cursor:"pointer"}}>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontFamily,fontWeight:700,fontSize:16,color:danger?R.red:R.navy,margin:0,lineHeight:1.5}}>{label}</p>
        <p style={{fontFamily,fontSize:14,color:R.gray,margin:0,lineHeight:1.25}}>{sublabel}</p>
      </div>
      <ChevronRightIcon/>
    </div>
  )

  const handleCancelFromDate=()=>{
    const baseUnit=occ.parentUnit||occ.unit
    if(dateKey(occ.start)===baseUnit.startDate){ onCancel(baseUnit) }
    else { onSaveUnit({...baseUnit,repeatEndDate:dateKey(addDays(occ.start,-1))}) ; onClose() }
  }

  // ── Edit form ──
  if(view==="editForm") return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:R.white,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{background:R.white,padding:"18px 16px 8px",borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:1}}>
          <div style={{width:36,height:4,borderRadius:99,background:R.border,margin:"0 auto 24px"}}/>
          <h3 style={{margin:0,fontSize:18,fontWeight:600,color:R.navy,fontFamily}}>Edit service</h3>
        </div>
        <div style={{padding:"8px 16px 36px"}}>
          <UnitEditor unit={draft} onChange={setDraft} onRemove={()=>{}} allUnits={allUnits.filter(u=>u.id!==draft.id)} allPets={allPets} showRemove={false}/>
          <Button variant="primary" size="small" fullWidth onClick={()=>isRecurring?setView("editScope"):(onSaveUnit(draft),onClose())}>Save changes</Button>
          <Button variant="default" size="small" fullWidth onClick={()=>setView("actions")} style={{marginTop:12}}>Go back</Button>
        </div>
      </div>
    </div>
  )

  // ── Edit scope picker — shown after editing, for recurring only ──
  if(view==="editScope") return simpleSheet(<>
    {headerRow}
    {scopeRow("This occurrence only",`Apply changes to ${fmtRelDate(occ.start)} only — series continues unchanged`,()=>{onOverride(occ,draft);onClose()})}
    {scopeRow("From this date onwards",`Update the rule starting ${fmtRelDate(occ.start)}`,()=>{onOverrideFromDate(occ,draft);onClose()})}
    <div style={{marginTop:8}}><Button variant="default" size="small" fullWidth onClick={()=>setView("editForm")}>Go back</Button></div>
  </>)

  // ── Remove scope picker (recurring only) ──
  if(view==="removeScope") return simpleSheet(<>
    {headerRow}
    {scopeRow("Skip this occurrence",`Only ${fmtRelDate(occ.start)} is skipped — series continues`,()=>{onSkip(occ.key,true);onClose()})}
    {scopeRow("Cancel from this date onwards",`End the rule starting ${fmtRelDate(occ.start)}`,handleCancelFromDate,true)}
    <div style={{marginTop:8}}><Button variant="default" size="small" fullWidth onClick={()=>setView("actions")}>Go back</Button></div>
  </>)

  // ── Main actions ──
  return simpleSheet(<>
    {headerRow}
    <div onClick={()=>setView("editForm")} style={{display:"flex",alignItems:"center",gap:12,minHeight:56,paddingTop:8,paddingBottom:8,cursor:"pointer"}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill={R.navy} style={{flexShrink:0}}>
        <path d="M2.52167 14.1271L3.87289 15.4783L5.18225 14.8964L16.4101 3.66853C16.9841 3.09453 16.9841 2.16389 16.4101 1.58988C15.8361 1.01588 14.9055 1.01588 14.3315 1.58988L13.2921 2.62921L14.6213 3.95838L13.8015 4.77818L12.4723 3.44902L3.1036 12.8178L2.52167 14.1271ZM13.5117 0.770077C14.5384-0.256692 16.2032-0.256692 17.2299 0.770077C18.2567 1.79685 18.2567 3.46157 17.2299 4.48834L5.964 15.7543C5.88854 15.8297 5.79982 15.8907 5.7023 15.934L1.22291 17.9248C0.998074 18.0248 0.741433 18.0248 0.516601 17.9248C0.07776 17.7298-0.11988 17.2159 0.075161 16.7771L2.066 12.2977C2.10935 12.2002 2.17027 12.1115 2.24574 12.036L13.5117 0.770077Z"/>
      </svg>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontFamily,fontWeight:700,fontSize:16,color:R.navy,margin:0,lineHeight:1.5}}>{isRecurring?"Edit service":"Edit service"}</p>
        <p style={{fontFamily,fontSize:14,color:R.gray,margin:0,lineHeight:1.25}}>{isRecurring?"Change schedule, pets or frequency":"Update date, time or pets"}</p>
      </div>
      <ChevronRightIcon/>
    </div>
    <div onClick={()=>isRecurring?setView("removeScope"):(onCancel(occ.unit),onClose())} style={{display:"flex",alignItems:"center",gap:12,minHeight:56,paddingTop:8,paddingBottom:8,cursor:"pointer"}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill={R.red} style={{flexShrink:0}}>
        <path d="M13 2a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h1v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2h-7V3a1 1 0 0 0-1-1h-6zm-1 6a1 1 0 0 1 1 1v14a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1zm6 0a1 1 0 0 1 1 1v14a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1z"/>
      </svg>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontFamily,fontWeight:700,fontSize:16,color:R.red,margin:0,lineHeight:1.5}}>Cancel service</p>
        <p style={{fontFamily,fontSize:14,color:R.gray,margin:0,lineHeight:1.25}}>{isRecurring?"Remove one or all occurrences":"Remove and refund this booking"}</p>
      </div>
    </div>
    <div style={{marginTop:8}}><Button variant="default" size="small" fullWidth onClick={onClose}>Close</Button></div>
  </>)
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({unit, units, onDelete, onDeleteKeepPaid, onRefundAndDelete, onClose}){
  const svc=SERVICES.find(s=>s.id===unit.serviceId)
  const isOnce=unit.frequency==="once"
  const paidThru=getPaidThruSunday(units)
  const occs=expandUnit(unit)
  const today=new Date(); today.setHours(0,0,0,0)
  const paidOccs=occs.filter(o=>!o.skipped&&isPaidOcc(o.start,paidThru))
  const unpaidUpcoming=occs.filter(o=>!o.skipped&&o.start>=today&&!isPaidOcc(o.start,paidThru))
  const hasPaid=paidOccs.length>0

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:R.white,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{background:R.white,padding:"18px 16px 8px",borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:1}}>
          <div style={{width:36,height:4,borderRadius:99,background:R.border,margin:"0 auto 24px"}}/>
          <h3 style={{margin:0,fontSize:18,fontWeight:600,color:R.navy,fontFamily}}>Cancel service</h3>
        </div>
        <div style={{padding:"8px 16px 36px",display:"flex",flexDirection:"column",gap:12}}>
          <p style={{margin:0,fontSize:14,color:R.gray,fontFamily,lineHeight:1.5}}>
            {isOnce
              ?<>This will remove <strong style={{color:R.navy}}>{svc&&svc.label}</strong> on {unit.startDate?fmtDate(parseDate(unit.startDate)):"(no date)"}. {hasPaid&&"A refund will be issued per Rover's cancellation policy."}</>
              :<>This will remove the <strong style={{color:R.navy}}>{svc&&svc.label}</strong> rule and cancel all upcoming sessions. {hasPaid&&"Paid sessions will be refunded per Rover's cancellation policy."}</>
            }
          </p>
          {!isOnce&&(hasPaid||unpaidUpcoming.length>0)&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {hasPaid&&(
                <div style={{background:R.greenLight,border:`1.5px solid ${R.green}44`,borderRadius:8,padding:"10px 14px"}}>
                  <div style={{fontSize:13,color:R.navy,lineHeight:1.5,fontFamily}}><strong>{paidOccs.length} paid session{paidOccs.length!==1?"s":""}</strong> — will be refunded</div>
                </div>
              )}
              {unpaidUpcoming.length>0&&(
                <div style={{background:R.redLight,border:`1.5px solid ${R.red}44`,borderRadius:8,padding:"10px 14px"}}>
                  <div style={{fontSize:13,color:R.navy,lineHeight:1.5,fontFamily}}><strong>{unpaidUpcoming.length} upcoming session{unpaidUpcoming.length!==1?"s":""}</strong> — will be cancelled</div>
                </div>
              )}
            </div>
          )}
          <Button variant="destructive" size="small" fullWidth onClick={()=>{hasPaid?onRefundAndDelete(unit.id):onDelete(unit.id);onClose()}}>
            {hasPaid?"Cancel and refund":"Cancel service"}
          </Button>
          {!isOnce&&hasPaid&&(
            <Button variant="default" size="small" fullWidth onClick={()=>{onDeleteKeepPaid(unit.id);onClose()}}>Cancel upcoming, keep paid</Button>
          )}
          <Button variant="default" size="small" fullWidth onClick={onClose}>Go back</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Manage sheet ─────────────────────────────────────────────────────────────
function ManageSheet({units, pets, relEndDate, onUnitsChange, onRelEndDateChange, onPetsChange, onUnitListChange, onClose}){
  const [showAdd,setShowAdd]=useState(false)
  const [editingUnit,setEditingUnit]=useState(null)
  const [changeTypeFor,setChangeTypeFor]=useState(null)
  const [confirmDelete,setConfirmDelete]=useState(null)
  const [localEnd,setLocalEnd]=useState(relEndDate||"")
  const [endSaved,setEndSaved]=useState(true)
  const relEndErr=localEnd&&units.some(u=>u.startDate&&parseDate(localEnd)<parseDate(u.startDate))
  const saveEnd=()=>{ onRelEndDateChange(localEnd); setEndSaved(true) }
  const oneTime=units.filter(u=>u.frequency==="once")
  const recurring=units.filter(u=>u.frequency!=="once")
  const updateUnit=u=>{ onUnitsChange(units.map(x=>x.id===u.id?u:x)); setEditingUnit(null) }
  const removeUnit=id=>onUnitsChange(units.filter(x=>x.id!==id))
  const deleteKeepPaid=id=>{
    const u=units.find(x=>x.id===id); if(!u) return
    const paidThru=getPaidThruSunday(units)
    const occs=expandUnit(u).filter(o=>!o.skipped&&isPaidOcc(o.start,paidThru))
    const keptUnits=occs.map(o=>({...defaultUnit(u.serviceId,{petIds:u.petIds,startDate:dateKey(o.start),endDate:u.endDate?dateKey(o.end||o.start):"",startTime:u.startTime,durationMins:u.durationMins}),frequency:"once"}))
    onUnitsChange([...units.filter(x=>x.id!==id),...keptUnits])
  }
  const refundAndDelete=id=>onUnitsChange(units.filter(x=>x.id!==id))
  const dupWithType=(u,newSvcId)=>{ onUnitsChange([...units,cloneUnit(u,newSvcId)]); setChangeTypeFor(null) }

  const UnitRow=({u})=>{
    const svc=SERVICES.find(s=>s.id===u.serviceId)
    const overnight=(svc&&svc.type)==="overnight"
    const upets=pets.filter(p=>u.petIds.includes(p.id))
    const nites=overnight?nightCount(u):0
    const skips=(u.skippedKeys||[]).length
    const overrideCount=u.overrides?Object.keys(u.overrides).length:0
    const weeklyLabel=u.frequency==="weekly"&&!overnight&&(u.weekDays||[]).length>0?(u.weekDays.slice().sort((a,b)=>a-b).map(d=>WEEKDAYS[d]).join(", ")):null
    return(
      <div style={{background:"#fff",borderRadius:8,padding:"13px 14px",marginBottom:8,border:`1.5px solid ${R.cardBorder}`,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
              <span style={{fontSize:16}}>{svc&&svc.icon}</span>
              <span style={{fontWeight:600,fontSize:13,color:R.navy,fontFamily}}>{svc&&svc.label}</span>
              {u.frequency!=="once"&&<span style={{fontSize:10,background:R.blueLight,color:R.blue,fontWeight:600,padding:"1px 7px",borderRadius:99}}>↻ {u.frequency}{u.everyNWeeks>1?` ×${u.everyNWeeks}`:""}</span>}
            </div>
            <div style={{fontSize:12,color:R.gray,lineHeight:1.6,fontFamily}}>
              {overnight?`${fmtDate(parseDate(u.startDate))} – ${fmtDate(parseDate(u.endDate||u.startDate))} · ${nites} night${nites!==1?"s":""}`:
                `${fmtDate(parseDate(u.startDate))}${u.startTime?" · "+fmtTime(u.startTime):""} · ${durLabel(svc,u.durationMins)}`}
              {weeklyLabel&&` · ${weeklyLabel}`}{u.repeatEndDate&&` · ends ${fmtDate(parseDate(u.repeatEndDate))}`}
            </div>
            <div style={{fontSize:11,color:R.gray,marginTop:2,fontFamily}}>{upets.map(p=>p.emoji+" "+p.name).join(", ")||"No pets"}</div>
            {skips>0&&<div style={{fontSize:10,color:R.amber,marginTop:2,fontFamily}}>⏸ {skips} date{skips!==1?"s":""} skipped</div>}
            {overrideCount>0&&<div style={{fontSize:10,color:R.purple,marginTop:2,fontFamily}}>✦ {overrideCount} override{overrideCount!==1?"s":""}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditingUnit(u)} style={{...btnSmall,flex:2}}>✎ Edit</button>
          <button onClick={()=>setChangeTypeFor(u)} style={{...btnSmall,flex:2}}>⧉ Copy</button>
          <button onClick={()=>setConfirmDelete(u)} style={{...btnSmallDestructive,flex:1}}>✕</button>
        </div>
      </div>
    )
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:R.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{background:"#fff",padding:"18px 20px 14px",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${R.border}`,position:"sticky",top:0,zIndex:10}}>
          <div style={{width:36,height:4,borderRadius:99,background:R.border,margin:"0 auto 14px"}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <h3 style={{margin:0,fontSize:17,fontWeight:600,color:R.navy,fontFamily}}>Manage relationship</h3>
              <p style={{margin:"2px 0 0",fontSize:12,color:R.gray,fontFamily}}>
                {oneTime.length>0&&recurring.length>0?`${oneTime.length} service${oneTime.length!==1?"s":""}, ${recurring.length} rule${recurring.length!==1?"s":""}`:
                  oneTime.length>0?`${oneTime.length} service${oneTime.length!==1?"s":""}`:
                  recurring.length>0?`${recurring.length} rule${recurring.length!==1?"s":""}`:
                  units.length+" item"+(units.length!==1?"s":"")}
              </p>
            </div>
            <button onClick={()=>setShowAdd(true)} style={{...btnGhost,padding:"8px 14px",fontSize:12,fontWeight:600,borderColor:R.blue,color:R.blue}}>+ Add</button>
          </div>
        </div>
        <div style={{padding:"16px 20px 36px"}}>
          <div style={{background:"#fff",borderRadius:8,padding:"14px 16px",marginBottom:20,border:`1.5px solid ${R.cardBorder}`}}>
            <PetPanel pets={pets} setPets={onPetsChange} selectedIds={pets.map(p=>p.id)} setSelectedIds={()=>{}} unitList={units} setUnitList={onUnitListChange} compact/>
          </div>
          {oneTime.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:R.gray,letterSpacing:0.8,textTransform:"uppercase",marginBottom:8,fontFamily}}>One-time services</div>
              {oneTime.map(u=><UnitRow key={u.id} u={u}/>)}
            </div>
          )}
          {recurring.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:R.gray,letterSpacing:0.8,textTransform:"uppercase",marginBottom:8,fontFamily}}>Recurring rules</div>
              {recurring.map(u=><UnitRow key={u.id} u={u}/>)}
            </div>
          )}
          {units.length===0&&(
            <div style={{textAlign:"center",padding:"32px 0",color:R.grayLight}}>
              <div style={{fontSize:28,marginBottom:8}}>📋</div>
              <div style={{fontSize:14,fontWeight:600,fontFamily}}>No services yet</div>
              <div style={{fontSize:12,marginTop:4,fontFamily}}>Tap + Add to create your first service</div>
            </div>
          )}
          <div style={{background:"#fff",borderRadius:8,padding:"14px 16px",border:`1.5px solid ${relEndErr?R.red:R.cardBorder}`}}>
            <label style={{...labelSt,marginBottom:8}}>Relationship end date <span style={{fontWeight:400,color:R.gray}}>(optional)</span></label>
            <CalInput value={localEnd} onChange={v=>{setLocalEnd(v);setEndSaved(false)}} placeholder="No end date — ongoing"/>
            {relEndErr&&<div style={{fontSize:11,color:R.red,fontWeight:600,marginBottom:8,fontFamily}}>⚠ Must be after all service start dates</div>}
            <div style={{fontSize:11,color:R.gray,marginBottom:10,fontFamily}}>{localEnd?`Repeating services stop after ${fmtDate(parseDate(localEnd))}`:"No end date — ongoing until manually ended"}</div>
            <button onClick={saveEnd} disabled={endSaved||!!relEndErr} style={{...btnPrimary,background:endSaved||relEndErr?R.border:R.blue,color:endSaved||relEndErr?R.gray:"#fff",boxShadow:"none",cursor:endSaved||relEndErr?"not-allowed":"pointer",padding:"10px"}}>
              {endSaved?"End date saved ✓":"Save end date"}
            </button>
          </div>
        </div>
        {editingUnit&&(
          <div style={{position:"fixed",inset:0,background:"rgba(10,18,30,0.5)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setEditingUnit(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:R.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
              <div style={{background:"#fff",padding:"18px 20px 14px",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${R.border}`,position:"sticky",top:0,zIndex:1}}>
                <div style={{width:36,height:4,borderRadius:99,background:R.border,margin:"0 auto 14px"}}/>
                <button onClick={()=>setEditingUnit(null)} style={{...btnGhost,padding:"6px 12px",fontSize:12,marginBottom:12}}>← Back</button>
                <h3 style={{margin:0,fontSize:17,fontWeight:600,color:R.navy,fontFamily}}>{editingUnit.frequency==="once"?"Edit service":"Edit rule"}</h3>
              </div>
              <div style={{padding:"16px 20px 28px"}}>
                <UnitEditor unit={editingUnit} onChange={setEditingUnit} onRemove={()=>{removeUnit(editingUnit.id);setEditingUnit(null)}} allUnits={units.filter(u=>u.id!==editingUnit.id)} allPets={pets} showRemove={true}/>
                <button onClick={()=>updateUnit(editingUnit)} style={btnPrimary}>Save changes</button>
              </div>
            </div>
          </div>
        )}
        {changeTypeFor&&<ChangeTypeSheet unit={changeTypeFor} onConfirm={id=>dupWithType(changeTypeFor,id)} onClose={()=>setChangeTypeFor(null)}/>}
        {showAdd&&<AddSheet onAdd={u=>{onUnitsChange([...units,u]);setShowAdd(false)}} onClose={()=>setShowAdd(false)} existing={units} allPets={pets}/>}
        {confirmDelete&&<DeleteConfirmDialog unit={confirmDelete} units={units} onDelete={id=>{removeUnit(id)}} onDeleteKeepPaid={deleteKeepPaid} onRefundAndDelete={refundAndDelete} onClose={()=>setConfirmDelete(null)}/>}
      </div>
    </div>
  )
}

// ─── Agenda view ──────────────────────────────────────────────────────────────
function AgendaView({agenda, pets, relEndDate, paidThruSunday, onTap}){
  const byMonth=[]
  agenda.forEach(([dayKey,occs])=>{
    const d=parseDate(dayKey)
    const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`
    const last=byMonth[byMonth.length-1]
    if(!last||last.mk!==mk) byMonth.push({mk,label:fmtMonthYear(d),entries:[]})
    byMonth[byMonth.length-1].entries.push([dayKey,occs])
  })
  let lastBillingWeek=null
  return(
    <div>

      {agenda.length===0&&(
        <div style={{textAlign:"center",padding:"48px 20px",color:R.grayLight}}>
          <div style={{fontSize:32,marginBottom:8}}>📅</div>
          <div style={{fontSize:14,fontWeight:600,fontFamily}}>No upcoming services</div>
        </div>
      )}
      {byMonth.map(({mk,label,entries})=>{
        const total=entries.reduce((n,[,o])=>n+o.length,0)
        return(
          <div key={mk} style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:13,color:R.navyMid,letterSpacing:0.3,fontFamily}}>{label}</span>
              <div style={{flex:1,height:1,background:R.border}}/>
              <span style={{fontSize:11,color:R.gray,fontWeight:600,fontFamily}}>{total} event{total!==1?"s":""}</span>
            </div>
            {entries.map(([dayKey,occs],groupIdx)=>{
              const d=parseDate(dayKey)
              const today=isToday(d), past=isPast(d)
              const isLastEntry=groupIdx===entries.length-1&&mk===byMonth[byMonth.length-1].mk
              const showEndMarker=relEndDate&&isLastEntry
              const thisWeekMon=getWeekMonday(d)
              const thisWeekKey=dateKey(thisWeekMon)
              let showBillingDivider=false, showPaidDivider=false
              if(thisWeekKey!==lastBillingWeek){ const todayMid=new Date(new Date().setHours(0,0,0,0)); if(thisWeekMon<=todayMid) showPaidDivider=true; else showBillingDivider=true; lastBillingWeek=thisWeekKey }
              return(
                <div key={dayKey} style={{marginBottom:16,opacity:past?0.55:1}}>
                  {showPaidDivider&&(
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <div style={{flex:1,height:1,background:R.greenLight,borderTop:`1px dashed ${R.brand}`}}/>
                      <div style={{display:"flex",alignItems:"center",gap:5,background:R.greenLight,border:`1px solid ${R.brand}`,borderRadius:99,padding:"4px 12px",whiteSpace:"nowrap"}}>
                        <span style={{fontSize:11}}>✓</span>
                        <span style={{fontSize:11,fontWeight:600,color:R.brand,fontFamily}}>Paid on {fmtDate(thisWeekMon)}</span>
                      </div>
                      <div style={{flex:1,height:1,background:R.greenLight,borderTop:`1px dashed ${R.brand}`}}/>
                    </div>
                  )}
                  {showBillingDivider&&(
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <div style={{flex:1,height:1,background:R.purpleLight,borderTop:`1px dashed #C4B5FD`}}/>
                      <div style={{display:"flex",alignItems:"center",gap:5,background:R.purpleLight,border:`1px solid #C4B5FD`,borderRadius:99,padding:"4px 12px",whiteSpace:"nowrap"}}>
                        <span style={{fontSize:11}}>💳</span>
                        <span style={{fontSize:11,fontWeight:600,color:R.purple,fontFamily}}>Charged on {fmtDate(thisWeekMon)}</span>
                      </div>
                      <div style={{flex:1,height:1,background:R.purpleLight,borderTop:`1px dashed #C4B5FD`}}/>
                    </div>
                  )}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:46,height:54,borderRadius:8,flexShrink:0,background:today?R.navy:past?R.bg:R.white,border:`1.5px solid ${today?R.navy:R.cardBorder}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:today?"0 2px 10px rgba(26,35,50,0.18)":"none"}}>
                      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1,color:today?"#fff":R.gray,fontFamily}}>{DAYS_S[d.getDay()]}</div>
                      <div style={{fontSize:20,fontWeight:700,lineHeight:1.2,color:today?"#fff":R.navy,fontFamily}}>{d.getDate()}</div>
                    </div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:R.navy,fontFamily}}>
                        {fmtDateLong(d)}
                        {today&&<span style={{marginLeft:6,fontSize:10,background:R.blue,color:"#fff",padding:"1px 7px",borderRadius:99,fontWeight:600}}>Today</span>}
                      </div>
                      <div style={{fontSize:11,color:R.gray,marginTop:1,fontFamily}}>{occs.length} service{occs.length!==1?"s":""}</div>
                    </div>
                  </div>
                  {occs.map(occ=>{
                    const isSkipped=occ.skipped, overnight=occ.svc.type==="overnight"
                    const endT=!overnight?endTimeFromDuration(occ.unit.startTime,occ.unit.durationMins):null
                    const occPets=pets.filter(p=>occ.unit.petIds.includes(p.id))
                    return(
                      <div key={`${occ.key}-${occ.nightIndex||0}`} onClick={()=>onTap(occ)} style={{background:isSkipped?R.disabled:R.white,borderRadius:8,marginBottom:8,cursor:"pointer",boxShadow:"0px 1px 4px 0px rgba(27,31,35,0.24)",overflow:"hidden",opacity:isSkipped?0.6:1}}>
                        <div style={{padding:"16px"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontWeight:700,fontSize:16,color:isSkipped?R.disabledText:R.navy,fontFamily,lineHeight:1.5}}>
                                {occ.svc.label}{occPets.length>0&&`: ${occPets.map(p=>p.name).join(", ")}`}
                              </div>
                              <div style={{fontSize:14,color:R.gray,fontFamily,lineHeight:1.4}}>
                                {overnight
                                  ?`${fmtDate(occ.start)} to ${fmtDate(occ.end)} · ${occ.nightIndex} of ${occ.totalNights} night${occ.totalNights!==1?"s":""}`
                                  :`${fmtRelDate(occ.start)} · ${fmtTime(occ.unit.startTime)} to ${fmtTime(endT)}`}
                              </div>
                            </div>
                            <PetAvatar size={48} images={occPets.map(p=>p.img)} />
                          </div>
                          {(isSkipped||occ.isOverride||(()=>{const pu=occ.parentUnit||occ.unit;return pu.frequency!=="once"})())&&(
                            <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginTop:8}}>
                              {isSkipped&&<span style={{fontSize:10,background:"#DDD",color:"#888",fontWeight:600,padding:"2px 7px",borderRadius:99}}>Skipped</span>}
                              {occ.isOverride&&!isSkipped&&<span style={{fontSize:10,background:R.amberLight,color:"#7A5800",fontWeight:600,padding:"2px 7px",borderRadius:99}}>✦ Override</span>}
                              {(()=>{
                                const pu=occ.parentUnit||occ.unit
                                if(pu.frequency==="once") return null
                                const overnight2=occ.svc.type==="overnight"
                                const wdLabel=!overnight2&&pu.frequency==="weekly"&&(pu.weekDays||[]).length>0?pu.weekDays.slice().sort((a,b)=>a-b).map(dd=>WEEKDAYS[dd]).join(", "):null
                                return <span style={{fontSize:10,background:isSkipped?"#EEE":R.blueLight,color:isSkipped?R.gray:R.blue,fontWeight:600,padding:"2px 8px",borderRadius:99}}>↻ {pu.frequency}{pu.everyNWeeks>1?` ×${pu.everyNWeeks}`:""}{wdLabel?` · ${wdLabel}`:""}</span>
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {showEndMarker&&(
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
      <div style={{height:80}}/>
    </div>
  )
}

// ─── RelationshipScreen ───────────────────────────────────────────────────────
export default function RelationshipScreen({ initialPets, initialUnits }){
  const [pets,       setPets]       = useState(initialPets || PETS_SEED)
  const [units,      setUnits]      = useState(initialUnits || [])
  const [relEndDate, setRelEndDate] = useState("")
  const [showAdd,    setShowAdd]    = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [activeOcc,  setActiveOcc]  = useState(null)
  const [cancelUnit,       setCancelUnit]       = useState(null)
  const [pastWeeksVisible,  setPastWeeksVisible]  = useState(0)
  const [currentWeekHidden, setCurrentWeekHidden] = useState(false)
  const [isBelowToday,      setIsBelowToday]      = useState(false)
  const PAST_PAGE   = 2
  const WEEK_HEIGHT = 150  // px — approximate height of one week's entries
  const scrollRef   = useRef(null)
  const upcomingRef = useRef(null)

  const checkScrollPosition=()=>{
    if(!scrollRef.current||!upcomingRef.current) return
    const cRect=scrollRef.current.getBoundingClientRect()
    const aTop=upcomingRef.current.getBoundingClientRect().top
    setIsBelowToday(aTop<cRect.top)
    setCurrentWeekHidden(aTop<cRect.top-WEEK_HEIGHT||aTop>cRect.bottom)
  }

  useEffect(()=>{
    checkScrollPosition()
    window.addEventListener('resize', checkScrollPosition)
    return ()=>window.removeEventListener('resize', checkScrollPosition)
  },[pastWeeksVisible, units])

  const updateUnit=u=>setUnits(prev=>prev.map(x=>x.id===u.id?u:x))

  const skipOccurrence=(occKey,skip)=>{
    setUnits(prev=>prev.map(u=>{
      const occs=expandUnit(u)
      if(!occs.find(o=>o.key===occKey)) return u
      const dayKey2=occKey.replace(`${u.id}-`,"")
      const keys=u.skippedKeys||[]
      return {...u,skippedKeys:skip?[...new Set([...keys,dayKey2])]:keys.filter(k=>k!==dayKey2)}
    }))
  }

  const overrideOccurrence=(occ,draft)=>{
    const dk=dateKey(occ.start)
    const parentId=occ.parentUnit?occ.parentUnit.id:occ.unit.id
    setUnits(prev=>prev.map(u=>{
      if(u.id!==parentId) return u
      const overrides={...(u.overrides||{})}
      overrides[dk]={serviceId:draft.serviceId,startTime:draft.startTime,durationMins:draft.durationMins,petIds:draft.petIds}
      return {...u,overrides}
    }))
  }

  const overrideFromDate=(occ,draft)=>{
    const dk=dateKey(occ.start)
    const parentId=occ.parentUnit?occ.parentUnit.id:occ.unit.id
    setUnits(prev=>{
      const parent=prev.find(u=>u.id===parentId); if(!parent) return prev
      // End the old rule the day before this occurrence
      const updated=prev.map(u=>u.id!==parentId?u:{...u,repeatEndDate:dateKey(addDays(occ.start,-1))})
      // Start a new rule from this date using all draft values
      const newUnit={
        ...defaultUnit(draft.serviceId,{
          petIds:draft.petIds,
          startDate:dk,
          startTime:draft.startTime,
          durationMins:draft.durationMins,
          frequency:draft.frequency,
          weekDays:draft.weekDays,
          everyNWeeks:draft.everyNWeeks,
        }),
        // Inherit the original rule's end date if it had one
        repeatEndDate:parent.repeatEndDate||"",
        endDate:parent.endDate||"",
      }
      return [...updated,newUnit]
    })
  }

  const paidThruSunday=getPaidThruSunday(units)
  const agenda=buildAgenda(units,relEndDate)
  const totalOccs=agenda.reduce((a,[,o])=>a+o.length,0)
  const allPastEntries=agenda.filter(([dk])=>isPast(parseDate(dk)))
  const allUpcoming=agenda.filter(([dk])=>!isPast(parseDate(dk)))
  const pastWeekGroups=[];let _lastWk=null
  allPastEntries.forEach(entry=>{ const wk=dateKey(getWeekMonday(parseDate(entry[0]))); if(wk!==_lastWk){pastWeekGroups.push([]);_lastWk=wk}; pastWeekGroups[pastWeekGroups.length-1].push(entry) })
  const totalPastWeeks=pastWeekGroups.length
  const hiddenPastWeeks=Math.max(0,totalPastWeeks-pastWeeksVisible)
  const visiblePastEntries=pastWeeksVisible>0?pastWeekGroups.slice(-pastWeeksVisible).flat():[]

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:R.bg,position:"relative"}}>
      <div ref={scrollRef} onScroll={checkScrollPosition} className="hide-scrollbar" style={{flex:1,overflowY:"auto",padding:"16px 16px 0"}}>
        {hiddenPastWeeks>0&&(
          <Button variant="flat" onClick={()=>setPastWeeksVisible(v=>v+PAST_PAGE)} style={{width:"100%",marginBottom:12}}>
            Show {Math.min(hiddenPastWeeks,PAST_PAGE)} older week{Math.min(hiddenPastWeeks,PAST_PAGE)!==1?"s":""}
          </Button>
        )}
        {visiblePastEntries.length>0&&(
          <AgendaView agenda={visiblePastEntries} pets={pets} relEndDate={relEndDate} paidThruSunday={paidThruSunday} onTap={setActiveOcc}/>
        )}
        <div ref={upcomingRef}/>
        <AgendaView agenda={allUpcoming} pets={pets} relEndDate={relEndDate} paidThruSunday={paidThruSunday} onTap={setActiveOcc}/>
      </div>
      {currentWeekHidden&&(
        <div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:10,pointerEvents:"auto"}}>
          <Button variant="default" size="small" onClick={()=>upcomingRef.current?.scrollIntoView({behavior:"smooth",block:"start"})}>{isBelowToday?"Current week ↑":"Current week ↓"}</Button>
        </div>
      )}

      <div style={{padding:"12px 16px 20px",background:`linear-gradient(to top,${R.bg} 60%,transparent)`,flexShrink:0}}>
        <div style={{display:"flex",gap:12}}>
          <Button variant="primary" size="small" onClick={()=>setShowAdd(true)} style={{flex:2}}>Add a service</Button>
          <Button variant="default" size="small" onClick={()=>setShowManage(true)} style={{flex:1}}>Manage</Button>
        </div>
      </div>

      {showAdd&&<AddSheet onAdd={u=>{setUnits(prev=>[...prev,{...u,petIds:u.petIds.length?u.petIds:pets.map(p=>p.id)}]);setShowAdd(false)}} onClose={()=>setShowAdd(false)} existing={units} allPets={pets}/>}
      {showManage&&<ManageSheet units={units} pets={pets} relEndDate={relEndDate} onUnitsChange={setUnits} onRelEndDateChange={setRelEndDate} onPetsChange={setPets} onUnitListChange={setUnits} onClose={()=>setShowManage(false)}/>}
      {activeOcc&&<OccActionSheet occ={activeOcc} allUnits={units} allPets={pets}
        onSaveUnit={u=>{updateUnit(u);setActiveOcc(null)}}
        onSkip={skipOccurrence}
        onOverride={overrideOccurrence}
        onOverrideFromDate={overrideFromDate}
        onCancel={u=>{setActiveOcc(null);setCancelUnit(u)}}
        onClose={()=>setActiveOcc(null)}/>}
      {cancelUnit&&<DeleteConfirmDialog unit={cancelUnit} units={units}
        onDelete={id=>{setUnits(prev=>prev.filter(x=>x.id!==id))}}
        onDeleteKeepPaid={id=>{
          const u=units.find(x=>x.id===id); if(!u) return
          const paidThru=getPaidThruSunday(units)
          const occs=expandUnit(u).filter(o=>!o.skipped&&isPaidOcc(o.start,paidThru))
          const kept=occs.map(o=>({...defaultUnit(u.serviceId,{petIds:u.petIds,startDate:dateKey(o.start),endDate:u.endDate?dateKey(o.end||o.start):"",startTime:u.startTime,durationMins:u.durationMins}),frequency:"once"}))
          setUnits(prev=>[...prev.filter(x=>x.id!==id),...kept])
        }}
        onRefundAndDelete={id=>{setUnits(prev=>prev.filter(x=>x.id!==id))}}
        onClose={()=>setCancelUnit(null)}/>}
    </div>
  )
}
