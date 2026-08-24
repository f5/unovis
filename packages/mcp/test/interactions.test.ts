/* The crosshair readout is built from the spec, so it can be tested without a
 * DOM: capture the configs buildInteractions hands to Tooltip/Crosshair and
 * run the templates directly. */
import { describe, expect, it } from 'vitest'

import { buildInteractions } from '../src/widget/interactions.js'
import type { ChartSpec } from '../src/render/spec.js'

class Capture { config: Record<string, unknown>; constructor (config: Record<string, unknown>) { this.config = config } }
// eslint-disable-next-line @typescript-eslint/naming-convention
const stubLib = { Tooltip: Capture, Crosshair: Capture } as never

const timeLineSpec: ChartSpec = {
  container: 'xy',
  width: 400,
  height: 200,
  theme: 'light',
  components: [{ type: 'Line', config: { x: { $field: 'date', as: 'date' }, y: [{ $field: 'sales', as: 'number' }, { $field: 'cost', as: 'number' }] } }],
  xAxis: { tickFormat: { $dateTickFormat: true } },
  legend: [{ name: 'Sales' }, { name: 'Cost' }],
  data: [],
}

describe('crosshair readout', () => {
  it('formats the header with the x axis tick formatter, not the raw value', () => {
    const { containerConfig } = buildInteractions(stubLib, timeLineSpec)
    const template = (containerConfig.crosshair as Capture).config.template as (d: unknown) => string

    const html = template({ date: Date.UTC(2026, 7, 19), sales: 2043.5, cost: 1901 })
    expect(html).toContain('Aug')
    expect(html).not.toContain('1786752000000') // the epoch ms it used to print
    expect(html).toContain('Sales')
    expect(html).toContain('2,043.5')
  })

  it('honors the spec locale in header and rows', () => {
    const { containerConfig } = buildInteractions(stubLib, { ...timeLineSpec, locale: 'de-DE' })
    const template = (containerConfig.crosshair as Capture).config.template as (d: unknown) => string

    const html = template({ date: Date.UTC(2026, 4, 15), sales: 2043.5, cost: 1901 })
    expect(html).toContain('Mai')
    expect(html).toContain('2.043,5')
  })

  it('falls back to the raw value when the axis has no formatter', () => {
    const spec = { ...timeLineSpec, xAxis: {} }
    const { containerConfig } = buildInteractions(stubLib, spec)
    const template = (containerConfig.crosshair as Capture).config.template as (d: unknown) => string
    expect(template({ date: 'Q3', sales: 1, cost: 2 })).toContain('Q3')
  })
})
