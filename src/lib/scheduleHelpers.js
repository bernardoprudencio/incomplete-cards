// ─── Schedule / billing helpers ──────────────────────────────────────────────
// Pure functions with no React dependencies.
// Depends on: data/services.js, lib/dateUtils.js

import { SERVICES, DURATION_SHORT, DURATION_DAYCARE } from '../data/services'
import { parseDate, dateKey, addDays, addWeeks, addMonths, nightCount } from './dateUtils'
import { PROTO_TODAY } from '../data/owners'

// ── Week helpers ──────────────────────────────────────────────────────────────
export function getWeekMonday(d) {
  const r = new Date(d); r.setHours(0,0,0,0)
  const day = r.getDay()
  const diff = day === 0 ? -6 : 1 - day
  r.setDate(r.getDate() + diff)
  return r
}
export function getWeekSunday(d) { return addDays(getWeekMonday(d), 6) }

// ── Billing ───────────────────────────────────────────────────────────────────
export function getPaidThruSunday(units) {
  const starts = units.map(u => u.startDate ? parseDate(u.startDate) : null).filter(Boolean)
  if (!starts.length) return null
  return getWeekSunday(starts.reduce((a, b) => a < b ? a : b))
}
export function isPaidOcc(occStart, paidThruSunday) {
  return paidThruSunday && occStart <= paidThruSunday
}

/**
 * Returns paid/unpaid/charge breakdown for a unit.
 * Used by all confirmation UIs (OccActionSheet, ManageSheet, DeleteConfirmDialog, AddSheet).
 */
export function getRuleImpact(unit, allUnits) {
  const paidThru = getPaidThruSunday(allUnits)
  const todayMid = new Date(PROTO_TODAY); todayMid.setHours(0,0,0,0)
  const occs = expandUnit(unit).filter(o => !o.skipped)
  const paidOccs       = occs.filter(o => isPaidOcc(o.start, paidThru) && o.start >= todayMid)
  const unpaidUpcoming = occs.filter(o => !isPaidOcc(o.start, paidThru) && o.start >= todayMid)
  const refundTotal    = paidOccs.reduce((sum, o) => sum + (o.unit.cost || 0), 0)
  const chargeTotal    = unpaidUpcoming.length > 0 ? (unpaidUpcoming[0].unit.cost || 0) : 0
  return { paidOccs, unpaidUpcoming, refundTotal, chargeTotal }
}

// ── ID factory ────────────────────────────────────────────────────────────────
let _nextId = 100
export function newId() { return ++_nextId }

// ── Unit factory ──────────────────────────────────────────────────────────────
export function defaultUnit(serviceId, overrides = {}) {
  const svc = SERVICES.find(s => s.id === serviceId)
  return {
    id: newId(),
    serviceId,
    startDate: '',
    endDate: '',
    repeatEndDate: '',
    startTime: '09:00',
    durationMins: (svc && svc.id) === 'doggy_daycare' ? 480 : 60,
    petIds: [],
    frequency: 'once',
    weekDays: [],
    everyNWeeks: 1,
    skippedKeys: [],
    overrides: {},
    cost: 20,
    ...overrides,
  }
}

// ── Overlap detection ─────────────────────────────────────────────────────────
export function overlaps(units, u) {
  const svc = SERVICES.find(s => s.id === u.serviceId)
  if (!svc || !u.startDate) return false
  const uOccs = expandUnit(u)
  return units
    .filter(x => {
      if (x.id === u.id) return false
      const xSvc = SERVICES.find(s => s.id === x.serviceId)
      return xSvc?.type === svc.type
    })
    .some(x => {
      if (!x.startDate) return false
      const xOccs = expandUnit(x)
      return uOccs.some(uo =>
        xOccs.some(xo => dateKey(uo.start) === dateKey(xo.start) && uo.unit.startTime === xo.unit.startTime)
      )
    })
}

export function overnightCanRepeat(u) {
  const svc = SERVICES.find(s => s.id === u.serviceId)
  if ((svc && svc.type) !== 'overnight') return true
  return nightCount(u) < 7
}

// ── Expand unit → occurrences ─────────────────────────────────────────────────
export function expandUnit(unit) {
  const svc = SERVICES.find(s => s.id === unit.serviceId)
  if (!svc || !unit.startDate) return []
  const base    = parseDate(unit.startDate)
  const today   = new Date(); today.setHours(0,0,0,0)
  let horizon   = addMonths(base, 6)
  const hB      = addWeeks(today, 8); if (hB > horizon) horizon = hB
  if (unit.repeatEndDate) { const cap = parseDate(unit.repeatEndDate); if (cap < horizon) horizon = cap }
  const MAX = 120

  const makeOcc = (start, dk) => {
    const overrideData = (unit.overrides && unit.overrides[dk]) || null
    return {
      unit:       overrideData ? { ...unit, ...overrideData, id: unit.id } : unit,
      svc:        overrideData && overrideData.serviceId ? SERVICES.find(s => s.id === overrideData.serviceId) || svc : svc,
      start:      new Date(start),
      end:        svc.type === 'overnight' && unit.endDate ? addDays(start, nightCount(unit)) : null,
      key:        `${unit.id}-${dk}`,
      skipped:    unit.skippedKeys && unit.skippedKeys.indexOf(dk) >= 0,
      isOverride: !!overrideData,
      parentUnit: unit,
    }
  }

  const occs = []
  if (unit.frequency === 'once') {
    occs.push(makeOcc(base, dateKey(base)))
  } else if (unit.frequency === 'weekly') {
    const overnight = svc.type === 'overnight'
    const step = Math.max(1, unit.everyNWeeks || 1)
    if (overnight) {
      let cur = new Date(base)
      while (cur <= horizon && occs.length < MAX) { occs.push(makeOcc(cur, dateKey(cur))); cur = addWeeks(cur, step) }
    } else {
      const days = (unit.weekDays && unit.weekDays.length) > 0 ? unit.weekDays : [base.getDay()]
      days.forEach(dow => {
        const diff = ((dow - base.getDay()) + 7) % 7
        let cur = addDays(base, diff)
        while (cur <= horizon && occs.length < MAX) { occs.push(makeOcc(cur, dateKey(cur))); cur = addWeeks(cur, step) }
      })
    }
    occs.sort((a, b) => a.start - b.start)
  } else if (unit.frequency === 'monthly') {
    let cur = new Date(base)
    while (cur <= horizon && occs.length < MAX) { occs.push(makeOcc(cur, dateKey(cur))); cur = addMonths(cur, 1) }
  }
  return occs
}

// ── Build agenda ──────────────────────────────────────────────────────────────
export function buildAgenda(units, relEndDate) {
  let all = units.flatMap(u => expandUnit(u)).filter(o => !o.skipped)
  if (relEndDate) { const cap = parseDate(relEndDate); all = all.filter(o => o.start <= cap) }
  all.sort((a, b) => a.start - b.start)
  const byDay = {}
  all.forEach(occ => {
    if (occ.svc.type === 'overnight' && occ.end) {
      const nights = nightCount(occ.unit)
      for (let i = 0; i < nights; i++) {
        const day = addDays(occ.start, i)
        const k = dateKey(day)
        if (!byDay[k]) byDay[k] = []
        byDay[k].push({ ...occ, nightIndex: i + 1, totalNights: nights })
      }
    } else {
      const k = dateKey(occ.start)
      if (!byDay[k]) byDay[k] = []
      byDay[k].push(occ)
    }
  })
  return Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
}

// ── Recurrence labels ─────────────────────────────────────────────────────────
const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const FULL_DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export function shortRuleLabel(unit) {
  if (unit.frequency === 'once') return "Doesn't repeat"
  const days    = (unit.weekDays || []).slice().sort((a, b) => a - b).map(d => SHORT_DAYS[d])
  const dayStr  = days.length === 0 ? '' : days.length === 1 ? days[0] : days.slice(0,-1).join(', ') + ' and ' + days[days.length-1]
  if (unit.frequency === 'weekly') return unit.everyNWeeks > 1 ? `Every ${unit.everyNWeeks} weeks${dayStr ? ' on ' + dayStr : ''}` : dayStr
  if (unit.frequency === 'monthly') return `Monthly${dayStr ? ' on ' + dayStr : ''}`
  return ''
}

export function ruleLabel(unit) {
  if (unit.frequency === 'once') return "Doesn't repeat"
  const dayStr = (unit.weekDays || []).length > 0
    ? ' on ' + unit.weekDays.slice().sort((a, b) => a - b).map(d => FULL_DAYS[d]).join(' and ')
    : ''
  if (unit.frequency === 'weekly') return unit.everyNWeeks > 1 ? `Every ${unit.everyNWeeks} weeks${dayStr}` : `Weekly${dayStr}`
  if (unit.frequency === 'monthly') return `Monthly${dayStr}`
  return ''
}

export function durLabel(svc, mins) {
  const opts = (svc && svc.id === 'doggy_daycare') ? DURATION_DAYCARE : DURATION_SHORT
  const f = opts.find(d => d.mins === mins)
  return f ? f.label : mins + 'min'
}

export function shortSvcName(svc) {
  if (!svc) return 'service'
  const MAP = { dog_walking: 'walk', doggy_daycare: 'daycare', drop_in: 'drop-in', boarding: 'stay', house_sitting: 'stay' }
  return MAP[svc.id] || svc.label.toLowerCase()
}
