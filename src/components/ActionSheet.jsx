import React from 'react'
import { colors, shadows } from '../tokens'
import { ChevronRightIcon } from '../assets/icons'
import PetAvatar from './PetAvatar'
import Button from './Button'
import Row from './Row'

export default function ActionSheet({ visible, type, label, sublabel, petImages, firstName, onClose, onGoToConversation, onReviewAndComplete, onReschedule }) {
  if (!visible) return null

  const options = [
    type === 'incomplete' && { label: 'Review and complete', onPress: onReviewAndComplete },
    type === 'today'      && { label: 'Open map',            onPress: null },
    { label: `Go to conversation with ${firstName}`,         onPress: onGoToConversation },
    { label: 'Reschedule',                                   onPress: onReschedule ?? null },
  ].filter(Boolean)

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.3)',
    }}>
      <div onClick={onClose} style={{ flex: 1 }} />

      <div style={{
        background: colors.white, borderRadius: '8px 8px 0 0',
        boxShadow: shadows.medium, padding: '0 16px 24px',
        animation: 'slideUp 0.25s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, marginBottom: 24 }}>
          <div style={{ width: 36, height: 5, borderRadius: 35, background: colors.borderInteractive }} />
        </div>

        <Row
          label={label}
          sublabel={sublabel}
          rightItem={<PetAvatar size={48} images={petImages} />}
          firstRow
        />

        {options.map(item => (
          <Row
            key={item.label}
            label={item.label}
            rightItem={<ChevronRightIcon />}
            onClick={item.onPress ?? undefined}
          />
        ))}

        <div style={{ paddingTop: 24 }}>
          <Button variant="default" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
