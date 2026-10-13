import React, { useMemo, useState } from 'react'
import { defineChart } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { pie, polar, radialArc, radialText } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import { DataRecord, sources, formatValue, getTotal } from './data'

export default function TanStackDonutChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(sources)

  const definition = useMemo(() => {
    // `pie` adds a `source` field of its own (the row each slice comes from), so the traffic source moves to `name`.
    // It also allocates the angles before the legend filters the slices: a hidden source gets a zero value instead
    const rows = data.map(d => ({ name: d.source, sessions: visible.includes(d.source) ? d.sessions : 0 }))
    // radialText places its anchor through angle and radius scales, so the center label gets fixed ones
    const unit = { scale: scaleLinear().domain([0, 1]) }

    return defineChart({
      marks: [
        polar({
          marks: [radialArc(pie(rows, { value: 'sessions' }), { innerRadius: ({ radius }) => radius * 0.6, color: 'name', key: 'name' })],
          scales: { angle: null, radius: null },
        }),
        // `decorative` keeps the label from becoming a hover and keyboard target. Text without a `fontSize` inherits the
        // page's 16px, which overflows the hole once the legend wraps on a narrow card
        decorative(polar({
          marks: [
            radialText([formatValue(getTotal(data))], { angle: 0, radius: 0, dy: -9, fontSize: 20, fontWeight: 700 }),
            radialText(['Total sessions'], { angle: 0, radius: 0, dy: 12, fontSize: 12 }),
          ],
          scales: { angle: unit, radius: unit },
        })),
      ],
      scales: { x: null, y: null },
      color: {
        // The legend reports the next set of visible sources; the component keeps it in state
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      tooltip: {
        use: tooltip,
        format: ({ datum }) => `${datum.name}: ${formatValue(datum.sessions)}`,
      },
      svgAnimation: true,
    })
  }, [data, visible])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Website sessions by traffic source"/>
}
