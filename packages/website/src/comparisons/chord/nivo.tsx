import React from 'react'
import { ResponsiveChord } from '@nivo/chord'

import type { ChartProps } from '../types'
import { ChordData, formatTraffic } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoChordDiagram ({ data, isDark, preset }: ChartProps<ChordData>): JSX.Element {
  // Nivo takes a square matrix: the traffic between two regions goes in both of their cells
  const index = new Map(data.nodes.map((n, i) => [n.id, i]))
  const matrix = data.nodes.map(() => data.nodes.map(() => 0))
  data.links.forEach(l => {
    matrix[index.get(l.source)][index.get(l.target)] = l.value
    matrix[index.get(l.target)][index.get(l.source)] = l.value
  })

  return (
    <ResponsiveChord
      data={matrix}
      keys={data.nodes.map(n => n.label)}
      theme={isDark ? darkTheme : undefined}
      margin={preset === 'radial' ? { top: 90, right: 90, bottom: 90, left: 90 } : { top: 40, right: 40, bottom: 40, left: 40 }}
      valueFormat={formatTraffic}
      labelRotation={preset === 'radial' ? -90 : 0}
      padAngle={preset === 'gaps' ? 0.1 : 0}
      innerRadiusRatio={preset === 'gaps' ? 0.8 : 0.9}
    />
  )
}
