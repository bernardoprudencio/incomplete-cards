# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rover – Incomplete Cards Prototype** — An interactive React prototype for user testing the "Decrease Missed Rover Cards" UX flow. Figma source: [UX2-7159](https://www.figma.com/design/xqBd8IpIkViuhZ9BcPvnid/-UX2-7159--Decrease-missed-Rover-Cards?node-id=16783-5188).

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server at http://localhost:5173
npm run build   # Production build
npm run preview # Preview production build
```

No linting or test setup exists in this project.

## Architecture

**Routing:** State-driven (no React Router). `App.jsx` owns `screen` state (`'home'` | `'conversation'`), `actionSheet` visibility, and CSS transition direction. Screen switches trigger animated slide transitions via CSS transforms.

**Design Tokens:** All colors, spacing, radius, shadows, and typography are centralized in `src/tokens/tokens.js`. Use these values instead of hardcoding CSS — spacing is an 8-based scale (4, 8, 12, 16, 24, 32px), and the palette uses semantic names (primary, secondary, success, link, etc.).

**Component Variants:** `Button.jsx` supports `default`, `primary`, `flat`, and `disabled` variants via a `variant` prop. SVG icons live in `src/assets/icons.jsx` as named React components (17 total).

**Responsive Behavior:** On desktop, the app renders inside a 375×812px phone frame with a CSS shadow shell (`global.css`). On mobile (≤420px viewport), it goes full-screen for native-feeling user tests.

**No Backend:** All data (pet names, images, service info) is hardcoded in components or imported from `src/assets/images.js`. No API calls or state management libraries.

**Styling:** All styles are inline via `style` props — no CSS modules. Tokens are imported and referenced directly. The only CSS file is `global.css` (phone frame, scroll helpers, `@keyframes slideUp`/`spin`).

## App State & Navigation Flow

`App.jsx` is the single source of truth. Key state:

| State | Type | Purpose |
|-------|------|---------|
| `screen` | `'home'` \| `'conversation'` | Which screen is visible |
| `conversation` | `{ type, card? }` | Passed to ConversationScreen |
| `sheetItem` | object \| null | Controls ActionSheet content |
| `reviewSheetCard` | card \| null | Controls ReviewSheet (completion confirm) |
| `resolvedCards` | `{ [cardId]: { resolution, timestamp } }` | Completed/cancelled cards; hidden from HomeScreen |
| `liveEvents` | array | Messages + schedule changes shown in ConversationScreen |
| `loadTime` | string | Cached on mount via `useLoadTime()` |

**Navigation path:**
1. HomeScreen → tap card → `openIncompleteSheet()` → ActionSheet
2. ActionSheet "Go to conversation" → `navigateTo('conversation')` + sets `conversation` state
3. ConversationScreen renders; "Schedule" tab shows `RelationshipScreen` (embedded, not a separate screen)
4. RelationshipScreen fetches initial units via `getOwnerRelUnit(owner)` on first render
5. Editing schedule → callbacks bubble up to App → appended to `liveEvents`

## Screen & Component Inventory

### Screens (`src/screens/`)
| File | Description |
|------|-------------|
| `HomeScreen.jsx` | Dashboard: incomplete cards from last week, today's scheduled walks, promo cards |
| `ConversationScreen.jsx` | Chat interface + Schedule tab; embeds RelationshipScreen |
| `RelationshipScreen.jsx` | Full schedule UI: agenda view, add/manage/edit dialogs, billing confirmations |
| `ScheduleScreen.jsx` | Unused wrapper — real schedule logic lives in RelationshipScreen |

### Relationship sub-components (`src/screens/relationship/`)
| File | Description |
|------|-------------|
| `AgendaView.jsx` | Renders month→week→day→occurrences; payment status; incomplete badge |
| `AddSheet.jsx` | Bottom sheet to add a new recurring service |
| `OccActionSheet.jsx` | Edit/skip/override a single occurrence (or from-date-forward) |
| `ManageSheet.jsx` | List and cancel/modify multiple units |
| `DeleteConfirmDialog.jsx` | Cancellation confirmation with refund/keep-paid options |
| `UnitEditor.jsx` | Form for service details: type, duration, pets, time, frequency, weekdays |
| `theme.js` | Local token aliases + shared `labelSt` style object |

### Reusable components (`src/components/`)
| File | Description |
|------|-------------|
| `Button.jsx` | 4 variants (default/primary/flat/disabled), 3 sizes, icon support |
| `ActionSheet.jsx` | Bottom modal for incomplete/today card actions |
| `ReviewSheet.jsx` | Completion confirmation (Yes/No chips) |
| `Row.jsx` | List item with label, sublabel, left/right slots — used throughout |
| `ChatBubble.jsx` | Message bubble; owner vs. client sides |
| `BannerBlock.jsx` | Yellow info banner with clock icon |
| `PetAvatar.jsx` | Circular image; multiple pets overlap |
| `BottomSheet.jsx` | Generic slide-up modal wrapper |
| `Chip.jsx` | Toggle chip with optional checkmark/remove |
| `RadioRow.jsx` | Radio + label row |
| `TimeInput.jsx` / `CalInput.jsx` / `DisabledInput.jsx` | Form inputs |

## Key Business Logic

See [`docs/schedule-logic.md`](docs/schedule-logic.md) for the full reference. Summary:

**Date anchor:** `PROTO_TODAY = new Date()` in `src/data/owners.js` — evaluated once on module load. All schedule math is relative to this value.

**Unit** — the recurring-service rule (what, when, how often, for whom, at what cost). Stored as a plain object. See `scheduleHelpers.js:defaultUnit` for the full shape.

**Occurrence** — a single instance derived from a unit. Generated on the fly by `expandUnit(unit)`.

**Key functions in `src/lib/scheduleHelpers.js`:**
- `expandUnit(unit)` — generates all occurrences up to ~6 months out (or 8 weeks from today, whichever is further); caps at 120 total
- `buildAgenda(units, relEndDate?)` — flattens all units into a sorted day-keyed list for AgendaView; filters skips; explodes overnight stays across multiple days
- `getRuleImpact(unit, allUnits)` — calculates refund/charge impact of cancellation; used by all confirmation dialogs
- `getPaidThruSunday(units)` — the billing cutoff: Sunday of the week containing the earliest `startDate`
- `shortRuleLabel(unit)` — human-readable recurrence label (e.g. "Mon, Wed and Fri")

**Data sources in `src/data/`:**
- `owners.js` — 3 hardcoded clients (Owen, James, Sarah) with pet info, schedule templates, and `getIncompleteCards()` / `getTodayWalks()` / `getOwnerRelUnit()`
- `services.js` — 5 service types; `DURATION_SHORT` / `DURATION_DAYCARE` option arrays; `FREQ` / `WEEKDAYS` constants
