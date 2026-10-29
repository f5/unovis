// Reference definition with TanStack's defaults: a straight line per series from tidy rows, a grouped x focus so one
// tooltip lists every series at the hovered x, and the automatic color legend; no crosshair line and no animation
import { colorLegend, defineChart, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { tooltip } from '@tanstack/charts/tooltip'
import { DATA, SERIES } from '../shared/data.js'

// TanStack Charts wants one row per series and point (tidy data), the other libraries take the wide table as is
const rows = DATA.flatMap((d) => SERIES.map((s) => ({ x: d.x, series: s.label, value: d[s.key] })))

export const definition = defineChart({
  marks: [lineY(rows, { x: 'x', y: 'value', z: 'series' })],
  scales: {
    x: { scale: scaleLinear },
    y: { scale: scaleLinear, nice: true, grid: true },
  },
  color: {
    scale: scaleOrdinal().domain(SERIES.map((s) => s.label)).range(SERIES.map((s) => s.color)),
    legend: colorLegend(),
  },
  focus: 'group-x',
  tooltip,
})
