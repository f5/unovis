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
import { SPEC_VERSION } from '../render/spec.js'
import type { AccessorRef, AxisSpec, ChartSpec, ComponentSpec, LegendItemSpec } from '../render/spec.js'

export { ChartInputError }

// ── schema fragments ────────────────────────────────────────────────────────

export const dataValue = z.union([z.string(), z.number(), z.boolean(), z.null()])

export const dataRecords = z.array(z.record(z.string(), dataValue)).min(1)
  .describe('Chart data: an array of flat records, e.g. [{"month": "Jan", "sales": 120, "cost": 80}, ...]')

/* A factory, not a constant: zod-to-json-schema emits a $ref whenever the same
 * schema instance appears twice in one tool, and clients that flatten those refs
 * drop the type altogether — a `y` with no type at all turned multi-series calls
 * into a JSON string. A fresh instance per use site keeps each property
 * self-describing. */
export const fieldName = (): z.ZodString => z.string().min(1)

export const commonInput = {
  width: z.number().int().min(100).max(4000).default(800).describe('Chart width in pixels'),
  height: z.number().int().min(100).max(4000).default(480).describe('Chart height in pixels'),
  theme: z.enum(['light', 'dark']).default('light').describe('Color theme of the chart'),
  locale: z.string().regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, 'BCP-47 locale, e.g. de-DE').optional()
    .describe('BCP-47 locale for date and number formatting on axes and tooltips, e.g. "de-DE" or "ja". Defaults to en-US'),
  title: z.string().optional().describe('Chart title rendered above the chart'),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'hex color, e.g. #4D8CFD')).max(12).optional()
    .describe('Custom color palette (hex). Replaces the default palette in order'),
  framework: z.enum(['ts', 'react', 'svelte', 'vue', 'angular', 'solid']).default('ts')
    .describe('Target framework for outputType "code". ts emits the imperative @unovis/ts API'),
  outputType: z.enum(['svg', 'png', 'html', 'interactive', 'config', 'code']).default('svg')
    .describe('svg: SVG markup; png: a rendered PNG image; html: a self-contained interactive HTML file ' +
      '(tooltips, crosshair, hover — saved to disk, path returned); interactive: an interactive chart ' +
      'rendered inline by clients that support the MCP Apps extension; config: the resolved Unovis chart spec as JSON'),
  outputPath: z.string().optional()
    .describe('Absolute file path with an extension matching outputType (.svg, .png or .html) — saves the chart to disk and returns the path instead of inline content'),
  scale: z.number().min(1).max(4).default(2)
    .describe('Pixel density multiplier for PNG output (2 = retina). Ignored for svg/config'),
}

export const xyInput = {
  xAxisLabel: z.string().optional().describe('Label for the X axis'),
  yAxisLabel: z.string().optional().describe('Label for the Y axis'),
  showGridLines: z.boolean().default(true).describe('Show horizontal/vertical grid lines'),
  legend: z.boolean().default(true).describe('Show a legend (multi-series charts only)'),
}

const hexColor = (): z.ZodString => z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'hex color, e.g. #FF6B7E')

/** Reference-line / shaded-band decorations available on XY charts */
export const xyDecorations = {
  referenceLines: z.array(z.object({
    axis: z.enum(['x', 'y']).default('y').describe('y: horizontal line at a Y value; x: vertical line at an X value'),
    value: z.number().describe('Position in data units'),
    label: z.string().optional().describe('Small label next to the line'),
    color: hexColor().optional(),
    lineWidth: z.number().min(0.5).max(10).default(1.5),
    style: z.enum(['dashed', 'solid', 'dotted']).default('dashed'),
  })).max(8).optional().describe('Reference lines for thresholds/targets, e.g. an SLA or goal'),
  referenceBands: z.array(z.object({
    axis: z.enum(['x', 'y']).default('y'),
    from: z.number().describe('Band start, in data units'),
    to: z.number().describe('Band end, in data units'),
    label: z.string().optional(),
    color: hexColor().optional(),
  })).max(8).optional().describe('Shaded ranges drawn behind the data, e.g. an acceptable range'),
}

export interface DecorationInput {
  referenceLines?: { axis: 'x' | 'y'; value: number; label?: string; color?: string; lineWidth: number; style: 'dashed' | 'solid' | 'dotted' }[];
  referenceBands?: { axis: 'x' | 'y'; from: number; to: number; label?: string; color?: string }[];
}

/** Decoration components: bands render behind the data, lines on top */
export function decorationComponents (input: DecorationInput): { bands: ComponentSpec[]; lines: ComponentSpec[] } {
  const bands: ComponentSpec[] = (input.referenceBands ?? []).map(band => ({
    type: 'Plotband',
    config: {
      axis: band.axis,
      from: band.from,
      to: band.to,
      ...(band.color ? { color: band.color } : {}),
      ...(band.label ? { labelText: band.label } : {}),
    },
  }))
  const lines: ComponentSpec[] = (input.referenceLines ?? []).map(line => ({
    type: 'Plotline',
    config: {
      axis: line.axis,
      value: line.value,
      lineWidth: line.lineWidth,
      lineStyle: line.style,
      ...(line.color ? { color: line.color } : {}),
      ...(line.label ? { labelText: line.label } : {}),
    },
  }))
  return { bands, lines }
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

export { dateTickValues, timeTickValuesFromData } from '../render/time-ticks.js'

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
  locale?: string;
}): Pick<ChartSpec, 'specVersion' | 'width' | 'height' | 'theme' | 'title' | 'colors' | 'locale'> {
  return {
    specVersion: SPEC_VERSION,
    width: input.width,
    height: input.height,
    theme: input.theme,
    title: input.title,
    colors: input.colors,
    locale: input.locale,
  }
}

export function xyAxes (input: { xAxisLabel?: string; yAxisLabel?: string; showGridLines: boolean }): { xAxis: AxisSpec; yAxis: AxisSpec } {
  return {
    xAxis: { label: input.xAxisLabel, gridLine: input.showGridLines },
    yAxis: { label: input.yAxisLabel, gridLine: input.showGridLines },
  }
}
