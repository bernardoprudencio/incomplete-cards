# Rover – Incomplete Cards Prototype

Interactive prototype for user testing the "Decrease Missed Rover Cards" flow.

**Figma source:** [UX2-7159 – Decrease Missed Rover Cards](https://www.figma.com/design/xqBd8IpIkViuhZ9BcPvnid/-UX2-7159--Decrease-missed-Rover-Cards?node-id=16783-5188)

## Branches

| Branch | Purpose | Live URL |
|---|---|---|
| `main` | Baseline prototype | https://bernardoprudencio.github.io/prototype/ |
| `new-modification` | Active iteration (current) | https://bernardoprudencio.github.io/prototype/new-modification/ |
| `ongoing-relationships` | Separate UX exploration | https://bernardoprudencio.github.io/prototype/ongoing-relationships/ |

## Setup

```bash
npm install
npm run dev   # → http://localhost:5173/prototype/ (port may vary)
```

## What this prototype covers

The flow a sitter sees when they have incomplete Rover Cards — services that were completed but not officially logged. The prototype tests whether surfacing these cards more prominently (and streamlining resolution) reduces missed cards.

**Three screens:**
1. **HomeScreen** — Lists incomplete cards and today's scheduled walks. Cards are directly tappable to jump to the conversation.
2. **ConversationScreen** — The message thread with the pet parent. Shows walk banners, lets the sitter mark the service complete or cancel with refund, and modify the recurring schedule.
3. **ScheduleScreen** — Modify the weekly recurring schedule for an owner. Changes surface back in the conversation as a summary message.

## Navigation

State-driven (no React Router). `App.jsx` owns all state:

```
Home → Conversation       tap a card row, or "Start Rover Card" / "Go to conversation" in action sheet
Home → Conversation       after completing/cancelling via ReviewSheet
Conversation → Schedule   "Modify schedule" button in conversation header
Schedule → Conversation   back button (with optional schedule change summary injected into chat)
Conversation → Home       back button
```

## Key files

| File | What it does |
|---|---|
| `src/App.jsx` | Shell, all state, navigation logic, transition animations |
| `src/screens/HomeScreen.jsx` | Home tab — incomplete cards + today's walks |
| `src/screens/ConversationScreen.jsx` | Message thread — hardcoded per card, supports resolution banners + schedule change messages |
| `src/screens/ScheduleScreen.jsx` | Weekly schedule modifier |
| `src/components/ActionSheet.jsx` | Bottom sheet — options for incomplete cards and today walks |
| `src/components/ReviewSheet.jsx` | Complete / cancel+refund flow |
| `src/data/bookings.js` | `INCOMPLETE_CARDS` — the two mock incomplete cards (Archie, Milo) |
| `src/data/owners.js` | `OWNERS` + `getTodayWalks()` — today's scheduled walks derived from owner templates |
| `src/tokens/tokens.js` | All design tokens: colors, spacing, radius, shadows, typography |
| `src/assets/icons.jsx` | 17 SVG icons as named React components |

## Schedule data model

### Three layers of schedule data

```
owner.template  →  upcoming weeks  →  current week
(repeating rule)    (editable slots)   (read-only, this week)
```

**1. Template** (`owner.template` in `src/data/owners.js`)

The owner's repeating weekly schedule — an array of `{ day, time }` entries:

```js
template: [
  { day: 'Monday',    time: '9:00 AM' },
  { day: 'Wednesday', time: '9:00 AM' },
  { day: 'Friday',    time: '9:00 AM' },
]
```

This is the source of truth that drives everything else. It is editable via **EditTemplateScreen**.

---

**2. Upcoming weeks** (`getOwnerUpcomingWeeks` in `src/data/owners.js`)

Derived from the template. Generates 5 weeks starting next Monday. Template entries for the same day are grouped into a single row with multiple slots:

```js
// { day: 'Friday', slots: [{ time: '9:00 AM' }, { time: '11:00 AM' }] }
```

Upcoming weeks are **individually editable** in ScheduleScreen (add/remove days and slots per week). Edits are confirmed with a diff summary and a "Confirm and notify" step. Confirmed edits are persisted in `ownerWeeks` state in `App.jsx` and survive navigation.

---

**3. Current week** (`getOwnerCurrentWeek` in `src/data/owners.js`)

Derives this week's scheduled days from the **static original template** (`OWNERS[owner.id]`). Always read-only — it is never affected by template edits or upcoming-week overrides. Displayed as a non-editable overview card in ScheduleScreen.

---

### How template edits interact with upcoming weeks

When the sitter saves a new template in **EditTemplateScreen**:

1. The new template **fully replaces** upcoming weeks — `applyTemplateToWeeks` regenerates all 5 weeks from scratch using the new template. Any prior per-week overrides are discarded.
2. `ownerTemplates[ownerId]` is updated so `getEffectiveOwner` returns the new template everywhere.
3. `ownerWeeks[ownerId]` is updated with the freshly generated weeks.
4. `ownerSameSchedule[ownerId]` persists whether the "Use same schedule for all days" toggle was on, so the EditTemplateScreen restores the correct state on next visit.
5. The current week card is **not affected** — it always reads from the static `OWNERS` object.
6. A template diff message (`templateChanges`) is appended to the conversation: one new chat bubble per save.

---

### State that lives in `App.jsx`

| State | Type | Purpose |
|---|---|---|
| `ownerTemplates` | `{ ownerId: [{day, time}] }` | Per-owner template overrides (replaces `owner.template`) |
| `ownerWeeks` | `{ ownerId: weeks[] }` | Persisted upcoming weeks (from template saves or per-week edits) |
| `ownerSameSchedule` | `{ ownerId: bool }` | Whether "same schedule" toggle was on at last template save |

`getEffectiveOwner(owner)` merges `ownerTemplates` into the base owner object at render time, so all screens downstream always see the latest template without prop drilling.

---

### Save / confirm flows

**Upcoming week edits (ScheduleScreen)**
- User edits slots directly in the week list
- "Save changes" button → ConfirmSheet / ConfirmModal shows a diff (day + date, removed/added times)
- On "Confirm and notify": edits become the new base, `onWeeksChange` fires immediately (persists to App before back-navigation), and a success banner appears
- Diff is injected into the conversation as a chat bubble on back-navigation

**Template edits (EditTemplateScreen)**
- "Save changes" is disabled until the form differs from the last saved template (days, times, or same-schedule toggle)
- On save: ConfirmSheet / ConfirmModal shows a template diff (day name only, no dates)
- On "Confirm and notify": template + weeks are regenerated, success banner appears — user stays on screen and navigates back manually
- Each confirmation appends a new chat bubble to the conversation (does not overwrite previous saves)

---

## Mock data

- **Incomplete cards:** Archie (James T., Mar 18 dog walk) and Milo/koni-late (Sarah S., Mar 12 delayed check-in)
- **Today's walks:** Derived from owner weekly templates filtered to `PROTO_TODAY` (Friday, Mar 20 2026). Owen O. walks Koni + Burley at 9 AM.
- **Conversations:** Fully hardcoded per card in `ConversationScreen.jsx` — no API calls.

## Deploy

Deployments are triggered automatically on push via GitHub Actions (`.github/workflows/deploy.yml`). Each branch builds to its own subdirectory on the `gh-pages` branch of `bernardoprudencio/prototype`.

```bash
# Manual deploy is not needed — just push to the branch.
git push origin new-modification
```

## Responsive

- **Desktop:** renders inside a 375×812px phone frame with CSS shadow shell
- **Mobile (≤420px):** goes full-screen for native-feeling user tests
