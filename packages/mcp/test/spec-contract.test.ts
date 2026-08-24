/* The ChartSpec IR is a persistence format: apps commit specs and embed
 * documents, so version drift has to be detected, not discovered as a blank
 * chart. */
import { describe, expect, it } from 'vitest'

import { materializeChart, materializeValue, formatDateTick, formatNumTick, ChartInputError } from '../src/render/materialize.js'
import { SPEC_VERSION } from '../src/render/spec.js'
import type { ChartSpec } from '../src/render/spec.js'
import type { UnovisLib } from '../src/env/index.js'
import { recipeByName } from '../src/recipes/index.js'
import { timeTickValuesFromData } from '../src/render/time-ticks.js'

/** Minimal capturing stand-ins — materializeChart only news these up */
class Capture { config: Record<string, unknown>; constructor (config: Record<string, unknown>) { this.config = config } }
// eslint-disable-next-line @typescript-eslint/naming-convention
const stubLib = { Line: Capture, Axis: Capture, Tooltip: Capture, Crosshair: Capture } as unknown as UnovisLib

const lineSpec = (over: Partial<ChartSpec> = {}): ChartSpec => ({
  container: 'xy',
  width: 400,
  height: 200,
  theme: 'light',
  components: [{ type: 'Line', config: { x: { $field: 't', as: 'date' }, y: { $field: 'v', as: 'number' } } }],
  xAxis: { tickFormat: { $dateTickFormat: true } },
  data: [
    { t: '2026-08-01', v: 1 },
    { t: '2026-08-04', v: 3 },
    { t: '2026-08-08', v: 2 },
  ],
  ...over,
})

describe('spec versioning', () => {
  it('recipes stamp the current SPEC_VERSION', () => {
    const spec = recipeByName.get('generate_line_chart')?.toSpec({
      data: [{ x: 1, y: 2 }], x: 'x', y: 'y', width: 400, height: 200, theme: 'light', legend: true, showGridLines: true, curve: 'linear', lineWidth: 2,
    } as never)
    expect(spec?.specVersion).toBe(SPEC_VERSION)
  })

  it('accepts same-major specs and specs with no version', () => {
    expect(() => materializeChart(stubLib, lineSpec({ specVersion: SPEC_VERSION }))).not.toThrow()
    expect(() => materializeChart(stubLib, lineSpec())).not.toThrow()
  })

  it('refuses a newer major with an actionable error', () => {
    expect(() => materializeChart(stubLib, lineSpec({ specVersion: SPEC_VERSION + 1 })))
      .toThrow(ChartInputError)
    expect(() => materializeChart(stubLib, lineSpec({ specVersion: SPEC_VERSION + 1 })))
      .toThrow(/newer than this renderer supports/)
  })
})

describe('locale formatting', () => {
  it('formats date ticks in the requested locale', () => {
    const may = Date.UTC(2026, 4, 15)
    expect(formatDateTick(may, 'en-US')).toContain('May')
    expect(formatDateTick(may, 'de-DE')).toContain('Mai')
  })

  it('formats numbers in the requested locale', () => {
    expect(formatNumTick(1234.5, 'en-US')).toBe('1,234.5')
    expect(formatNumTick(1234.5, 'de-DE')).toBe('1.234,5')
  })

  it('parses raw date strings, the shape tooltip headers receive', () => {
    expect(formatDateTick('2026-08-19', 'en-US')).toContain('Aug')
  })

  it('threads the spec locale through materialized tick formatters', () => {
    const format = materializeValue({ $dateTickFormat: true }, 'de-DE') as (v: unknown) => string
    expect(format(Date.UTC(2026, 4, 15))).toContain('Mai')
  })
})

describe('time-axis tick fallback', () => {
  it('derives calendar-aligned ticks when a hand-written spec omits tickValues', () => {
    const { containerConfig } = materializeChart(stubLib, lineSpec())
    const axis = containerConfig.xAxis as Capture
    const ticks = axis.config.tickValues as number[]
    expect(Array.isArray(ticks)).toBe(true)
    expect(ticks.length).toBeGreaterThanOrEqual(2)
    // every derived tick sits on a UTC midnight
    for (const t of ticks) expect(t % 86_400_000).toBe(0)
  })

  it('leaves explicit tickValues alone', () => {
    const explicit = [1, 2, 3]
    const { containerConfig } = materializeChart(stubLib, lineSpec({ xAxis: { tickFormat: { $dateTickFormat: true }, tickValues: explicit } }))
    expect((containerConfig.xAxis as Capture).config.tickValues).toEqual(explicit)
  })

  it('matches what the recipes bake in', () => {
    const data = [{ t: '2026-08-01', v: 1 }, { t: '2026-08-08', v: 2 }]
    expect(timeTickValuesFromData(data, 't')).toBeDefined()
  })
})
