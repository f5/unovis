/** Shared schema fragments and helpers for chart recipes.
 *
 * Conventions:
 *  - data is always an array of flat records
 *  - accessors are field names (never code)
 *  - every option has a description and a sane default
 *  - enums over free-form strings, bounded numbers
 */
import { z } from 'zod'

import { ChartInputError } from '../render/materialize.js'
import type { AccessorRef, AxisSpec, ChartSpec, LegendItemSpec } from '../render/spec.js'

export { ChartInputError }

// ── schema fragments ────────────────────────────────────────────────────────

export const dataValue = z.union([z.string(), z.number(), z.boolean(), z.null()])

export const dataRecords = z.array(z.record(z.string(), dataValue)).min(1)
  .describe('Chart data: an array of flat records, e.g. [{"month": "Jan", "sales": 120, "cost": 80}, ...]')

export const fieldName = z.string().min(1)

export const commonInput = {
  width: z.number().int().min(100).max(4000).default(800).describe('Chart width in pixels'),
  height: z.number().int().min(100).max(4000).default(480).describe('Chart height in pixels'),
  theme: z.enum(['light', 'dark']).default('light').describe('Color theme of the chart'),
  title: z.string().optional().describe('Chart title rendered above the chart'),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'hex color, e.g. #4D8CFD')).max(12).optional()
    .describe('Custom color palette (hex). Replaces the default palette in order'),
  outputType: z.enum(['svg', 'config']).default('svg')
    .describe('svg: return the rendered SVG markup; config: return the resolved Unovis chart spec as JSON (no rendering)'),
  outputPath: z.string().optional()
    .describe('Absolute file path ending in .svg — saves the SVG to disk and returns the path instead of inline markup'),
}

export const xyInput = {
  xAxisLabel: z.string().optional().describe('Label for the X axis'),
  yAxisLabel: z.string().optional().describe('Label for the Y axis'),
  showGridLines: z.boolean().default(true).describe('Show horizontal/vertical grid lines'),
  legend: z.boolean().default(true).describe('Show a legend (multi-series charts only)'),
}

// ── helpers ─────────────────────────────────────────────────────────────────

export type DataRecord = Record<string, string | number | boolean | null>

export const field = (name: string, as?: 'number' | 'string' | 'date'): AccessorRef => ({ $field: name, as })

export const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

/** Throw an actionable error when referenced fields are missing from the data */
export function assertFieldsExist (data: DataRecord[], fields: (string | undefined)[]): void {
  const first = data[0]
  if (!first || typeof first !== 'object') throw new ChartInputError('data must be an array of objects')
  const available = Object.keys(first)
  const missing = fields.filter((f): f is string => !!f && !(f in first))
  if (missing.length) {
    throw new ChartInputError(
      `Field${missing.length > 1 ? 's' : ''} ${missing.map(f => `"${f}"`).join(', ')} not found in data. ` +
      `Available fields: ${available.map(f => `"${f}"`).join(', ')}`)
  }
}

/** True when every value of a field (in the first few records) is numeric */
export function isNumericField (data: DataRecord[], fieldName: string): boolean {
  const sample = data.slice(0, 20)
  return sample.every(d => d[fieldName] === null || d[fieldName] === undefined || typeof d[fieldName] === 'number' ||
    (typeof d[fieldName] === 'string' && d[fieldName] !== '' && !Number.isNaN(Number(d[fieldName]))))
}

/** Distinct values of a field, in first-seen order */
export function distinctValues (data: DataRecord[], fieldName: string): (string | number)[] {
  const seen = new Set<string | number>()
  for (const record of data) {
    const value = record[fieldName]
    if (value === null || value === undefined) continue
    seen.add(value as string | number)
  }
  return Array.from(seen)
}

export interface CategoricalX {
  /** x accessor: the field itself (numeric) or a category index */
  x: AccessorRef;
  /** Category names when x is ordinal (drives tickFormat/numTicks) */
  categories?: string[];
}

/** Numeric fields map directly; string categories map to their index with
 * labeled ticks (Unovis XY scales are numeric). */
export function categoricalX (data: DataRecord[], fieldName: string, isTime?: boolean): CategoricalX {
  if (isTime) return { x: field(fieldName, 'date') }
  if (isNumericField(data, fieldName)) return { x: field(fieldName, 'number') }
  const categories = distinctValues(data, fieldName).map(String)
  return { x: { $index: true }, categories }
}

/** Axis spec for a categorical dimension: one labeled tick per category.
 * Explicit integer tickValues — approximate d3 tick counts can emit
 * fractional ticks that would round into duplicate category labels. */
export function categoryAxis (base: AxisSpec, categories: string[]): AxisSpec {
  const maxTicks = 30
  const step = Math.ceil(categories.length / maxTicks)
  const tickValues = categories.map((_, i) => i).filter(i => i % step === 0)
  return {
    ...base,
    tickFormat: { $lookup: categories },
    tickValues,
  }
}

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
export function timeTickValuesFromData (data: DataRecord[], fieldName: string): number[] | undefined {
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

export function seriesLegend (labels: string[], enabled: boolean, colors?: string[]): LegendItemSpec[] | undefined {
  if (!enabled || labels.length < 2) return undefined
  return labels.map((name, i) => ({ name, paletteIndex: i, color: colors?.[i % (colors.length || 1)] }))
}

/** Common ChartSpec fields from common tool inputs */
export function baseSpec (input: {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  title?: string;
  colors?: string[];
}): Pick<ChartSpec, 'width' | 'height' | 'theme' | 'title' | 'colors'> {
  return {
    width: input.width,
    height: input.height,
    theme: input.theme,
    title: input.title,
    colors: input.colors,
  }
}

export function xyAxes (input: { xAxisLabel?: string; yAxisLabel?: string; showGridLines: boolean }): { xAxis: AxisSpec; yAxis: AxisSpec } {
  return {
    xAxis: { label: input.xAxisLabel, gridLine: input.showGridLines },
    yAxis: { label: input.yAxisLabel, gridLine: input.showGridLines },
  }
}
