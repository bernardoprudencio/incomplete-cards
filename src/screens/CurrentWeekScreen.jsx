import React, { useState, useEffect, useRef } from 'react'
import { colors, typography, radius, shadows } from '../tokens'
import { BackIcon, TrashIcon, CautionIcon, CloseSmIcon, SuccessIcon } from '../assets/icons'
import { Button, PetAvatar, Chip } from '../components'
import { OWNERS, PROTO_TODAY, getOwnerCurrentWeekSlots } from '../data/owners'

// ── Responsive hook ────────────────────────────────────────────────────────────
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth > 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

const tx = (size, weight, color) => ({
  fontFamily: typography.fontFamily, fontSize: size, fontWeight: weight, color, margin: 0,
})

// ── Helpers ────────────────────────────────────────────────────────────────────
const cloneDays = (days) =>
  days.map(d => ({ ...d, slots: d.slots.map(s => ({ ...s })) }))

const computeChanges = (currentDays, baseDays) => {
  const changes = []
  for (const baseDay of baseDays) {
    const currDay = currentDays.find(d => d.id === baseDay.id)
    const baseTimes = baseDay.slots.map(s => s.time)
    const currTimes = currDay ? currDay.slots.map(s => s.time) : []
    const removed = baseTimes.filter(t => !currTimes.includes(t))
    const added   = currTimes.filter(t => !baseTimes.includes(t))
    if (!currDay || removed.length || added.length) {
      changes.push({ day: baseDay.day, date: baseDay.date, removed: !currDay ? baseTimes : removed, added })
    }
  }
  for (const currDay of currentDays) {
    if (!baseDays.find(d => d.id === currDay.id)) {
      changes.push({ day: currDay.day, date: currDay.date, removed: [], added: currDay.slots.map(s => s.time) })
    }
  }
  return changes
}

const weekLabel = (() => {
  const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dow = PROTO_TODAY.getDay()
  const monday = new Date(PROTO_TODAY)
  monday.setDate(PROTO_TODAY.getDate() - (dow === 0 ? 6 : dow - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return `${SHORT[monday.getMonth()]} ${monday.getDate()} – ${SHORT[sunday.getMonth()]} ${sunday.getDate()}`
})()

const ALL_TIMES = (() => {
  const times = []
  for (let h = 6; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 21 && m === 30) break
      const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h
      times.push(`${h12}:${m === 0 ? '00' : '30'} ${h >= 12 ? 'PM' : 'AM'}`)
    }
  }
  return times
})()

const timeToMins = (t) => {
  const [time, p] = t.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (p === 'PM' && h !== 12) h += 12
  if (p === 'AM' && h === 12) h = 0
  return h * 60 + m
}

// ── Sidebar cards ──────────────────────────────────────────────────────────────
const UserInfoCard = ({ owner }) => (
  <div style={{ background: colors.white, borderRadius: radius.primary, padding: '24px 16px' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <PetAvatar size={64} images={[owner.image]} />
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', paddingLeft: 8 }}>
        <p style={{ ...tx(20, 600, colors.primary), lineHeight: 1.25 }}>{owner.name}</p>
        <p style={{ ...tx(14, 400, colors.secondary), lineHeight: 1.5 }}>{owner.service}</p>
        <p style={{ ...tx(14, 400, colors.secondary), lineHeight: 1.5 }}>{owner.petNames}</p>
      </div>
    </div>
  </div>
)

const CurrentWeekSnapshotCard = ({ days }) => {
  const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dow = PROTO_TODAY.getDay()
  const monday = new Date(PROTO_TODAY)
  monday.setDate(PROTO_TODAY.getDate() - (dow === 0 ? 6 : dow - 1))
  const label = `${SHORT[monday.getMonth()]} ${monday.getDate()}`
  return (
    <div style={{ background: colors.white, borderRadius: radius.primary, padding: '24px 16px' }}>
      <p style={{ ...tx(20, 600, colors.primary), lineHeight: 1.25, marginBottom: 4 }}>Happening this week</p>
      <p style={{ ...tx(14, 400, colors.secondary), lineHeight: 1.25, marginBottom: 16 }}>Week of {label}</p>
      {days.map(d => (
        <div key={d.id} style={{ paddingBottom: 16 }}>
          <p style={{ ...tx(16, 600, colors.primary), lineHeight: 1.5, marginBottom: 8 }}>{d.day}, {d.date}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {d.slots.map(s => (
              <p key={s.id} style={{ ...tx(14, 400, colors.primary), margin: 0 }}>{s.time}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Banners ────────────────────────────────────────────────────────────────────
function ErrorBanner({ emptyDays, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 8000); return () => clearTimeout(t) }, [])
  return (
    <div style={{ background: '#FFEDE8', borderRadius: 4, boxShadow: '0px 2px 12px -1px rgba(27,31,35,0.24)', padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <CautionIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...tx(14, 600, colors.primary), lineHeight: 1.25, marginBottom: 4 }}>
          The following days have no time scheduled:
        </p>
        <ul style={{ margin: 0, paddingLeft: 21 }}>
          {emptyDays.map((d, i) => (
            <li key={i} style={{ ...tx(14, 400, colors.primary), lineHeight: 1.5 }}>{d.day}, {d.date}</li>
          ))}
        </ul>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0, marginTop: 2 }}>
        <CloseSmIcon />
      </button>
    </div>
  )
}

function SuccessBanner({ onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 8000); return () => clearTimeout(t) }, [])
  return (
    <div style={{ background: '#F1FDF6', borderRadius: 4, boxShadow: '0px 2px 12px -1px rgba(27,31,35,0.24)', padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
      <SuccessIcon />
      <p style={{ ...tx(14, 600, colors.primary), lineHeight: 1.25, flex: 1, margin: 0 }}>
        This week's schedule was updated successfully
      </p>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
        <CloseSmIcon />
      </button>
    </div>
  )
}

// ── Confirm dialogs ────────────────────────────────────────────────────────────
function ChangeRows({ changes }) {
  return (
    <div className="hide-scrollbar" style={{ maxHeight: 240, overflowY: 'auto', padding: '24px 0' }}>
      {changes.map((change, i) => (
        <div key={i} style={{ paddingBottom: i < changes.length - 1 ? 12 : 0 }}>
          <p style={{ ...tx(16, 600, colors.primary), marginBottom: 4, lineHeight: 1.5 }}>{change.day}, {change.date}</p>
          {change.removed.map((t, j) => (
            <p key={`r${j}`} style={{ ...tx(14, 400, '#BC4338'), marginBottom: 2, lineHeight: 1.5 }}>Removed: {t}</p>
          ))}
          {change.added.map((t, j) => (
            <p key={`a${j}`} style={{ ...tx(14, 400, '#1B6C42'), marginBottom: 2, lineHeight: 1.5 }}>Added: {t}</p>
          ))}
        </div>
      ))}
    </div>
  )
}

function ConfirmSheet({ changes, ownerName, onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,31,35,0.48)', display: 'flex', alignItems: 'flex-end', zIndex: 10 }} onClick={onClose}>
      <div style={{ background: colors.white, borderRadius: '16px 16px 0 0', boxShadow: shadows.medium, padding: '32px 16px 24px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 36, height: 5, borderRadius: 35, background: '#C9CFD4' }} />
        <p style={{ ...tx(20, 600, colors.primary), lineHeight: 1.25, marginBottom: 8 }}>Confirm changes</p>
        <p style={{ ...tx(14, 400, colors.primary), lineHeight: 1.5, marginBottom: 0 }}>
          Review your changes below. We'll notify {ownerName} of these updates.
        </p>
        <ChangeRows changes={changes} />
        <Button variant="primary" size="default" fullWidth onClick={onConfirm}>Confirm and notify</Button>
        <div style={{ paddingTop: 12 }}>
          <Button variant="default" size="default" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ changes, ownerName, onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,31,35,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: colors.white, borderRadius: 8, boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.12)', padding: 24, width: 400, maxWidth: 'calc(100vw - 48px)' }}>
        <p style={{ ...tx(20, 600, colors.primary), lineHeight: 1.25, marginBottom: 8 }}>Confirm changes</p>
        <p style={{ ...tx(14, 400, colors.primary), lineHeight: 1.5, marginBottom: 0 }}>
          Review your changes below. We'll notify {ownerName} of these updates.
        </p>
        <ChangeRows changes={changes} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="primary" size="default" fullWidth onClick={onConfirm}>Confirm and notify</Button>
          <Button variant="flat" size="default" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

// ── Time dropdown ──────────────────────────────────────────────────────────────
function TimeDropdown({ existingTimes, onSelect, anchorRef }) {
  const ref = useRef(null)
  const [above, setAbove] = useState(false)

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setAbove(window.innerHeight - rect.bottom < 240 && rect.top > 240)
    }
  }, [anchorRef])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {}
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchorRef])

  const available = ALL_TIMES.filter(t =>
    !existingTimes.includes(t) &&
    !existingTimes.some(et => Math.abs(timeToMins(t) - timeToMins(et)) < 60)
  )

  return (
    <div ref={ref} style={{
      position: 'absolute', [above ? 'bottom' : 'top']: 'calc(100% + 4px)', left: 0, zIndex: 200,
      background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.primary,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 224, overflowY: 'auto', minWidth: 140,
    }}>
      {available.length === 0
        ? <p style={{ padding: '10px 12px', fontFamily: typography.fontFamily, fontSize: 14, color: colors.tertiary, margin: 0 }}>No times available</p>
        : available.map(t => (
          <button key={t} onMouseDown={(e) => { e.preventDefault(); onSelect(t) }} style={{
            display: 'block', width: '100%', padding: '10px 12px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: typography.fontFamily, fontSize: 14, color: colors.primary, textAlign: 'left',
          }}>{t}</button>
        ))
      }
    </div>
  )
}

// ── Day row ────────────────────────────────────────────────────────────────────
function DayRow({ day, onAddTime, onRemoveSlot, onRemoveDay, showTrash }) {
  const [openAdd, setOpenAdd] = useState(false)
  const addRef = useRef(null)

  useEffect(() => {
    if (!openAdd) return
    const handler = (e) => { if (addRef.current && !addRef.current.contains(e.target)) setOpenAdd(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openAdd])

  const times = day.slots.map(s => s.time)

  return (
    <div style={{ background: colors.bgSecondary, borderRadius: radius.primary, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <p style={{ flex: 1, fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 16, color: colors.primary, margin: 0, lineHeight: 1.5 }}>
          {day.day}, {day.date}
        </p>
        {showTrash && (
          <button onMouseDown={onRemoveDay} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#BC4338', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <TrashIcon />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {day.slots.map(s => (
          <Chip key={s.id} label={s.time} selected={false} onRemove={() => onRemoveSlot(s.id)} />
        ))}
        <div ref={addRef} style={{ position: 'relative' }}>
          <Chip label="Add time" selected={openAdd} onClick={() => setOpenAdd(v => !v)} />
          {openAdd && (
            <TimeDropdown
              existingTimes={times}
              onSelect={(t) => { onAddTime(t); setOpenAdd(false) }}
              anchorRef={addRef}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── CurrentWeekScreen ──────────────────────────────────────────────────────────
export default function CurrentWeekScreen({ owner, initialDays, onSave, onBack }) {
  const isDesktop = useIsDesktop()
  const [days, setDays]           = useState(() => cloneDays(initialDays))
  const [baseDays, setBaseDays]   = useState(() => cloneDays(initialDays))
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorDays, setErrorDays]    = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const snapshotDays = getOwnerCurrentWeekSlots(OWNERS[owner.id] ?? owner)

  const hasChanges = JSON.stringify(days) !== JSON.stringify(baseDays)

  const handleSavePress = () => {
    const empty = days.filter(d => d.slots.length === 0)
    if (empty.length) { setErrorDays(empty); return }
    setErrorDays(null)
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    const diff = computeChanges(days, baseDays)
    setShowConfirm(false)
    setBaseDays(cloneDays(days))
    onSave?.(diff, cloneDays(days))
    setShowSuccess(true)
  }

  const addSlot = (dayId, time) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        slots: [...d.slots, { id: `${dayId}-s${Date.now()}`, time }]
          .sort((a, b) => timeToMins(a.time) - timeToMins(b.time)),
      }
    ))
  }

  const removeSlot = (dayId, slotId) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : { ...d, slots: d.slots.filter(s => s.id !== slotId) }
    ))
  }

  const removeDay = (dayId) => {
    if (days.length === 1) return
    setDays(prev => prev.filter(d => d.id !== dayId))
  }

  const formBody = (
    <div style={{ padding: '0 16px' }}>
      <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map(d => (
          <DayRow
            key={d.id}
            day={d}
            onAddTime={(t) => addSlot(d.id, t)}
            onRemoveSlot={(slotId) => removeSlot(d.id, slotId)}
            onRemoveDay={() => removeDay(d.id)}
            showTrash={days.length > 1}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
        {errorDays && (
          <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, paddingBottom: 8 }}>
            <ErrorBanner emptyDays={errorDays} onDismiss={() => setErrorDays(null)} />
          </div>
        )}
        {showSuccess && (
          <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, paddingBottom: 8 }}>
            <SuccessBanner onDismiss={() => setShowSuccess(false)} />
          </div>
        )}
        <Button variant="primary" fullWidth disabled={!hasChanges} onClick={handleSavePress}>
          Save changes
        </Button>
        <Button variant="default" fullWidth onClick={onBack}>
          Go back
        </Button>
      </div>
    </div>
  )

  const panelHeader = (
    <div style={{ padding: '24px 16px 16px', borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
      <p style={{ ...tx(20, 700, colors.primary), lineHeight: 1.25, margin: '0 0 4px' }}>
        Manage current week
      </p>
      <p style={{ ...tx(14, 400, colors.secondary), lineHeight: 1.5, margin: 0 }}>
        {weekLabel} · Changes apply to this week only.
      </p>
    </div>
  )

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.bgSecondary }}>

      {/* Nav header */}
      <div style={{
        background: colors.white, borderBottom: `1px solid ${colors.border}`,
        boxShadow: shadows.headerShadow, padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 8, height: 56, flexShrink: 0, zIndex: 3,
      }}>
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={onBack}>
          <BackIcon />
        </div>
        <p style={{ ...tx(16, 700, colors.primary), margin: 0 }}>Manage current week</p>
      </div>

      {isDesktop ? (
        <div className="hide-scrollbar" style={{
          flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start',
          maxWidth: 1140, margin: '0 auto', width: '100%',
          gap: 24, padding: '24px 24px 0', boxSizing: 'border-box',
        }}>
          {/* Sidebar */}
          <div style={{ width: 360, flexShrink: 0, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <UserInfoCard owner={owner} />
            <CurrentWeekSnapshotCard days={snapshotDays} />
          </div>

          {/* Right panel — sticky */}
          <div style={{
            flex: 1, minWidth: 0, background: colors.white, borderRadius: radius.primary,
            position: 'sticky', top: 0, height: 'calc(100vh - 56px)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            {panelHeader}
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
              {formBody}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <UserInfoCard owner={owner} />
              <CurrentWeekSnapshotCard days={snapshotDays} />
            </div>
            <div style={{ margin: 16, background: colors.white, borderRadius: radius.primary }}>
              {panelHeader}
              {formBody}
            </div>
          </div>
        </div>
      )}

    </div>

    {showConfirm && (
      isDesktop
        ? <ConfirmModal
            changes={computeChanges(days, baseDays)}
            ownerName={owner.name}
            onConfirm={handleConfirm}
            onClose={() => setShowConfirm(false)}
          />
        : <ConfirmSheet
            changes={computeChanges(days, baseDays)}
            ownerName={owner.name}
            onConfirm={handleConfirm}
            onClose={() => setShowConfirm(false)}
          />
    )}
    </>
  )
}
