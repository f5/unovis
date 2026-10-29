import React, { useMemo } from 'react'
import { defineChart } from '@tanstack/charts'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
import { polar } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/charts/react'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

export default function TanStackNestedDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const definition = useMemo(() => {
    const inwards = preset === 'inwards'

    return defineChart({
      marks: [
        polar({
          // Radians, clockwise from 12 o'clock
          startAngle: preset === 'half' ? -Math.PI / 2 : 0,
          endAngle: preset === 'half' ? Math.PI / 2 : 2 * Math.PI,
          marks: [
            // The hierarchy comes from a path per row. A path needs a single root, which isn't painted
            sunburst(data, {
              path: d => `Sessions/${d.platform}/${d.os}/${d.browser}`,
              value: 'sessions',
              // The rings run from `innerRadius` (0 by default) to `outerRadius`, so swapping the two puts the platforms outside
              innerRadius: inwards ? ({ radius }) => radius : undefined,
              outerRadius: inwards ? 0 : undefined,
              // Every segment takes the color of its platform, so a stroke in the background color separates them
              color: 'branchId',
              stroke: isDark ? '#1b1b1d' : '#fff',
            }),
          ],
          scales: { angle: null, radius: null },
        }),
      ],
      scales: { x: null, y: null },
      tooltip: {
        use: tooltip,
        format: ({ datum }) => `${datum.name}: ${formatValue(datum.value)}`,
      },
      svgAnimation: true,
    })
  }, [data, isDark, preset])

  return <Chart definition={definition} height={COMPARISON_TALL_CHART_HEIGHT} ariaLabel="Website sessions by platform, operating system and browser"/>
}
