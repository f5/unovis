import React from 'react'
import { ResponsiveSankey } from '@nivo/sankey'

import type { ChartProps } from '../types'
import { SankeyData, NodeDatum, formatVisits } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

// Nivo colors every node and paints each link with its source node's color by default, which is the "Colored flows" preset
export default function NivoSankey ({ data, isDark, preset }: ChartProps<SankeyData>): JSX.Element {
  return (
    <ResponsiveSankey
      data={data}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 100, bottom: 10, left: 10 }}
      label={(n: NodeDatum) => n.label}
      valueFormat={formatVisits}
      nodeThickness={preset === 'thin' ? 6 : 12}
      nodeSpacing={preset === 'thin' ? 24 : 12}
      sort={preset === 'sorted' ? 'descending' : 'auto'}
    />
  )
}
