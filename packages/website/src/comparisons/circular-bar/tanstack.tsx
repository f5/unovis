import React, { useMemo, useState } from 'react'
import { defineChart } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { polar, radialArc, radialBarRadius, PolarLayoutContext, PolarOptions } from '@tanstack/charts/polar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { arc } from 'd3-shape'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, metrics, formatValue, percentOfGoal } from './data'

type Bar = DataRecord & { startAngle: number; endAngle: number }

const labels = metrics.map(m => m.label)
// D3 cuts `padRadius * sin(padAngle / 2)` off both sides of a padded arc at every radius: 12 px with these two
const PAD_ANGLE = 0.2
const PAD_RADIUS = 12 / Math.sin(PAD_ANGLE / 2)

export default function TanStackCircularBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    const half = preset === 'half'
    const gaps = preset === 'gaps'
    const cornerRadius = preset === 'square' ? 0 : 10
    // There's no center option: the circle sits in the middle of the plot area, so the half circle moves down with a locked
    // top `margin` (see below) and gets a radius that reaches up to the top of the chart, or half its width when that is smaller
    const outerRadius = ({ radius, centerY, chart }: PolarLayoutContext): number => half ? Math.min(chart.width / 2, centerY) : radius
    const innerRadius = (layout: PolarLayoutContext): number => outerRadius(layout) * 0.28
    const layout: Omit<PolarOptions, 'marks'> = gaps
      // `radialArc` draws without angle and radius scales
      ? { scales: { angle: null, radius: null } }
      : {
        // The first band starts at `startAngle`; half a slot back centers it at the top
        startAngle: half ? -Math.PI / 2 : -Math.PI / labels.length,
        endAngle: half ? Math.PI / 2 : 2 * Math.PI - Math.PI / labels.length,
        scales: {
          angle: { scale: scaleBand<string>().domain(labels).padding(0.15) },
          // One radius scale for every bar, so the values are percent of the goal. The range starts at the hole's radius
          radius: { scale: scaleLinear().domain([0, 100]), range: [innerRadius, outerRadius] },
        },
      }
    // The band padding is an angle, so its gaps widen towards the edge. The wide gaps are D3 arcs from `radialArc` instead,
    // padded with a fixed `padRadius`. They take their angles from the data, in radians clockwise from 12 o'clock
    const slot = 2 * Math.PI / labels.length
    const arcs: Bar[] = data.map((d, i) => ({ ...d, startAngle: (i - 0.5) * slot, endAngle: (i + 0.5) * slot }))
    // The interactive legend doesn't hide polar marks by itself, so the hidden metrics are filtered out here
    const bars = arcs.filter(d => visible.includes(d.label))

    return defineChart({
      marks: [
        // A track behind every bar, as in the Unovis and ECharts charts. It's a second polar layer without interaction,
        // so hovering it doesn't focus the track. `currentColor` follows the site's theme
        decorative(polar({
          ...layout,
          marks: [gaps
            ? radialArc(arcs, { key: 'key', innerRadius, padAngle: () => PAD_ANGLE, padRadius: PAD_RADIUS, cornerRadius, fill: 'currentColor', fillOpacity: 0.1 })
            : radialBarRadius(data, { angle: 'label', radius1: 0, radius2: 100, cornerRadius, fill: 'currentColor', fillOpacity: 0.1 })],
        })),
        polar({
          ...layout,
          marks: [gaps
            // `radialArc` has one outer radius for every arc; its `generator` option takes a D3 arc with one per bar
            ? radialArc(bars, {
              key: 'key',
              color: 'label',
              generator: ({ radius }) => arc<Bar>()
                .innerRadius(radius * 0.28)
                .outerRadius(d => radius * (0.28 + 0.72 * percentOfGoal(d) / 100))
                .padAngle(PAD_ANGLE)
                .padRadius(PAD_RADIUS)
                .cornerRadius(cornerRadius),
            })
            // Without `radius1` the bars would start at the center instead of the hole
            : radialBarRadius(bars, { angle: 'label', radius1: 0, radius2: percentOfGoal, key: 'key', cornerRadius, color: 'label' })],
        }),
      ],
      // The bottom margin stays automatic, so it keeps making room for the legend
      margin: half ? { top: 200 } : undefined,
      scales: { x: null, y: null },
      color: { domain: labels, legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }) },
      tooltip: {
        use: tooltip,
        content: ([point]) => ({ title: point.datum.label, rows: [{ label: 'Today', value: formatValue(point.datum), color: point.color }] }),
      },
      svgAnimation: true,
    })
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_TALL_CHART_HEIGHT} ariaLabel="Progress towards six daily goals"/>
}
