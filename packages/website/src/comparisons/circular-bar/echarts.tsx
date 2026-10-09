import React from 'react'
import ReactECharts from 'echarts-for-react'

import { DataRecord, formatValue, percentOfGoal } from './data'

export default function EChartsCircularBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        // One radius axis for every bar, so the bars are drawn as percent of their goal.
        // The legend lists series, not bars, so a single bar series gets none
        tooltip: { formatter: (params: { dataIndex: number }) => `<b>${data[params.dataIndex].label}</b>: ${formatValue(data[params.dataIndex])}` },
        polar: { radius: ['28%', '80%'] },
        // `startAngle` is where the first category begins; add half a slot to center the first bar at the top
        angleAxis: {
          type: 'category',
          data: data.map(d => d.label),
          startAngle: 90 + 180 / data.length,
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
          itemStyle: { borderRadius: 10 },
          barCategoryGap: '25%',
          showBackground: true,
          backgroundStyle: { color: isDark ? '#444' : '#E7E9F3', borderRadius: 10 },
          data: data.map(d => ({ name: d.label, value: percentOfGoal(d) })),
        }],
      }}
    />
  )
}
