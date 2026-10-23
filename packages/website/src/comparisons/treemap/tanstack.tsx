import React, { useMemo, useState } from 'react'
import { defineChart } from '@tanstack/charts'
import { treemap } from '@tanstack/charts/hierarchy/treemap'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { Chart } from '@tanstack/charts/react'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, teams, formatCost } from './data'

export default function TanStackTreemap ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(teams)

  const definition = useMemo(() => {
    const isRounded = preset === 'rounded'
    return defineChart({
      marks: [
        // The legend doesn't filter the treemap by itself, so the hidden teams' rows are left out and the others fill the space
        treemap(data.filter(d => visible.includes(d.team)), {
          path: d => `${d.team}/${d.service}`,
          value: 'cost',
          color: node => node.data?.team,
          label: node => `${node.name}: ${formatCost(node.value)}`,
          // Without rounding, floating-point error can put the last tile a fraction of a pixel past the edge, which throws
          round: true,
          paddingInner: isRounded ? 6 : 0,
          radius: isRounded ? 8 : undefined,
        }),
      ],
      scales: { x: null, y: null },
      color: {
        // The domain keeps the hidden teams in the legend
        domain: teams,
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      tooltip: {
        use: tooltip,
        format: ({ datum }) => `${datum.name}: ${formatCost(datum.value)}`,
      },
      svgAnimation: true,
    })
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Monthly cloud spend by team and service"/>
}
