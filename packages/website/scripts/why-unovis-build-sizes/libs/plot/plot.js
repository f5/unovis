// Observable Plot (vanilla): Plot.plot() returns an SVG (or a figure with the legend) to append
import * as Plot from '@observablehq/plot'
import { DATA, SERIES, getContainer } from '../shared/data.js'

// Plot wants one row per series and point (tidy data), the other libraries take the wide table as is
const rows = DATA.flatMap((d) => SERIES.map((s) => ({ x: d.x, series: s.label, value: d[s.key] })))
const tooltip = (d) => [`x: ${d.x}`, ...SERIES.map((s) => `${s.label}: ${d[s.key]}`)].join('\n')

getContainer().append(Plot.plot({
  width: 800,
  height: 300,
  y: { grid: true },
  color: { domain: SERIES.map((s) => s.label), range: SERIES.map((s) => s.color), legend: true },
  marks: [
    Plot.lineY(rows, { x: 'x', y: 'value', stroke: 'series', curve: 'monotone-x' }),
    // The crosshair: a rule at the hovered x. Plot has no animation
    Plot.ruleX(DATA, Plot.pointerX({ x: 'x', stroke: '#888' })),
    // One tooltip listing every series at the hovered x, as the other charts do
    Plot.tip(DATA, Plot.pointerX({ x: 'x', y: (d) => d.a, title: tooltip })),
  ],
}))
