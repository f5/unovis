import React, { useMemo } from 'react'
import { scaleQuantize } from 'd3-scale'
import { cell, colorLegend, defineChart } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { scaleBand } from '@tanstack/charts/scales/band'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, days, hours, rateDomain, formatRate, formatHour, formatCell } from './data'
import { GREENS, GREENS_DARK, ORANGES } from './constants'

export default function TanStackHeatmap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const definition = useMemo(() => {
    const isTransposed = preset === 'transposed'
    const isRounded = preset === 'rounded'
    // The color scale paints a cell without a value in its first color, the same as the lowest rates, so those are left out
    const rows = data.filter(d => d.errorRate !== null).map(d => ({ ...d, hourLabel: formatHour(d.hour) }))
    const hourScale = { scale: () => scaleBand<string>().domain(hours.map(formatHour)) }
    const dayScale = { scale: () => scaleBand<string>().domain(days) }

    return defineChart({
      marks: [
        cell(rows, {
          x: isTransposed ? 'day' : 'hourLabel',
          y: isTransposed ? 'hourLabel' : 'day',
          color: 'errorRate',
          key: d => `${d.day} ${d.hour}`,
          inset: isRounded ? 2.5 : undefined,
          radius: isRounded ? 6 : undefined,
        }),
      ],
      scales: { x: isTransposed ? dayScale : hourScale, y: isTransposed ? hourScale : dayScale },
      color: {
        scale: scaleQuantize<string>,
        domain: rateDomain,
        range: preset === 'buckets' ? ORANGES : isDark ? GREENS_DARK : GREENS,
        legend: colorLegend({ format: formatRate }),
      },
      tooltip: { use: tooltip, format: ({ datum }) => formatCell(datum) },
      svgAnimation: true,
    })
  }, [data, isDark, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="API error rate by hour of day and day of week"/>
}
