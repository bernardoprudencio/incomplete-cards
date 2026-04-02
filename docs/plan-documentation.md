# Plan: Memory + Documentation Strategy for Sitter Prototype

## Context

As the sitter-prototype grows in complexity, there's a risk that memory files accumulate too much business logic (data structures, code patterns, file paths). MEMORY.md is loaded into every conversation context, so bloating it would waste context budget on derivable information. Meanwhile, Claude Code already loads CLAUDE.md automatically when working inside the repo directory — making it the right place for codebase documentation.

The principle from the memory system: don't save what can be derived from reading the code. Save only decisions, context, preferences, and pointers that can't be inferred from the current codebase.

---

## Recommended Approach: Two-Layer Strategy

### Layer 1 — CLAUDE.md (in-repo, loaded on demand)
Expand `sitter-prototype/CLAUDE.md` to include a detailed **Business Logic** section. This is the right place for:
- Data structures (Unit model, Occurrence model)
- Key function signatures and what they return (`expandUnit`, `buildAgenda`, `getRuleImpact`)
- State shape in App.jsx and data flow between screens
- Integration points (how HomeScreen → ActionSheet → ConversationScreen → RelationshipScreen flows)
- Current component inventory with one-liner descriptions

**Why CLAUDE.md and not memory:** Claude Code loads CLAUDE.md automatically when working in the directory. It's project documentation, not cross-session memory. It stays close to the code, gets updated alongside code changes, and doesn't bloat MEMORY.md.

### Layer 2 — Memory (cross-session, non-derivable only)
Keep memory files focused exclusively on things that **can't be derived from reading code**:
- Design decisions made (the "known issue accepted" examples)
- Current work focus (what feature is in progress)
- Figma source URLs and their corresponding screen mappings
- UX initiative context and motivation (why this prototype exists)
- Working style feedback (already well-maintained)

---

## Changes

### 0. Create `sitter-prototype/docs/schedule-logic.md` (new shareable doc)
A human-readable reference for anyone onboarding to the schedule system — designer, developer, or PM. Covers:

**What a Unit is** — the data model (all fields, what each means, examples)
**How occurrences are generated** — `expandUnit` in plain language: how start/end dates, weekDays, frequency, everyNWeeks, skips, and overrides combine to produce a list of dates
**Skip vs. Override** — what each does, when to use which
**Billing model** — how cost is fixed per occurrence, what "paid through" means, refund vs. keep-paid options
**Editing modes** — "this occurrence only" vs. "from here forward" vs. "all occurrences"
**Key functions** — `expandUnit`, `buildAgenda`, `getRuleImpact`, `getPaidThruSunday` with plain-English descriptions and input/output examples
**Constraints and known edge cases** — overnight spanning month boundaries, week-spanning-month display quirk (accepted), open-ended vs. fixed-end recurrences

This file lives in the repo (not in memory), is version-controlled alongside the code, and can be linked/shared freely.

### 1. Expand `sitter-prototype/CLAUDE.md`
Add sections:
- **Screen Inventory** — one-liner per file in src/
- **State & Navigation** — App.jsx state shape, navigateTo flow, screen transitions
- **Key Business Logic** — Unit model, expandUnit, buildAgenda, getRuleImpact, data flow
- **Data Sources** — owners.js, services.js, getIncompleteCards, getTodayWalks
- **Date Anchor** — PROTO_TODAY is `new Date()` at render time; all schedule math is relative to it

### 2. Trim `project_sitter_prototype.md` (memory)
Remove:
- Design token details (already in CLAUDE.md)
- Schedule tab state details that are now derivable from CLAUDE.md
Keep:
- Current focus (what's being worked on)
- Figma source URL
- UX initiative context
- Known issues and accepted decisions

### 3. No changes to `feedback_working_style.md` or `user_profile.md`
These are lean and appropriate as-is.

---

## Critical Files

- `sitter-prototype/docs/schedule-logic.md` — new shareable doc (create)
- `sitter-prototype/CLAUDE.md` — expand with business logic sections
- `/Users/bernardoprudencio/.claude/projects/-Users-bernardoprudencio-Documents-rover-repo/memory/project_sitter_prototype.md` — trim to decisions only
- `/Users/bernardoprudencio/.claude/projects/-Users-bernardoprudencio-Documents-rover-repo/memory/MEMORY.md` — no structural changes needed (stays at 3 pointers)

Source files to read for the shareable doc:
- `sitter-prototype/src/lib/scheduleHelpers.js`
- `sitter-prototype/src/data/services.js`
- `sitter-prototype/src/data/owners.js`

---

## Verification

After changes:
1. MEMORY.md still fits in a single glance (< 10 lines, 3 entries)
2. `project_sitter_prototype.md` covers only decisions + current focus — no code structure
3. CLAUDE.md gives a new Claude session everything it needs to work in the repo without exploring first
4. A new conversation should be able to answer "how does HomeScreen connect to RelationshipScreen?" from CLAUDE.md alone
