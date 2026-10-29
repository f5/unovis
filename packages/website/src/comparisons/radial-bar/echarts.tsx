import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, formatUsage, percentOfQuota, formatAverageUsage } from './data'

export default function EChartsRadialBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const gauge = preset === 'gauge'
  const thick = preset === 'thick'
  const labels = data.map(d => d.label)

  // echarts-for-react merges each option into the previous one, so the preset options are set in every state
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { formatter: (params: { dataIndex: number }) => `<b>${data[params.dataIndex].label}</b>: ${formatUsage(data[params.dataIndex])}` },
        legend: { data: labels },
        title: { text: formatAverageUsage(data), subtext: 'of the quotas used', left: 'center', top: '44%' },
        polar: { radius: [thick ? '25%' : '45%', '80%'] },
        // One angle axis for every ring, so the values are percent of the quota. Degrees, counterclockwise from 3 o'clock
        angleAxis: { max: 100, startAngle: gauge ? 225 : 90, endAngle: gauge ? -45 : undefined, show: false },
        // `inverse` puts the first record on the outer ring, as in Unovis
        radiusAxis: { type: 'category', data: labels, inverse: true, show: false },
        // The legend lists series, so every ring is a series of its own, stacked onto one bar per ring
        series: data.map((d, i) => ({
          type: 'bar',
          coordinateSystem: 'polar',
          name: d.label,
          stack: 'usage',
          roundCap: preset === 'rounded',
          barWidth: thick ? 28 : 16,
          // Every series draws the track of every ring, so the default translucent gray would darken where they overlap.
          // These opaque colors are what it looks like on the site's light and dark backgrounds
          showBackground: true,
          backgroundStyle: { color: isDark ? '#404040' : '#f0f0f0' },
          data: data.map((_, j) => (j === i ? percentOfQuota(d) : null)),
        })),
      }}
    />
  )
}
