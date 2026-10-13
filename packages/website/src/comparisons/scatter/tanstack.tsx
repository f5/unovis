import React, { useMemo, useState } from 'react'
import { scaleSqrt } from 'd3-scale'
import { Chart } from '@tanstack/charts/react'
import { defineChart, dot } from '@tanstack/charts'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import { DataRecord, species, formatMass } from './data'

// The `dot` mark draws circles only; other shapes need a custom mark
export default function TanStackScatterPlot ({ data }: { data: DataRecord[] }): JSX.Element {
  const [visibleSpecies, setVisibleSpecies] = useState<readonly string[]>(species)

  const definition = useMemo(() => defineChart({
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
  }), [data, visibleSpecies])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Penguin bill length by flipper length"/>
}
