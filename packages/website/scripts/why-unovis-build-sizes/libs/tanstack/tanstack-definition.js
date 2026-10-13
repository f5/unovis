// The chart definition shared by the TanStack entries. TanStack's own defaults are straight lines, no crosshair and no
// animation, so the measured chart opts in: a monotone curve (d3-shape through `d3Curve`), a crosshair line with a
// marker per series (`focusGuideX`), and either the `motion()` renderer (main entries) or, for the update-only
// reference build, the built-in `svgAnimation` tween
import { colorLegend, defineChart, lineY } from '@tanstack/charts'
import { d3Curve } from '@tanstack/charts/d3/shape'
import { focusGuideX } from '@tanstack/charts/focus/guide'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { tooltip } from '@tanstack/charts/tooltip'
import { curveMonotoneX } from 'd3-shape'
import { DATA, SERIES } from '../shared/data.js'

const rows = DATA.flatMap((d) => SERIES.map((s) => ({ x: d.x, series: s.label, value: d[s.key] })))
const seriesColor = (d) => SERIES.find((s) => s.label === d.series).color

export const makeMatchedDefinition = ({ svgAnimation }) => defineChart({
  ...(svgAnimation ? { svgAnimation: { duration: 600 } } : {}),
  marks: [
    lineY(rows, { x: 'x', y: 'value', z: 'series', curve: d3Curve(curveMonotoneX) }),
    focusGuideX(rows, { x: 'x', y: 'value', z: 'series', match: 'group', marker: { radius: 4, fill: seriesColor, strokeWidth: 0 } }),
  ],
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
