import React from 'react'
import { ResponsivePie, PieCustomLayerProps } from '@nivo/pie'

import { DataRecord, formatValue, getTotal } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoDonutChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Nivo doesn't have a center label option, so we render it as a custom layer
  const centerLabel = ({ centerX, centerY }: PieCustomLayerProps<{ id: string; value: number }>): JSX.Element => (
    <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="central" fontWeight="bold" fill={isDark ? '#ccc' : '#333'}>
      {formatValue(getTotal(data))} total
    </text>
  )

  return (
    <ResponsivePie
      data={data.map(d => ({ id: d.source, value: d.sessions }))}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 130, bottom: 10, left: 10 }}
      innerRadius={0.6}
      valueFormat={formatValue}
      enableArcLabels={false}
      enableArcLinkLabels={false}
      layers={['arcs', 'legends', centerLabel]}
      legends={[{ anchor: 'right', direction: 'column', translateX: 120, itemWidth: 110, itemHeight: 22, toggleSerie: true }]}
    />
  )
}
