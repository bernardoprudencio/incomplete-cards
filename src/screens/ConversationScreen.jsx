import React from 'react'
import { colors, typography, shadows } from '../tokens'
import { BackIcon, MoreIcon, ImageIcon } from '../assets/icons'
import { peopleImages } from '../assets/images'
import { Button, PetAvatar, BannerBlock, ChatBubble } from '../components'

export default function ConversationScreen({ onBack, conversation }) {
  const { type, card, resolution, timestamp } = conversation || {}

  const isToday = type === 'today'
  const clientName = isToday ? 'Owen O.' : card?.client
  const clientImg  = isToday ? peopleImages.owen : peopleImages[card?.clientKey] ?? peopleImages.owen

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.white }}>
      {/* ─── Header ─── */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: shadows.headerShadow,
        padding: '12px 16px', flexShrink: 0, zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 62, padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }} onClick={onBack}>
            <BackIcon />
            <PetAvatar size={48} images={[clientImg]} />
          </div>
          <div style={{ flex: 1, marginLeft: 8, minWidth: 0 }}>
            <p style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 16, lineHeight: 1.5, color: colors.primary, margin: 0 }}>{clientName}</p>
            <p style={{ fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 1.25, color: colors.success, margin: 0 }}>Ongoing</p>
          </div>
          <div style={{ cursor: 'pointer', flexShrink: 0 }}><MoreIcon /></div>
        </div>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, paddingTop: 12, overflowX: 'auto' }}>
          <Button variant="primary" style={{ boxShadow: shadows.medium, flexShrink: 0 }}>Leave feedback</Button>
          <Button variant="default" style={{ flexShrink: 0 }}>Modify schedule</Button>
          <Button variant="default" style={{ flexShrink: 0 }}>Details</Button>
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column' }}>
        {isToday ? (
          <>
            <BannerBlock text="Walk started at 8:18 PM, Mar 15" link="See Rover Card" />
            <div style={{ height: 12 }} />
            <ChatBubble message="He ok?" time="08:32 PM" />
            <ChatBubble message="Yeah he seems pretty mellow to me!" time="08:30 PM" isOwner showCheck />
            <ChatBubble message="Oh good, thanks for letting me know!" time="08:32 PM" />
            <div style={{ height: 4 }} />
            <BannerBlock text="Walk ended at 8:54 PM, Mar 15" link="See Rover Card" />
            <div style={{ height: 12 }} />
            <ChatBubble message="Thank you!" time="08:56 PM" />
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <span style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 14, color: colors.tertiary }}>Today</span>
            </div>
            <BannerBlock text="Walk from {date at time} was marked as complete at 5:23 PM, Jan 18." />
          </>
        ) : (
          <>
            <ChatBubble message="Hi! Just a heads up about the walk." time="10:02 AM" isOwner showCheck />
            <ChatBubble message="Oh no, what happened?" time="10:15 AM" />
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <span style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 14, color: colors.tertiary }}>Today</span>
            </div>
            {resolution === 'completed' && (
              <BannerBlock text={`Walk from ${card.dateLabel} was marked as complete on ${timestamp}.`} />
            )}
            {resolution === 'cancelled' && (
              <BannerBlock text={`Walk from ${card.dateLabel} was cancelled on ${timestamp}. A refund of ${card.cost} has been processed.`} />
            )}
          </>
        )}
      </div>

      {/* ─── Composer ─── */}
      <div style={{
        borderTop: `1px solid ${colors.border}`, padding: '8px 12px',
        display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0,
      }}>
        <Button variant="default" icon={<ImageIcon />} />
        <div style={{
          flex: 1, border: `2px solid ${colors.borderInteractive}`,
          borderRadius: 4, height: 32, boxSizing: 'border-box',
        }} />
      </div>
    </div>
  )
}
