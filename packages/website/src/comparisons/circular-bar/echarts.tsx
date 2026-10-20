import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, percentOfGoal } from './data'

export default function EChartsCircularBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const half = preset === 'half'
  const borderRadius = preset === 'square' ? 0 : 10
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        // One radius axis for every bar, so the bars are drawn as percent of their goal.
        // The legend lists series, not bars, so a single bar series gets none
        tooltip: { formatter: (params: { dataIndex: number }) => `<b>${data[params.dataIndex].label}</b>: ${formatValue(data[params.dataIndex])}` },
        // A half circle is moved down and enlarged with `center` and `radius` to fill the chart
        polar: { radius: ['28%', half ? '100%' : '80%'], center: ['50%', half ? '75%' : '50%'] },
        // `startAngle` is where the first category begins; add half a slot to center the first bar at the top
        angleAxis: {
          type: 'category',
          data: data.map(d => d.label),
          startAngle: half ? 180 : 90 + 180 / data.length,
          endAngle: half ? 0 : undefined,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        radiusAxis: { max: 100, show: false },
        series: [{
          type: 'bar',
          coordinateSystem: 'polar',
          colorBy: 'data',
          // `roundCap` only rounds tangential bars; radial bars get their corners from `borderRadius`
          itemStyle: { borderRadius },
          // The gap is a share of the category's angle, so it widens towards the outer edge
          barCategoryGap: preset === 'gaps' ? '40%' : '25%',
          showBackground: true,
          backgroundStyle: { color: isDark ? '#444' : '#E7E9F3', borderRadius },
          data: data.map(d => ({ name: d.label, value: percentOfGoal(d) })),
        }],
      }}
    />
  )
}
