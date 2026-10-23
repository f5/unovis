import React, { useState } from 'react'
import { ResponsiveRadialBar, RadialBarCustomLayerProps, RadialBarTooltipProps } from '@nivo/radial-bar'

import type { ChartProps } from '../types'
import { DataRecord, formatUsage, percentOfQuota, formatAverageUsage } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  legends: { text: { fill: '#ccc' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoRadialBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const gauge = preset === 'gauge'
  const thick = preset === 'thick'

  const tooltip = ({ bar }: RadialBarTooltipProps): JSX.Element => {
    const d = data.find(d => d.label === bar.category)
    return <div style={{ padding: '4px 8px', whiteSpace: 'nowrap', background: isDark ? '#222' : '#fff', color: isDark ? '#ccc' : '#333', borderRadius: 4 }}><b>{d.label}</b>: {formatUsage(d)}</div>
  }

  // Nivo doesn't have a center label option, so we render it as a custom layer
  const centerLabel = ({ center }: RadialBarCustomLayerProps): JSX.Element => (
    <text x={center[0]} y={center[1]} textAnchor="middle" dominantBaseline="central" fontWeight="bold" fill={isDark ? '#ccc' : '#333'}>
      {formatAverageUsage(data)} used
    </text>
  )

  return (
    <ResponsiveRadialBar
      // Every ring is a series with one bar; the bar's category names it in the legend and picks its color. The first
      // series is the innermost ring, so the series are reversed to put the first record outside, as in Unovis.
      // One value scale for every ring, so the values are percent of the quota, and a hidden ring gets a zero value
      data={data.map(d => ({ id: d.label, data: [{ x: d.label, y: hidden[d.label] ? 0 : percentOfQuota(d) }] })).reverse()}
      maxValue={100}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 130, bottom: 10, left: 10 }}
      // Degrees, clockwise from 12 o'clock
      startAngle={gauge ? -135 : 0}
      endAngle={gauge ? 135 : 360}
      // The rings split the space between the hole and the edge, as shares of the radius
      innerRadius={thick ? 0.25 : 0.5}
      padding={thick ? 0.15 : 0.25}
      cornerRadius={preset === 'rounded' ? 8 : 0}
      tracksColor={isDark ? 'rgba(255, 255, 255, .15)' : undefined}
      enableRadialGrid={false}
      enableCircularGrid={false}
      radialAxisStart={null}
      circularAxisOuter={null}
      tooltip={tooltip}
      layers={['tracks', 'bars', 'legends', centerLabel]}
      // The legend lists categories and has no toggle, so a click hides the ring's bar with a few lines of state
      legends={[{
        anchor: 'right',
        direction: 'column',
        translateX: 120,
        itemWidth: 110,
        itemHeight: 22,
        onClick: ({ id }) => setHidden({ ...hidden, [id]: !hidden[id] }),
      }]}
    />
  )
}
