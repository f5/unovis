// The Vega-Lite spec shared by the React and vanilla entries: the documented "multi-series line chart with
// tooltip" pattern (a pivot transform and a rule that carries one tooltip for every series at the hovered x)
import { DATA, SERIES } from '../shared/data.js'

// Vega-Lite wants one row per series and point (tidy data), the other libraries take the wide table as is
const rows = DATA.flatMap((d) => SERIES.map((s) => ({ x: d.x, series: s.label, value: d[s.key] })))

export const spec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  width: 800,
  height: 300,
  data: { values: rows },
  encoding: { x: { field: 'x', type: 'quantitative' } },
  layer: [
    {
      mark: 'line',
      encoding: {
        y: { field: 'value', type: 'quantitative' },
        color: { field: 'series', type: 'nominal', scale: { domain: SERIES.map((s) => s.label), range: SERIES.map((s) => s.color) } },
      },
    },
    {
      transform: [{ pivot: 'series', value: 'value', groupby: ['x'] }],
      mark: 'rule',
      params: [{ name: 'hover', select: { type: 'point', fields: ['x'], nearest: true, on: 'pointerover', clear: 'pointerout' } }],
      encoding: {
        opacity: { condition: { value: 0.3, param: 'hover', empty: false }, value: 0 },
        tooltip: [{ field: 'x', type: 'quantitative' }, ...SERIES.map((s) => ({ field: s.label, type: 'quantitative' }))],
      },
    },
  ],
}
