import React, { useEffect, useState } from 'react'
import { colors, typography } from '../tokens'

const stage = {
  bg: '#0B1220',
  card: '#FFFFFF',
  ink: colors.primary,
  muted: colors.tertiary,
  accent: colors.link,
  rule: colors.border,
}

const titleFont = {
  fontFamily: typography.displayFamily,
  fontWeight: 600,
  letterSpacing: '-0.01em',
  color: stage.ink,
}

const eyebrow = {
  fontFamily: typography.fontFamily,
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: stage.accent,
  margin: 0,
}

const body = {
  fontFamily: typography.fontFamily,
  fontSize: 22,
  lineHeight: 1.45,
  color: stage.ink,
  margin: 0,
}

const muted = {
  fontFamily: typography.fontFamily,
  fontSize: 18,
  lineHeight: 1.5,
  color: stage.muted,
  margin: 0,
}

const Bullets = ({ items }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 18 }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <span style={{
          flexShrink: 0, width: 8, height: 8, borderRadius: 99,
          background: stage.accent, marginTop: 14,
        }} />
        <span style={body}>{item}</span>
      </li>
    ))}
  </ul>
)

const Stat = ({ value, label }) => (
  <div style={{
    background: stage.card, border: `1px solid ${stage.rule}`, borderRadius: 12,
    padding: '28px 24px', flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column', gap: 8,
  }}>
    <p style={{ ...titleFont, fontSize: 56, lineHeight: 1, margin: 0 }}>{value}</p>
    <p style={{ ...muted, fontSize: 16 }}>{label}</p>
  </div>
)

const SlideHeader = ({ eyebrowText, title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
    {eyebrowText && <p style={eyebrow}>{eyebrowText}</p>}
    <h2 style={{ ...titleFont, fontSize: 44, lineHeight: 1.1, margin: 0 }}>{title}</h2>
  </div>
)

function SlideTitle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', height: '100%' }}>
      <p style={eyebrow}>Product & Design Leadership Review</p>
      <h1 style={{ ...titleFont, fontSize: 72, lineHeight: 1.05, margin: 0 }}>
        Action incomplete<br/>Rover Cards
      </h1>
      <p style={{ ...body, fontSize: 26, color: stage.muted }}>from the app · April 30, 2026</p>
    </div>
  )
}

function SlideTLDR() {
  return (
    <div>
      <SlideHeader eyebrowText="TL;DR" title="What we're shipping" />
      <Bullets items={[
        "Productize the missed Rover Card flow on the sitter's Home tab.",
        "Reduce delayed payouts, owner refund delays, and reliance on CX.",
        "v1 ships with end-of-week payment logic update — immediate refunds deferred to a follow-up.",
      ]} />
    </div>
  )
}

function SlideProblem() {
  return (
    <div>
      <SlideHeader eyebrowText="Problem" title="Today, missing a Rover Card means…" />
      <Bullets items={[
        "Sitters contact CX (limited to 5 manual fixes per provider) or wait for the Monday email.",
        "Owners' refunds are held alongside the sitter's payout for up to two weeks.",
        "Confusion and frustration with the recurring feature — and ultimately off-platform attrition.",
      ]} />
    </div>
  )
}

function SlideNumbers() {
  return (
    <div>
      <SlideHeader eyebrowText="By the numbers" title="The cost of the current flow" />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Stat value="10%" label="of weekly recurring stays have ≥1 missing Rover Card (20% at Christmas)" />
        <Stat value="8–9%" label="of recurring bookings see delayed payouts and refunds each week" />
        <Stat value="50%" label="of stays with missing Rover Cards are never paid out" />
        <Stat value="5%" label="of cases get manually resolved by CX today" />
      </div>
      <p style={{ ...muted, marginTop: 24 }}>Source: 1P doc · Mode dashboard</p>
    </div>
  )
}

function SlideHypothesis() {
  return (
    <div>
      <SlideHeader eyebrowText="Hypothesis" title="If sitters can resolve missing cards in‑app…" />
      <p style={{ ...body, fontSize: 28, lineHeight: 1.4, maxWidth: 900 }}>
        …we'll reduce payment holds, shorten the path to payout, and cut CX volume —
        without rebuilding the email and CX safety net.
      </p>
      <p style={{ ...muted, marginTop: 24, maxWidth: 900 }}>
        We'll know it worked when payment holds drop, delayed payments drop, and CX tickets
        for missing Rover Cards trend toward zero.
      </p>
    </div>
  )
}

function SlideSolution() {
  const items = [
    { n: '1', t: '"Incomplete" section at the top of Home', d: 'One card per missed unit — date, time, pet, service.' },
    { n: '2', t: '"Did the walk happen?" review sheet', d: 'Yes / No, with No pre‑selected. One primary "Submit" CTA.' },
    { n: '3', t: 'Confirmation in the conversation', d: 'A system message lets the owner know what happened.' },
    { n: '4', t: 'End‑of‑week payment logic uses sitter answers', d: 'No payment hold if every unit is accounted for.' },
  ]
  return (
    <div>
      <SlideHeader eyebrowText="Solution" title="What we built" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map(({ n, t, d }) => (
          <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: 99,
              background: stage.accent, color: stage.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 18,
            }}>{n}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <p style={{ ...body, fontWeight: 700 }}>{t}</p>
              <p style={muted}>{d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideWalkthrough() {
  const steps = [
    { t: 'Home', d: 'Per‑unit "Incomplete" cards at the top of the day.' },
    { t: 'Review sheet', d: 'Yes / No with No pre‑selected — primary "Submit".' },
    { t: 'System message', d: 'Owner sees the outcome in the conversation.' },
  ]
  return (
    <div>
      <SlideHeader eyebrowText="Design walkthrough" title="Three surfaces, one decision" />
      <div style={{ display: 'flex', gap: 16 }}>
        {steps.map(({ t, d }, i) => (
          <div key={t} style={{
            flex: 1, minWidth: 0, padding: 24, borderRadius: 12,
            background: stage.card, border: `1px solid ${stage.rule}`,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{ ...muted, fontSize: 14, fontWeight: 700, color: stage.accent }}>STEP {i + 1}</p>
            <p style={{ ...body, fontWeight: 700, fontSize: 24 }}>{t}</p>
            <p style={muted}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideDemo() {
  const src = import.meta.env.BASE_URL
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div>
        <p style={eyebrow}>Live demo</p>
        <h2 style={{ ...titleFont, fontSize: 32, lineHeight: 1.2, margin: '8px 0 0' }}>
          Click around — the prototype is embedded below
        </h2>
      </div>
      <div style={{
        flex: 1, minHeight: 0,
        background: '#000', borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${stage.rule}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <iframe
          src={src}
          title="Incomplete Cards prototype"
          style={{
            width: 390, height: '100%', maxHeight: 812,
            border: 0, background: '#fff', borderRadius: 8,
          }}
        />
      </div>
    </div>
  )
}

function SlideDecisions() {
  const items = [
    { t: 'No immediate refunds in v1', d: 'Defer to end‑of‑week processing — accepted 2026‑04‑29 after Ion / Jake / Bernardo discussion.' },
    { t: 'No "More" actions menu on cards', d: 'Single "Review and submit" CTA; multi‑action affordance returns in a later round.' },
    { t: '"No" is pre‑selected', d: '95% of missing Rover Cards turn out to be services that didn\'t happen — match the most likely answer.' },
    { t: '7‑day visibility window', d: 'Cards stay visible until resolved or 7 days after the booking ends — no permanent backlog.' },
  ]
  return (
    <div>
      <SlideHeader eyebrowText="v1 decisions" title="What we cut, and why" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map(({ t, d }) => (
          <div key={t} style={{
            padding: '18px 22px', borderRadius: 10,
            background: stage.card, border: `1px solid ${stage.rule}`,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ ...body, fontWeight: 700 }}>{t}</p>
            <p style={muted}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideRisks() {
  const items = [
    { t: 'Payments and orders complexity', d: 'Reviews from both teams on 1P, Specs, and RFC; regression test plan; CX smoke test.' },
    { t: 'Rover Cards aren\'t tied to a unit today', d: 'Spike to link first card of the day to first unit; CX‑created cards use the time selected.' },
    { t: 'Email + CX flow regression', d: 'Existing flow keeps working; landing page filters out units already resolved in‑app.' },
  ]
  return (
    <div>
      <SlideHeader eyebrowText="Risks & mitigations" title="What could break, and how we hedge" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map(({ t, d }) => (
          <div key={t} style={{
            padding: '18px 22px', borderRadius: 10,
            background: stage.card, border: `1px solid ${stage.rule}`,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ ...body, fontWeight: 700 }}>{t}</p>
            <p style={muted}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideRollout() {
  const stages = ['10%', '25%', '50%', '100%']
  return (
    <div>
      <SlideHeader eyebrowText="Rollout" title="Gradual, behind a feature flag" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {stages.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{
              padding: '14px 22px', borderRadius: 99,
              background: i === 3 ? stage.accent : stage.card,
              color: i === 3 ? stage.card : stage.ink,
              border: `1px solid ${i === 3 ? stage.accent : stage.rule}`,
              fontFamily: typography.fontFamily, fontWeight: 700, fontSize: 20,
            }}>{s}</div>
            {i < stages.length - 1 && <span style={{ ...muted, fontSize: 22 }}>→</span>}
          </React.Fragment>
        ))}
      </div>
      <p style={{ ...body, maxWidth: 880 }}>
        One business day per stage. The "Action required" email landing page filters out
        units already resolved in‑app, so sitters never see a stale to‑do.
      </p>
    </div>
  )
}

function SlideMetrics() {
  return (
    <div>
      <SlideHeader eyebrowText="Success metrics" title="How we'll know it worked" />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Stat value="↓" label="% share of payment holds in recurring bookings (currently ~10%/wk)" />
        <Stat value="↓" label="% delayed payments in recurring bookings (currently 8–9%/wk)" />
        <Stat value="↓" label="CX ticket volume for missing Rover Cards" />
        <Stat value="↑" label="Qualitative sitter and owner sentiment around recurring" />
      </div>
    </div>
  )
}

function SlideNext() {
  return (
    <div>
      <SlideHeader eyebrowText="What's next" title="Beyond v1" />
      <Bullets items={[
        "v2 — revisit immediate refunds with fee‑impact data from Mode.",
        "Deprecate the Monday \"Action required\" email entirely once in‑app coverage is high.",
        "Make Rover Cards optional for established recurring relationships.",
      ]} />
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${stage.rule}` }}>
        <p style={{ ...muted, marginBottom: 8 }}>Read more</p>
        <p style={{ ...body, fontSize: 18, color: stage.accent }}>
          1P · Functional Specs · RFC · Figma (UX2‑7159) · #temp‑action‑missing‑rover‑cards
        </p>
      </div>
    </div>
  )
}

const SLIDES = [
  SlideTitle, SlideTLDR, SlideProblem, SlideNumbers, SlideHypothesis,
  SlideSolution, SlideWalkthrough, SlideDemo, SlideDecisions, SlideRisks,
  SlideRollout, SlideMetrics, SlideNext,
]

export default function DeckScreen({ onClose }) {
  const [i, setI] = useState(0)
  const total = SLIDES.length
  const Slide = SLIDES[i]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        setI((n) => Math.min(n + 1, total - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setI((n) => Math.max(n - 1, 0))
      } else if (e.key === 'Home') {
        setI(0)
      } else if (e.key === 'End') {
        setI(total - 1)
      } else if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, total])

  const next = () => setI((n) => Math.min(n + 1, total - 1))
  const prev = () => setI((n) => Math.max(n - 1, 0))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: stage.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: typography.fontFamily,
    }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0, padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'rgba(255,255,255,0.7)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
          INCOMPLETE ROVER CARDS · LEADERSHIP REVIEW
        </span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {i + 1} / {total}
        </span>
        <button onClick={onClose} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.85)', padding: '6px 14px', borderRadius: 99,
          fontFamily: typography.fontFamily, fontWeight: 600, fontSize: 13,
          cursor: 'pointer',
        }}>Exit · Esc</button>
      </div>

      {/* Stage */}
      <div style={{
        flex: 1, minHeight: 0, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', maxWidth: 1200, aspectRatio: '16 / 9',
          maxHeight: 'calc(100vh - 140px)',
          background: stage.card, borderRadius: 16,
          padding: '56px 64px', boxSizing: 'border-box',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Slide />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0, padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <button onClick={prev} disabled={i === 0} style={navBtn(i === 0)}>← Prev</button>
        <button onClick={next} disabled={i === total - 1} style={navBtn(i === total - 1)}>Next →</button>
      </div>
    </div>
  )
}

function navBtn(disabled) {
  return {
    background: disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.92)',
    padding: '10px 20px', borderRadius: 99,
    fontFamily: typography.fontFamily, fontWeight: 600, fontSize: 15,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}
