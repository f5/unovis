import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, getTotal } from './data'
import { ICON_SIZE, iconDataUrl } from './icon-symbols'

export default function EChartsDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const isHalf = preset === 'half'
  // Labels are text, so the icon goes in as the background image of an otherwise empty rich-text block
  const iconLabel = (d: DataRecord): object => ({
    show: true,
    position: 'inside',
    formatter: '{icon|}',
    rich: { icon: { width: ICON_SIZE, height: ICON_SIZE, backgroundColor: { image: iconDataUrl(d.source) } } },
  })

  // echarts-for-react merges each option into the previous one, so the preset options are set in every state
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', valueFormatter: formatValue },
        legend: {},
        title: { text: formatValue(getTotal(data)), subtext: 'Total sessions', left: 'center', top: isHalf ? '56%' : '42%' },
        // ECharts' built-in decal patterns, one per slice
        aria: { enabled: preset === 'patterns', decal: { show: preset === 'patterns' } },
        series: [{
          type: 'pie',
          radius: isHalf ? ['70%', '100%'] : ['45%', '65%'],
          center: ['50%', isHalf ? '75%' : '50%'],
          // Degrees, counterclockwise from 3 o'clock
          startAngle: isHalf ? 180 : 90,
          endAngle: isHalf ? 0 : 'auto',
          padAngle: preset === 'rounded' ? 2 : 0,
          itemStyle: { borderRadius: preset === 'rounded' ? 6 : 0 },
          label: { show: false },
          data: data.map(d => ({ name: d.source, value: d.sessions, label: preset === 'icons' ? iconLabel(d) : undefined })),
        }],
      }}
    />
  )
}
