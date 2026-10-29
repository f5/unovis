import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { ChordData, formatTraffic } from './data'

export default function EChartsChordDiagram ({ data, isDark, preset }: ChartProps<ChordData>): JSX.Element {
  // ECharts links chord nodes by name
  const name = new Map(data.nodes.map(n => [n.id, n.label]))
  const padAngle = preset === 'gaps' ? 6 : 3
  // The chord series ignores `label.rotate`, so the radial preset turns each label with `labelLayout`.
  // Its callback gets no angles, so the arcs' mid-angles are computed the way the chord layout places them
  const totals = data.nodes.map(n => data.links.reduce((sum, l) => sum + (l.source === n.id || l.target === n.id ? l.value : 0), 0))
  const unit = (360 - padAngle * totals.filter(Boolean).length) / totals.reduce((a, b) => a + b, 0)
  let start = -90
  const midAngles = totals.map(t => {
    const mid = start + t * unit / 2
    start += t * unit + padAngle
    return mid
  })
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', valueFormatter: formatTraffic },
        series: [{
          type: 'chord',
          // Options are merged into the previous ones on update, so every preset value is set in both states
          radius: preset === 'gaps' ? ['60%', '80%'] : preset === 'radial' ? ['55%', '65%'] : ['70%', '80%'],
          padAngle,
          // Passed in every preset: an empty object merged into a previous callback would keep the callback
          labelLayout: ({ dataIndex }: { dataIndex: number }) => {
            if (preset !== 'radial') return {}
            const angle = midAngles[dataIndex]
            const right = Math.cos(angle * Math.PI / 180) >= 0
            return { rotate: right ? -angle : 180 - angle, align: right ? 'left' : 'right', verticalAlign: 'middle' }
          },
          data: data.nodes.map(n => ({ name: n.label })),
          links: data.links.map(l => ({ source: name.get(l.source), target: name.get(l.target), value: l.value })),
        }],
      }}
    />
  )
}
