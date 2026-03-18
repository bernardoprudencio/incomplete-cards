import React, { useState } from 'react'
import { colors, typography } from './tokens'
import { useLoadTime } from './hooks/useLoadTime'
import { formatActionTimestamp } from './hooks/useDate'
import { ActionSheet, ReviewSheet } from './components'
import { HomeScreen, ConversationScreen } from './screens'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [actionSheet, setActionSheet] = useState(false)
  const [reviewSheet, setReviewSheet] = useState(false)
  const [resolution, setResolution] = useState(null)
  const [resolutionTimestamp, setResolutionTimestamp] = useState(null)
  const [cardResolved, setCardResolved] = useState(false)
  const [transition, setTransition] = useState(false)
  const [direction, setDirection] = useState('forward')
  const loadTime = useLoadTime()

  const navigateTo = (target, dir = 'forward') => {
    setDirection(dir)
    setTransition(true)
    setTimeout(() => {
      setScreen(target)
      setTransition(false)
    }, 200)
  }

  return (
    <div className="phone-shell" style={{ fontFamily: typography.fontFamily }}>
      {/* Screen layer */}
      <div style={{
        position: 'absolute', inset: 0,
        transition: 'transform 0.25s ease, opacity 0.2s ease',
        transform: transition
          ? (direction === 'forward' ? 'translateX(-30%)' : 'translateX(30%)')
          : 'translateX(0)',
        opacity: transition ? 0 : 1,
      }}>
        {screen === 'home' && (
          <HomeScreen
            onOpenActionSheet={() => setActionSheet(true)}
            onOpenReviewSheet={() => setReviewSheet(true)}
            onNavigateConversation={() => navigateTo('conversation', 'forward')}
            cardResolved={cardResolved}
            loadTime={loadTime}
          />
        )}
        {screen === 'conversation' && (
          <ConversationScreen onBack={() => navigateTo('home', 'back')} resolution={resolution} resolutionTimestamp={resolutionTimestamp} />
        )}
      </div>

      {/* Action Sheet overlay */}
      <ActionSheet
        visible={actionSheet}
        onClose={() => setActionSheet(false)}
        onGoToConversation={() => {
          setActionSheet(false)
          setTimeout(() => navigateTo('conversation', 'forward'), 200)
        }}
        onReviewAndComplete={() => {
          setActionSheet(false)
          setTimeout(() => setReviewSheet(true), 200)
        }}
      />
      <ReviewSheet
        visible={reviewSheet}
        onClose={() => setReviewSheet(false)}
        onComplete={() => {
          setResolution('completed')
          setResolutionTimestamp(formatActionTimestamp())
          setCardResolved(true)
          setReviewSheet(false)
          setTimeout(() => navigateTo('conversation', 'forward'), 200)
        }}
        onCancelRefund={() => {
          setResolution('cancelled')
          setResolutionTimestamp(formatActionTimestamp())
          setCardResolved(true)
          setReviewSheet(false)
          setTimeout(() => navigateTo('conversation', 'forward'), 200)
        }}
      />

    </div>
  )
}
