import React, { useMemo, useState } from 'react'
import { max, mean, min } from 'd3-array'
import { scaleSqrt } from 'd3-scale'
import { Chart } from '@tanstack/charts/react'
import { defineChart, dot, ruleX, ruleY, text } from '@tanstack/charts'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { decorative } from '@tanstack/charts/mark/decorative'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, species, formatMass } from './data'

// The `dot` mark draws circles only; other shapes need a custom mark
export default function TanStackScatterPlot ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visibleSpecies, setVisibleSpecies] = useState<readonly string[]>(species)

  const definition = useMemo(() => {
    // The labels take data coordinates too, so they sit at the longest bill and the shortest flipper
    const averages = [{ flipperLength: mean(data, d => d.flipperLength), billLength: mean(data, d => d.billLength) }]
    const minFlipper = min(data, d => d.flipperLength)
    const maxBill = max(data, d => d.billLength)

    return defineChart({
      marks: [
        // Dots are keyed by the rows' unique `id` field, so a penguin that stays in the data moves instead of being redrawn
        dot(data, {
          x: 'flipperLength',
          y: 'billLength',
          z: 'species',
          r: 'bodyMass',
          // The radius scale gets a [0, max] domain, so the dot's area is proportional to the body mass
          rScale: { scale: () => scaleSqrt().range([0, 7]) },
        }),
        // `decorative()` keeps the labels out of the tooltip
        ...(preset === 'averages' ? [
          ruleX(averages, { x: 'flipperLength', strokeDasharray: '6 4' }),
          ruleY(averages, { y: 'billLength', strokeDasharray: '6 4' }),
          decorative(text(averages, { x: 'flipperLength', y: () => maxBill, text: d => `Average ${d.flipperLength.toFixed(0)} mm`, anchor: 'start', dx: 4, dy: 10 })),
          decorative(text(averages, { x: () => minFlipper, y: 'billLength', text: d => `Average ${d.billLength.toFixed(1)} mm`, anchor: 'start', dy: -8 })),
        ] : []),
      ],
      scales: {
        x: { scale: scaleLinear, grid: true, axis: { label: 'Flipper length (mm)' } },
        y: { scale: scaleLinear, grid: true, axis: { label: 'Bill length (mm)' } },
      },
      color: { legend: interactiveColorLegend({ visible: controlledSignal(visibleSpecies, setVisibleSpecies) }) },
      tooltip: {
        use: tooltip,
        items: [{ channel: 'group', label: 'Species' }, 'x', 'y', { id: 'bodyMass', label: 'Body mass', text: point => formatMass(point.datum.bodyMass) }],
      },
      svgAnimation: true,
    })
  }, [data, visibleSpecies, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Penguin bill length by flipper length"/>
}
