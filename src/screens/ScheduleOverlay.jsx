import React, { useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { colors, shadows, textStyles } from '../tokens'
import { BackIcon } from '../assets/icons'
import { Button } from '../components'
import RelationshipScreen from './relationship/RelationshipScreen'
import { useAppContext } from '../context/AppContext'
import { formatActionTimestamp } from '../hooks/useDate'

const UNIT_LABELS = {
  dog_walking:   'walk',
  drop_in:       'visit',
  doggy_daycare: 'day',
  boarding:      'night',
  house_sitting: 'night',
}

export default function ScheduleOverlay() {
  const { ownerId } = useParams()
  const navigate = useNavigate()
  const { state: ctx } = useLocation()
  const { ownerUnits, setOwnerUnits, resolvedCards, setResolvedCards, addLiveEvent } = useAppContext()
  const scheduleRef = useRef(null)
  const [showToast, setShowToast] = useState(false)
  const toastTimerRef = useRef(null)

  const handleScheduleConfirmed = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setShowToast(true)
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3500)
  }

  const units = ownerUnits[ownerId] ?? ctx?.units ?? []
  const unitLabel = UNIT_LABELS[units[0]?.serviceId] ?? 'service'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.background.primary, position: 'relative' }}>
      <div style={{ borderBottom: `1px solid ${colors.border.secondary}`, boxShadow: shadows.headerShadow, padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 62, padding: '8px 0' }}>
          <div onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
            <BackIcon />
          </div>
          <div style={{ flex: 1, marginLeft: 8, minWidth: 0 }}>
            <p style={{ ...textStyles.text200Semibold, color: colors.text.primary, margin: 0 }}>Manage schedule</p>
            <p style={{ ...textStyles.text100, color: colors.text.primary, margin: 0 }}>{ctx?.ownerName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingTop: 12, paddingBottom: 14 }}>
          <Button variant="primary" style={{ flexShrink: 0 }} onClick={() => scheduleRef.current?.openAdd()}>Add a {unitLabel}</Button>
          <Button variant="default" style={{ flexShrink: 0 }} onClick={() => scheduleRef.current?.openManage()}>Manage rules</Button>
        </div>
      </div>
      <RelationshipScreen
        ref={scheduleRef}
        initialPets={ctx?.pets}
        initialUnits={units}
        ownerFirstName={ctx?.ownerFirstName}
        isIncompleteResolved={!!resolvedCards[`${ownerId}-incomplete`]}
        onScheduleConfirmed={handleScheduleConfirmed}
        onScheduleChange={(text, committedUnits) => {
          if (committedUnits) setOwnerUnits(prev => ({ ...prev, [ownerId]: committedUnits }))
          addLiveEvent(ownerId, {
            id: Date.now(),
            type: 'scheduleChange',
            text: text.replace('{ts}', formatActionTimestamp()),
          })
        }}
        onReviewComplete={(resolution, card) => {
          const ts = formatActionTimestamp()
          const cardId = `${ownerId}-incomplete`
          setResolvedCards(prev => ({ ...prev, [cardId]: { resolution, timestamp: ts } }))
          addLiveEvent(ownerId, { id: Date.now(), type: 'resolution', resolution, timestamp: ts, card })
        }}
      />
      {showToast && (
        <div style={{
          position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 50,
          background: '#fff', borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          animation: 'slideUp 0.25s ease-out',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: '#F1FDF6', border: '1.5px solid #1A824E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="#1A824E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ flex: 1, margin: 0, fontSize: 14, fontWeight: 600, color: '#1F2124', fontFamily: 'Averta, sans-serif' }}>
            Schedule was updated.
          </p>
          <div onClick={() => setShowToast(false)} style={{ cursor: 'pointer', padding: 4, color: '#767C82', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
