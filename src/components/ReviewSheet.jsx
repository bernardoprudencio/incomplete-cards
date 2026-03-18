import React, { useState } from 'react'
import { colors, typography, shadows, radius } from '../tokens'
import { petImages } from '../assets/images'
import PetAvatar from './PetAvatar'
import Button from './Button'

export default function ReviewSheet({ visible, onClose, onComplete, onCancelRefund }) {
  const [answer, setAnswer] = useState('no')

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />

      {/* Sheet */}
      <div style={{
        background: colors.white, borderRadius: '16px 16px 0 0',
        boxShadow: shadows.medium, padding: '32px 16px 24px',
        animation: 'slideUp 0.25s ease-out',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 5, borderRadius: 35, background: colors.borderInteractive }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 16, color: colors.primary, margin: 0 }}>Dog Walking: Archie</p>
            <p style={{ fontFamily: typography.fontFamily, fontSize: 14, color: colors.tertiary, margin: '2px 0 0' }}>Yesterday · 12:00 PM to 12:30 PM</p>
          </div>
          <PetAvatar size={48} images={[petImages.archie]} />
        </div>

        {/* Question */}
        <p style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 16, color: colors.primary, margin: '0 0 12px' }}>
          Have you completed the walk?
        </p>

        {/* No / Yes toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['no', 'yes'].map((opt) => {
            const selected = answer === opt
            return (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                style={{
                  flex: 1, padding: '8px 16px',
                  border: `2px solid ${selected ? colors.link : colors.borderInteractive}`,
                  borderRadius: radius.round, background: colors.white,
                  fontFamily: typography.fontFamily, fontWeight: 600, fontSize: 14,
                  color: selected ? colors.link : colors.secondary,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {selected && (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5L5 9L13 1" stroke={colors.link} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            )
          })}
        </div>

        {/* Context text */}
        <p style={{ fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 1.5, color: colors.tertiary, margin: '0 0 20px' }}>
          {answer === 'yes'
            ? "There's no Rover Card, so your client won't see updates about their pet. We'll let them know the service is complete."
            : 'A refund of $20.00 will automatically be processed.'}
        </p>

        {/* CTA */}
        {answer === 'yes'
          ? <Button variant="primary" fullWidth style={{ marginBottom: 12 }} onClick={onComplete}>Mark as complete</Button>
          : <Button variant="destructive" fullWidth style={{ marginBottom: 12 }} onClick={onCancelRefund}>Cancel and refund</Button>
        }
        <Button variant="default" fullWidth onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
