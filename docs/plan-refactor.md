# Refactor Plan: Sitter Prototype — Scalability, Cleanup & Consistency

## Context
The prototype has grown organically. RelationshipScreen.jsx is ~1,500 lines and contains business logic, UI components, style atoms, and data constants all mixed together. ScheduleScreen.jsx has a similar problem at ~1,100 lines. Repeated patterns (radio rows, sheet wrappers, disabled inputs, refund confirmations) are implemented slightly differently each time. This plan reorganizes everything into a cleaner, more maintainable shape — same visual output, same behavior, easier to build on.

---

## Phase 1 — Centralize data and constants

**Goal:** All shared data that any screen might need lives in one place.

### 1a. Create `src/data/services.js`
Move out of RelationshipScreen:
```
SERVICES        — 5 service types (id, label, icon, desc, type, hourBased)
DURATION_SHORT  — 4 duration options
DURATION_DAYCARE — 3 hour-based options
FREQ            — 3 frequency options (once / weekly / monthly)
WEEKDAYS        — ["Sun","Mon",...,"Sat"]
PET_EMOJIS      — 8 emoji options
```

### 1b. Elevate pet seed data to `src/data/owners.js`
`PETS_SEED` (Louie + Mochi) is defined inline in RelationshipScreen. Move it into owners.js next to the owner data so `getOwnerRelUnit()` can reference it directly.

### 1c. Add spacing scale to `src/tokens/tokens.js`
The app uses 4/8/12/16/24/32px consistently but it's never declared. Add:
```js
spacing: { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }
```
No changes to existing token keys.

### 1d. Remove `src/data/bookings.js`
`INCOMPLETE_CARDS` is defined both here and derived dynamically in `owners.js → getIncompleteCards()`. The static file is unused dead code — delete it and update the one import in HomeScreen to use the dynamic version.

---

## Phase 2 — Extract shared utilities

**Goal:** No function is defined twice. Date math and billing helpers live in one importable module.

### 2a. Create `src/lib/dateUtils.js`
Move from RelationshipScreen (and deduplicate from owners.js / ScheduleScreen):
```
parseDate, dateKey, fmtDate, fmtDateFull, fmtDateLong, fmtMonthYear,
fmtTime, fmtRelDate, addDays, addWeeks, addMonths,
isToday, isYesterday, isPast, nightCount, endTimeFromDuration
```
owners.js and ScheduleScreen have their own versions of `toMins()`, `formatTimeRange()`, `formatHeaderDate()` — consolidate or alias from this module.

### 2b. Create `src/lib/scheduleHelpers.js`
Move the pure schedule/billing logic out of RelationshipScreen:
```
getWeekMonday, getWeekSunday,
getPaidThruSunday, isPaidOcc,
newId, defaultUnit, cloneUnit,
overlaps, overnightCanRepeat,
expandUnit, buildAgenda,
ruleLabel, shortRuleLabel, durLabel, shortSvcName
```
These are pure functions with no React dependencies — they can be tested in isolation and reused by ScheduleScreen.

---

## Phase 3 — Extract UI components

**Goal:** Components defined inside screen files become importable, self-contained files.

### 3a. `src/components/BottomSheet.jsx`
There are currently two variants of the overlay+sheet wrapper:
- `simpleSheet` inside OccActionSheet (8px border-radius, 80vh)
- Full-height used in ManageSheet, DeleteConfirmDialog, AddSheet (16–20px radius, 92vh)

Unify into one component with a `variant` prop (`"simple" | "full"`):
```jsx
<BottomSheet variant="full" onDismiss={...}>
  {children}
</BottomSheet>
```
Drag handle rendered automatically. Overlay click triggers onDismiss.

### 3b. `src/components/RadioRow.jsx`
`radioRow(label, value)` is defined identically inside AddSheet and OccActionSheet. Extract to a standalone component:
```jsx
<RadioRow label="This one" value="this" selected={scope} onSelect={setScope} />
```

### 3c. `src/components/DisabledInput.jsx`
The "read-only field" pattern (disabled start date, disabled end date) appears 2–3 times with identical markup. Extract:
```jsx
<DisabledInput value="Monday, January 5" icon={<DropdownIcon/>} />
```

### 3d. `src/components/CalInput.jsx` (extract from RelationshipScreen)
Self-contained calendar picker — move to `src/components/CalInput.jsx`. No behavior change.

### 3e. `src/components/TimeInput.jsx` (extract from RelationshipScreen)
Self-contained time picker — move to `src/components/TimeInput.jsx`. No behavior change.

### 3f. Move inline SVGs into `src/assets/icons.jsx`
RelationshipScreen and ScheduleScreen both define their own local icon components (`TrashIcon`, `CloseSmIcon`, etc.). Move these into the central icons file and import from there.

---

## Phase 4 — Split RelationshipScreen into focused files

**Goal:** RelationshipScreen.jsx goes from ~1,500 lines to ~400 lines. Each extracted file has one clear job.

### Proposed split:

| New File | Contents | Approx Lines |
|---|---|---|
| `src/screens/relationship/RelationshipScreen.jsx` | Main component only: state, scroll logic, layout, bottom bar | ~400 |
| `src/screens/relationship/AgendaView.jsx` | AgendaView component (agenda rendering, week/month grouping) | ~200 |
| `src/screens/relationship/UnitEditor.jsx` | UnitEditor + PetSelector + PetPanel + Chip (local variant) | ~200 |
| `src/screens/relationship/AddSheet.jsx` | AddSheet with 4 sub-views | ~150 |
| `src/screens/relationship/OccActionSheet.jsx` | OccActionSheet with 4 sub-views | ~150 |
| `src/screens/relationship/ManageSheet.jsx` | ManageSheet (list/edit/cancel) | ~180 |
| `src/screens/relationship/DeleteConfirmDialog.jsx` | DeleteConfirmDialog | ~80 |

`src/screens/relationship/index.js` re-exports `RelationshipScreen` so all existing imports keep working.

---

## Phase 5 — Normalize refund/charge logic

**Goal:** All cancel/charge confirmation UIs use the same helpers and show consistent information.

### Current problems:
- **OccActionSheet** calculates refund as `occ.unit.cost || 0` (single occurrence, no aggregation)
- **ManageSheet** aggregates with `expandUnit(u).filter(isPaidOcc)` but uses a local `paidThru` computed only from the editing unit's rule
- **DeleteConfirmDialog** does the full split (paid + unpaid upcoming) correctly, using `getPaidThruSunday(units)` across all units
- **AddSheet** has a charge confirmation but no cost calculation at all

### Fix:
Create a shared helper in `src/lib/scheduleHelpers.js`:
```js
function getRuleImpact(unit, allUnits) {
  const paidThru = getPaidThruSunday(allUnits)
  const todayMid = ...
  const occs = expandUnit(unit).filter(o => !o.skipped)
  return {
    paidOccs:         occs.filter(o => isPaidOcc(o.start, paidThru) && o.start >= todayMid),
    unpaidUpcoming:   occs.filter(o => !isPaidOcc(o.start, paidThru) && o.start >= todayMid),
    refundTotal:      ...,
    chargeTotal:      ...,
  }
}
```

All four confirmation UIs (OccActionSheet, ManageSheet, DeleteConfirmDialog, AddSheet) call `getRuleImpact()` and render from its output. This removes the divergence.

---

## Phase 6 — Dead code removal

Remove/clean these confirmed dead items:

| Item | Location | Action |
|---|---|---|
| `onDuplicate` param | UnitEditor | Remove (never passed) |
| `onChangeType` param | UnitEditor | Remove (never used) |
| `showRemove`, `showChangeType` params | UnitEditor | Remove |
| `onRelEndDateChange` | ManageSheet | Remove |
| `onPetsChange` | ManageSheet | Remove |
| `onUnitListChange` | ManageSheet | Remove |
| `ChangeTypeSheet` component | RelationshipScreen | Remove (never rendered) |
| `cloneUnit` function | RelationshipScreen | Remove (never called) |
| `ruleLabel`, `durLabel` | RelationshipScreen | Remove (shortRuleLabel used instead) |
| `DAYS_S` | RelationshipScreen | Remove |
| `fmtDateFull` | RelationshipScreen | Remove |
| `btnSmall`, `btnSmallDestructive`, `btnDestructive` local style objects | RelationshipScreen | Remove (Button component used) |
| `btnPrimary`, `btnGhost` local style objects | RelationshipScreen | Remove |
| `PetPanel` component | RelationshipScreen | Remove if confirmed unused |
| `togglePet` function | UnitEditor | Remove |
| `HomeCard` component | `src/components/` | Remove (0 usages) |
| `bookings.js` | `src/data/` | Delete file |
| `colors.cyan200` | tokens.js | Remove (0 usages) |

---

## Phase 7 — Style consistency pass

Small targeted fixes to make repeated patterns identical:

1. **Sheet sizing**: Standardize to `borderRadius: "16px 16px 0 0"` and `maxHeight: "92vh"` via the new `BottomSheet` component (Phase 3a)
2. **Overlay color**: All overlays use `rgba(10,18,30,0.5)` — verify this is consistent, one place to change it now
3. **Drag handle**: `36×5px`, `borderRadius: 35`, `background: R.border` — rendered once inside `BottomSheet`
4. **Confirmation screen structure**: All confirmation views (charge, refund, cancel) use the same layout: description text → optional detail rows → primary action button → secondary/close button
5. **`R` alias object**: Keep it in RelationshipScreen (it's a local shorthand, fine for one file) but remove all the duplicate non-token values (`grayMid: "#767C82"`, `redLight: "#FDECEA"`, etc.) by adding them to tokens.js as named semantic colors

---

## Execution order

1. Phase 1 (data/constants) — no UI changes, safe foundation
2. Phase 2 (lib utilities) — pure functions, easy to verify
3. Phase 6 (dead code) — reduces noise before splitting
4. Phase 3 (new shared components) — build BottomSheet, RadioRow, DisabledInput, extract CalInput/TimeInput
5. Phase 4 (split RelationshipScreen) — now that utilities + components are ready
6. Phase 5 (normalize refund logic) — do this inside Phase 4 as ManageSheet/OccActionSheet are extracted
7. Phase 7 (style pass) — last, cosmetic

Each phase can be reviewed independently. Phases 1–3 carry zero risk of visual regression.

---

## Files to create
```
src/data/services.js
src/lib/dateUtils.js
src/lib/scheduleHelpers.js
src/components/BottomSheet.jsx
src/components/RadioRow.jsx
src/components/DisabledInput.jsx
src/components/CalInput.jsx
src/components/TimeInput.jsx
src/screens/relationship/index.js
src/screens/relationship/RelationshipScreen.jsx
src/screens/relationship/AgendaView.jsx
src/screens/relationship/UnitEditor.jsx
src/screens/relationship/AddSheet.jsx
src/screens/relationship/OccActionSheet.jsx
src/screens/relationship/ManageSheet.jsx
src/screens/relationship/DeleteConfirmDialog.jsx
```

## Files to modify
```
src/tokens/tokens.js             — add spacing scale, add missing semantic colors
src/data/owners.js               — move PETS_SEED here, deduplicate date helpers
src/assets/icons.jsx             — absorb inline SVGs from screens
src/components/index.js          — add new exports
src/screens/index.js             — point to relationship/index.js
```

## Files to delete
```
src/data/bookings.js
```

## Verification
- Dev server runs without errors: `npm run dev`
- RelationshipScreen renders agenda, Add sheet, OccActionSheet, ManageSheet, DeleteConfirmDialog
- Adding a service, editing a rule, canceling a rule with refund all work end-to-end
- Past rule splitting (started-in-past flow) works as before
- No visual regressions on HomeScreen, ConversationScreen, ScheduleScreen
  