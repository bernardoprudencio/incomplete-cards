import { useState, useRef, useEffect } from 'react'
import { colors, typography } from '../tokens'
import { DropdownIcon } from '../assets/icons'

const fontFamily = typography.fontFamily
const HOURS = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
const MINS  = [0,15,30,45]

function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
}
function fmtHour(h) { return `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}` }

/**
 * TimeInput — time picker dropdown (6 AM – 8 PM, 15-min intervals).
 *
 * Props:
 *   value       "HH:MM" string or ""
 *   onChange    fn("HH:MM")
 *   placeholder string
 */
export default function TimeInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const selH = value ? parseInt(value.split(':')[0], 10) : null
  const selM = value ? parseInt(value.split(':')[1], 10) : null
  const pick = (h, m) => { onChange(String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0')); setOpen(false) }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '12px 8px 12px 12px',
          border: `2px solid ${open ? colors.link : colors.borderInteractive}`,
          borderRadius: 4, fontSize: 16, fontFamily,
          color: value ? colors.primary : colors.disabledText,
          background: '#fff', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', minHeight: 48, boxSizing: 'border-box',
        }}
      >
        <span style={{ flex: 1, fontWeight: 400, lineHeight: 1.5 }}>{value ? fmtTime(value) : (placeholder || 'Select time…')}</span>
        <DropdownIcon />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          zIndex: 900, background: '#fff', borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: `1.5px solid ${colors.border}`,
          width: 240, padding: '12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: colors.tertiary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select time</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, maxHeight: 196, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, color: colors.disabledText, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>Hour</div>
              {HOURS.map(h => (
                <button key={h} onClick={() => pick(h, selM !== null ? selM : 0)}
                  style={{
                    width: '100%', padding: '6px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: selH === h ? 700 : 400,
                    background: selH === h ? colors.link : 'transparent',
                    color: selH === h ? '#fff' : colors.primary,
                    fontFamily, textAlign: 'center', marginBottom: 1,
                  }}>
                  {fmtHour(h)}
                </button>
              ))}
            </div>
            <div style={{ width: 58 }}>
              <div style={{ fontSize: 10, color: colors.disabledText, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>Min</div>
              {MINS.map(m => (
                <button key={m} onClick={() => pick(selH !== null ? selH : 9, m)}
                  style={{
                    width: '100%', padding: '6px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: selM === m ? 700 : 400,
                    background: selM === m ? colors.link : 'transparent',
                    color: selM === m ? '#fff' : colors.primary,
                    fontFamily, textAlign: 'center', marginBottom: 1,
                  }}>
                  {String(m).padStart(2,'0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
