# Rover – Incomplete Cards Prototype

Interactive prototype for user testing the "Decrease Missed Rover Cards" flow.

**Figma source:** [UX2-7159 – Decrease Missed Rover Cards](https://www.figma.com/design/xqBd8IpIkViuhZ9BcPvnid/-UX2-7159--Decrease-missed-Rover-Cards?node-id=16783-5188)

## Branches

| Branch | Purpose | Live URL |
|---|---|---|
| `main` | Baseline prototype | https://bernardoprudencio.github.io/prototype/ |
| `new-modification` | Streamlined resolution flow with separate schedule screen | https://bernardoprudencio.github.io/prototype/new-modification/ |
| `ongoing-relationships` | Relationship-first UX — schedule as a tab inside the conversation | https://bernardoprudencio.github.io/prototype/ongoing-relationships/ |

## Setup

```bash
npm install
npm run dev   # → http://localhost:5173/prototype/ (port may vary)
```

## What this prototype covers

The flow a sitter sees when they have incomplete Rover Cards — services that were completed but not officially logged. The prototype tests whether surfacing these cards more prominently (and streamlining resolution) reduces missed cards.

## Branch differences

### `new-modification`
- Resolving incomplete cards (complete or cancel+refund) via ReviewSheet
- Modify schedule navigates to a dedicated **ScheduleScreen** (week-by-week modifier)
- Schedule changes surface back in the conversation as a summary message

### `ongoing-relationships` *(this branch)*
- Same resolution flow as `new-modification`
- Schedule management is a **tab inside the conversation** (Messages / Schedule), powered by RelationshipScreen — no separate screen push
- Modify schedule button in the conversation header also navigates to the dedicated ScheduleScreen for week-by-week edits
- All live events (card resolutions, schedule changes, sent messages) are appended to a shared ordered list so they appear in the conversation in the order they happened
- Functional message composer — type and send messages, they persist while navigating to the schedule screen and back

## Screens

1. **HomeScreen** — Lists incomplete cards and today's scheduled walks. All rows are tappable to jump to the conversation.
2. **ConversationScreen** — Message thread with the pet parent. Has Messages / Schedule tabs. Supports resolution banners, schedule change summaries, and a live composer. "Modify schedule" navigates to ScheduleScreen.
3. **ScheduleScreen** — Week-by-week recurring schedule modifier. Changes are appended to the conversation as a chat message on return.
4. **RelationshipScreen** — Shown as the Schedule tab inside ConversationScreen. Relationship-level view of pet profiles and service settings.

## Navigation

State-driven (no React Router). `App.jsx` owns all state:

```
Home → Conversation         tap a card row, or "Start Rover Card" / "Go to conversation" in action sheet
Home → Conversation         after completing/cancelling via ReviewSheet
Conversation → Schedule     "Modify schedule" button in conversation header
Schedule → Conversation     back button (schedule change event appended to liveEvents)
Conversation → Home         back button
```

## Key files

| File | What it does |
|---|---|
| `src/App.jsx` | Shell, all state (including `liveEvents`), navigation logic, transition animations |
| `src/screens/HomeScreen.jsx` | Home tab — incomplete cards + today's walks |
| `src/screens/ConversationScreen.jsx` | Message thread — Messages/Schedule tabs, live composer, ordered event rendering |
| `src/screens/ScheduleScreen.jsx` | Weekly schedule modifier |
| `src/screens/RelationshipScreen.jsx` | Schedule tab inside the conversation — pet profiles and service settings |
| `src/components/ActionSheet.jsx` | Bottom sheet — options for incomplete cards and today walks |
| `src/components/ReviewSheet.jsx` | Complete / cancel+refund flow |
| `src/components/Chip.jsx` | Reusable Kibble Chip — supports selected, checkmark, and removable variants |
| `src/data/bookings.js` | `INCOMPLETE_CARDS` — the two mock incomplete cards (Archie, Milo) |
| `src/data/owners.js` | `OWNERS` + `getTodayWalks()` — today's scheduled walks derived from owner templates |
| `src/tokens/tokens.js` | All design tokens: colors, spacing, radius, shadows, typography |
| `src/assets/icons.jsx` | SVG icons as named React components |

## Mock data

- **Incomplete cards:** Archie (James T., Mar 18 dog walk) and Milo/koni-late (Sarah S., Mar 12 delayed check-in)
- **Today's walks:** Derived from owner weekly templates filtered to `PROTO_TODAY` (Friday, Mar 20 2026). Owen O. walks Koni + Burley at 9 AM.
- **Conversations:** Fully hardcoded per card in `ConversationScreen.jsx` — no API calls.

## Deploy

Deployments are triggered automatically on push via GitHub Actions (`.github/workflows/deploy.yml`). Each branch builds to its own subdirectory on the `gh-pages` branch of `bernardoprudencio/prototype`.

```bash
# Manual deploy is not needed — just push to the branch.
git push origin ongoing-relationships
```

## Responsive

- **Desktop:** renders inside a 375×812px phone frame with CSS shadow shell
- **Mobile (≤420px):** goes full-screen for native-feeling user tests
