import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, days, hours, formatHour, formatCell, getBuckets } from './data'
import { GREENS, GREENS_DARK, ORANGES } from './constants'

export default function EChartsHeatmap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const colors = preset === 'buckets' ? ORANGES : isDark ? GREENS_DARK : GREENS
  const isTransposed = preset === 'transposed'
  // The category y axis lists its first item at the bottom, `inverse` puts it on top
  const hourAxis = { type: 'category', data: hours.map(formatHour), inverse: isTransposed }
  const dayAxis = { type: 'category', data: days, inverse: !isTransposed }

  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      notMerge
      option={{
        backgroundColor: 'transparent',
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) => formatCell(data[dataIndex]),
        },
        // The color scale is a visualMap: `piecewise` splits it into buckets, and clicking one hides its cells
        visualMap: {
          type: 'piecewise',
          orient: 'horizontal',
          left: 'center',
          top: 0,
          pieces: getBuckets(colors.length).map((b, i) => ({ gte: b.min, lt: b.max, label: b.label, color: colors[i] })),
        },
        grid: { top: 40, left: 10, right: 10, bottom: 10, containLabel: true },
        xAxis: isTransposed ? dayAxis : hourAxis,
        yAxis: isTransposed ? hourAxis : dayAxis,
        series: [{
          type: 'heatmap',
          // ECharts has no gap option for heatmap cells: a border in the card's background color draws one
          itemStyle: preset === 'rounded' ? { borderRadius: 6, borderWidth: 5, borderColor: isDark ? '#242526' : '#fff' } : undefined,
          // Cells without a value are '-', which ECharts leaves out
          data: data.map(d => {
            const [x, y] = isTransposed ? [days.indexOf(d.day), d.hour] : [d.hour, days.indexOf(d.day)]
            return [x, y, d.errorRate ?? '-']
          }),
        }],
      }}
    />
  )
}
