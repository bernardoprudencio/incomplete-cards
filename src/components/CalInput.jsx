import { useState, useRef, useEffect } from 'react'
import { colors, typography } from '../tokens'
import { DropdownIcon } from '../assets/icons'

const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const fontFamily = typography.fontFamily

function parseDate(s)  { return s ? new Date(s + 'T00:00:00') : null }
function dateKey(d)    { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function fmtDateLong(d){ return `${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` }
function isToday(d)    { const t = new Date(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate() }

/**
 * CalInput — calendar date picker dropdown.
 *
 * Props:
 *   value       "YYYY-MM-DD" string or ""
 *   onChange    fn(dateKey)
 *   minDate     "YYYY-MM-DD" string (defaults to today)
 *   placeholder string
 */
export default function CalInput({ value, onChange, minDate, placeholder }) {
  const sel   = value ? parseDate(value) : null
  const today = new Date(); today.setHours(0,0,0,0)
  const minD  = minDate ? parseDate(minDate) : today

  const [open,       setOpen]       = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const [viewYear,   setViewYear]   = useState(sel ? sel.getFullYear()  : today.getFullYear())
  const [viewMonth,  setViewMonth]  = useState(sel ? sel.getMonth()     : today.getMonth())
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setAlignRight(rect.left + 276 > window.innerWidth)
    }
    setOpen(o => !o)
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const cells    = []
  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null)
  for (let d = 1; d <= new Date(viewYear, viewMonth+1, 0).getDate(); d++) cells.push(d)

  const prevM = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(viewYear-1)) : setViewMonth(viewMonth-1)
  const nextM = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(viewYear+1)) : setViewMonth(viewMonth+1)
  const pick  = day => {
    if (!day) return
    const d = new Date(viewYear, viewMonth, day)
    if (minD && d < minD) return
    onChange(dateKey(d))
    setOpen(false)
  }

  const label = sel ? fmtDateLong(sel) : (placeholder || 'Select date…')

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        style={{
          width: '100%', padding: '12px 8px 12px 12px',
          border: `2px solid ${open ? colors.link : colors.borderInteractive}`,
          borderRadius: 4, fontSize: 16, fontFamily,
          color: sel ? colors.primary : colors.disabledText,
          background: '#fff', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', minHeight: 48, boxSizing: 'border-box',
        }}
      >
        <span style={{ flex: 1, fontWeight: 400, lineHeight: 1.5 }}>{label}</span>
        <DropdownIcon />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: alignRight ? 'auto' : 0,
          right: alignRight ? 0 : 'auto',
          zIndex: 900,
          background: '#fff', borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: `1.5px solid ${colors.border}`,
          width: 276, padding: '14px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevM} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: colors.tertiary, padding: '2px 6px', borderRadius: 6 }}>‹</button>
            <span style={{ fontWeight: 600, fontSize: 13, color: colors.primary }}>{`${MONTHS[viewMonth]} ${viewYear}`}</span>
            <button onClick={nextM} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: colors.tertiary, padding: '2px 6px', borderRadius: 6 }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map(w => <div key={w} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: colors.tertiary, padding: '2px 0' }}>{w}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={'e'+i} />
              const d    = new Date(viewYear, viewMonth, day)
              const isSel = sel && dateKey(d) === dateKey(sel)
              const dis   = d < minD
              const tod   = isToday(d)
              return (
                <button key={day} disabled={dis} onClick={() => pick(day)} style={{
                  padding: '6px 0', borderRadius: 8, border: 'none',
                  cursor: dis ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  fontWeight: isSel ? 700 : tod ? 600 : 400,
                  background: isSel ? colors.link : tod && !isSel ? colors.blueLight : 'transparent',
                  color: dis ? colors.disabledText : isSel ? '#fff' : tod ? colors.link : colors.primary,
                  opacity: dis ? 0.4 : 1,
                  fontFamily,
                }}>
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
