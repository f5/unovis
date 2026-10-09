import React from 'react'
import { ResponsivePolarBar, PolarBarTooltipProps } from '@nivo/polar-bar'

import { DataRecord, metrics, formatValue, percentOfGoal } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoCircularBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Nivo scales the longest bar to the outer radius, so the values are percent of the goal and the chart still only
  // shows them relative to each other. Its legend lists keys, not bars, so one series gets no legend
  const tooltip = ({ arc }: PolarBarTooltipProps): JSX.Element => {
    const d = data.find(d => d.label === arc.index)
    return <div style={{ padding: '4px 8px', whiteSpace: 'nowrap', background: isDark ? '#222' : '#fff', color: isDark ? '#ccc' : '#333', borderRadius: 4 }}><b>{d.label}</b>: {formatValue(d)}</div>
  }

  return (
    <ResponsivePolarBar
      data={data.map(d => ({ id: d.label, value: percentOfGoal(d) }))}
      indexBy="id"
      keys={['value']}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      // Center the first bar at the top, as in the other charts. There's no option for a gap between the bars
      startAngle={-180 / data.length}
      endAngle={360 - 180 / data.length}
      innerRadius={0.3}
      cornerRadius={8}
      colors={arc => `var(--vis-color${metrics.findIndex(m => m.label === arc.index)})`}
      enableArcLabels={false}
      enableRadialGrid={false}
      enableCircularGrid={false}
      radialAxis={null}
      circularAxisInner={null}
      circularAxisOuter={null}
      tooltip={tooltip}
    />
  )
}
