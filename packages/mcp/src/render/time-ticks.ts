/** Calendar-aligned tick values for time axes — env-free, shared by the
 * recipes (which bake ticks into specs) and the materializer (which derives
 * them when a hand-written spec omits them). */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Calendar-aligned tick values for date axes. Linear-scale ticks land at
 * arbitrary times of day, which the date formatter would render as
 * time-of-day labels ("08:53 AM" on a 3-month chart) — align ticks to
 * month/day/hour/minute boundaries instead. */
export function dateTickValues (min: number, max: number, target = 7): number[] | undefined {
  const span = max - min
  if (!Number.isFinite(span) || span <= 0) return undefined

  const ticks: number[] = []
  if (span >= 60 * DAY) { // month starts
    const stepMonths = Math.max(1, Math.ceil(span / (30 * DAY) / target))
    const start = new Date(min)
    let date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
    if (date.getTime() < min) date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
    while (date.getTime() <= max && ticks.length < 24) {
      ticks.push(date.getTime())
      date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + stepMonths, 1))
    }
  } else {
    // day / hour / minute boundaries (uniform in UTC epoch time)
    const unit = span >= 2 * DAY ? DAY : span >= 2 * HOUR ? HOUR : MINUTE
    const niceSteps = unit === DAY ? [1, 2, 7, 14] : unit === HOUR ? [1, 2, 3, 6, 12] : [1, 2, 5, 10, 15, 30]
    const rawStep = span / unit / target
    const step = (niceSteps.find(s => s >= rawStep) ?? Math.ceil(rawStep)) * unit
    for (let t = Math.ceil(min / step) * step; t <= max && ticks.length < 24; t += step) ticks.push(t)
  }
  return ticks.length >= 2 ? ticks : undefined
}

/** Tick values for a time axis derived from the data extent of a date field */
export function timeTickValuesFromData (data: Record<string, unknown>[], fieldName: string): number[] | undefined {
  let min = Infinity
  let max = -Infinity
  for (const record of data) {
    const raw = record[fieldName]
    if (raw === null || raw === undefined || raw === '') continue
    const time = typeof raw === 'number' ? raw : new Date(String(raw)).getTime()
    if (Number.isNaN(time)) continue
    if (time < min) min = time
    if (time > max) max = time
  }
  return dateTickValues(min, max)
}
