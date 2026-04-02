# Schedule Logic — Sitter Prototype

A plain-language reference for the recurring schedule system used in the Sitter Prototype. Useful for designers, engineers, and PMs onboarding to the UX2-7159 flow.

---

## Overview

The schedule is built around two core concepts:

- **Unit** — a recurring (or one-time) service agreement. Think of it as the rule: "walk Louie every Mon/Wed/Fri at 9am starting March 3."
- **Occurrence** — a single instance generated from a unit. Think of it as the event: "walk on Monday, March 10."

Units are stored as data. Occurrences are derived on the fly by calling `expandUnit()`.

---

## The Unit Model

A unit is a plain JavaScript object with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier (auto-incremented from 100) |
| `serviceId` | string | One of: `dog_walking`, `boarding`, `house_sitting`, `doggy_daycare`, `drop_in` |
| `startDate` | `'YYYY-MM-DD'` | First day the service begins |
| `endDate` | `'YYYY-MM-DD'` | For overnight services: the checkout date |
| `repeatEndDate` | `'YYYY-MM-DD'` | Last date the recurrence runs (empty = runs indefinitely) |
| `startTime` | `'HH:MM'` | 24-hour start time |
| `durationMins` | number | Duration in minutes |
| `petIds` | number[] | IDs of pets in this booking |
| `frequency` | `'once'` \| `'weekly'` \| `'monthly'` | How often it recurs |
| `weekDays` | number[] | Days of week (0=Sun, 1=Mon … 6=Sat); used when `frequency='weekly'` |
| `everyNWeeks` | number | Repeat interval; `1` = every week, `2` = every other week |
| `skippedKeys` | string[] | Dates to skip, in `'YYYY-MM-DD'` format (e.g. holidays) |
| `overrides` | object | Per-date overrides; key is `'YYYY-MM-DD'`, value is partial unit fields |
| `cost` | number | Price per occurrence in USD |

**Example unit** (Mon/Wed/Fri walks, open-ended):
```js
{
  id: 1,
  serviceId: 'dog_walking',
  startDate: '2025-03-03',
  endDate: '',
  repeatEndDate: '',
  startTime: '09:00',
  durationMins: 60,
  petIds: [1, 2],
  frequency: 'weekly',
  weekDays: [1, 3, 5],   // Mon, Wed, Fri
  everyNWeeks: 1,
  skippedKeys: ['2025-03-19'],
  overrides: {},
  cost: 20,
}
```

---

## The Occurrence Model

`expandUnit(unit)` returns an array of occurrence objects:

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Unique ID: `'<unitId>-<YYYY-MM-DD>'` |
| `start` | Date | Start datetime of the occurrence |
| `end` | Date \| null | End datetime (overnight services only) |
| `unit` | Unit | The unit that generated this occurrence (may include override fields merged in) |
| `svc` | Service | The service object (`{ id, label, type, ... }`) |
| `skipped` | boolean | True if this date is in `skippedKeys` |
| `isOverride` | boolean | True if this occurrence has per-date overrides applied |
| `parentUnit` | Unit | Always the original unit (even if overridden) |
| `nightIndex` | number | For overnight services split across days: which night (1-based) |
| `totalNights` | number | Total nights in the overnight booking |

---

## How Occurrences Are Generated (`expandUnit`)

`expandUnit` walks forward from `startDate` and generates one occurrence per matching date, up to a horizon. It stops at whichever comes first:

1. `repeatEndDate` (if set)
2. 6 months from `startDate`
3. 8 weeks from today
4. 120 occurrences (hard cap)

**By frequency:**

- **`once`** — generates exactly one occurrence on `startDate`.
- **`weekly`** — iterates forward in steps of `everyNWeeks` weeks. For daytime services, it generates one occurrence per selected `weekDay` per cycle. For overnight services, it generates one occurrence per cycle starting on `startDate` (weekDays not used).
- **`monthly`** — generates one occurrence per month on the same calendar date.

**Skips and overrides are applied per-date:**
- If a date's `dateKey` is in `skippedKeys`, the occurrence is created but `skipped: true`.
- If a date's `dateKey` is in `overrides`, the override fields are merged into the unit before creating the occurrence.

`buildAgenda` filters out skipped occurrences before rendering. Overnight occurrences are "exploded" — a 3-night stay creates 3 agenda entries (one per night).

---

## Skip vs. Override

| | Skip | Override |
|--|------|----------|
| **What it does** | Removes one occurrence | Changes one occurrence's details |
| **Visible in agenda?** | No | Yes (with modified details) |
| **Examples** | Sitter is unavailable March 19 | Different time on March 19 only |
| **Stored as** | Date string in `skippedKeys` | Partial unit object in `overrides[date]` |

---

## Editing Modes

When editing an occurrence, the sitter can choose scope:

| Mode | What changes | How it's stored |
|------|-------------|-----------------|
| **This occurrence only** | One date changes | Add an entry to `overrides[date]` |
| **This and all future** | All occurrences from this date forward | Create a new unit starting at this date; terminate original unit at day before |
| **All occurrences** | The entire unit changes | Update the unit object directly |

The "from here forward" split is the most complex: it clones the unit with a new `startDate` and sets `repeatEndDate` on the original to one day before.

---

## The Billing Model

### Paid-through concept

The system treats all units in a relationship as a single billing agreement. The **paid-through date** is the Sunday of the week containing the earliest `startDate` across all units.

```
getPaidThruSunday(units) → Date
```

Any occurrence whose `start` is on or before the paid-through Sunday is considered **paid**. Occurrences after it are **unpaid/upcoming**.

### Cancellation consequences (`getRuleImpact`)

When cancelling or modifying a unit, the UI shows what money is affected:

```
getRuleImpact(unit, allUnits) → {
  paidOccs,        // upcoming paid occurrences being cancelled → triggers refund
  unpaidUpcoming,  // upcoming unpaid occurrences being cancelled → no refund
  refundTotal,     // sum of cost for paidOccs
  chargeTotal,     // cost of the first unpaid occurrence (if any)
}
```

Only **future** occurrences are counted (past ones are already done and not affected).

### Keep-paid option

When cancelling paid occurrences, the sitter can choose "keep paid":
- Paid future occurrences are converted to one-time units (they stay on the schedule).
- Only unpaid occurrences are removed.
- No refund is issued.

---

## Services

| ID | Label | Type | Duration options |
|----|-------|------|-----------------|
| `dog_walking` | Dog Walking | daytime | 30, 45, 60, 120 min |
| `drop_in` | Drop-In Visit | daytime | 30, 45, 60, 120 min |
| `doggy_daycare` | Doggy Day Care | daytime | 4 hr, 8 hr, 12 hr |
| `boarding` | Boarding | overnight | (uses startDate/endDate) |
| `house_sitting` | House Sitting | overnight | (uses startDate/endDate) |

`type: 'overnight'` services use `startDate` + `endDate` instead of `durationMins`. Overnight services cannot use `weekDays` for recurrence — the whole stay just repeats on the same day-of-week. Overnight services with >6 nights cannot repeat (`overnightCanRepeat` guard).

---

## Key Functions Reference

### `expandUnit(unit)` → `Occurrence[]`
Generates all occurrences from a unit definition. The main engine. Pure function — no side effects.

### `buildAgenda(units, relEndDate?)` → `[['YYYY-MM-DD', Occurrence[]], ...]`
Flattens all units into a sorted day-keyed agenda. Filters skipped occurrences. Expands overnight stays across multiple days.

### `getRuleImpact(unit, allUnits)` → `{ paidOccs, unpaidUpcoming, refundTotal, chargeTotal }`
Calculates billing consequences of cancelling/modifying a unit. Used by all confirmation dialogs.

### `getPaidThruSunday(units)` → `Date`
Returns the Sunday of the week containing the earliest `startDate` in the relationship. This is the billing cutoff.

### `shortRuleLabel(unit)` → `string`
Returns a short human-readable recurrence label, e.g. `"Mon, Wed and Fri"` or `"Every 2 weeks on Mon"`. Used in occurrence cards.

### `overlaps(units, unit)` → `boolean`
Returns true if the given unit has any occurrences that conflict (same day + time + service type) with existing units.

### `defaultUnit(serviceId, overrides?)` → `Unit`
Creates a blank unit with sensible defaults for a given service. Use this when creating new units in AddSheet/UnitEditor.

---

## Known Edge Cases

**Week spanning a month boundary**
When a week (Mon–Sun) straddles two months (e.g. Mar 30–Apr 5), `AgendaView` shows "Week of Mar 30" under both the March and April month headers. This is a display quirk — the data is correct. It was accepted as-is rather than adding complex splitting logic.

**Overnight multi-day display**
`buildAgenda` explodes overnight stays into one entry per night. Each entry carries `nightIndex` (e.g. Night 2 of 5). The UI in `AgendaView` can use this to label the occurrence appropriately.

**PROTO_TODAY anchor**
All schedule math is relative to `PROTO_TODAY = new Date()`, which is evaluated once when the module loads. In the prototype, this means the schedule always looks "live" relative to the actual current date. There is no ability to mock or override the current date.

**Max 120 occurrences**
`expandUnit` has a hard cap of 120 occurrences per unit. For practical use cases this is never reached, but very long-running high-frequency recurrences will be silently truncated.
