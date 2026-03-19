import React from 'react'
import { colors, shadows } from '../tokens'
import { ChevronRightIcon } from '../assets/icons'
import { petImages } from '../assets/images'
import PetAvatar from './PetAvatar'
import Button from './Button'
import Row from './Row'

export default function ActionSheet({ visible, card, onClose, onGoToConversation, onReviewAndComplete }) {
  if (!visible || !card) return null

  const options = [
    { label: 'Review and complete',               actionKey: 'review' },
    { label: `Go to conversation with ${card.client.split(' ')[0]}`, actionKey: 'conversation' },
    { label: 'Reschedule walk',                    actionKey: null },
  ]

  const handleClick = (actionKey) => {
    if (actionKey === 'conversation') onGoToConversation()
    else if (actionKey === 'review') onReviewAndComplete()
  }

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
          label={card.label}
          sublabel={card.sublabel}
          rightItem={<PetAvatar size={48} images={[petImages[card.petKey]]} />}
          firstRow
        />

        {options.map((item) => (
          <Row
            key={item.label}
            label={item.label}
            rightItem={<ChevronRightIcon />}
            onClick={item.actionKey ? () => handleClick(item.actionKey) : undefined}
          />
        ))}

        <div style={{ paddingTop: 24 }}>
          <Button variant="default" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
