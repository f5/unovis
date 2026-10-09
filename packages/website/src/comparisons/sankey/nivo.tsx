import React from 'react'
import { ResponsiveSankey } from '@nivo/sankey'

import { SankeyData, NodeDatum, formatVisits } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoSankey ({ data, isDark }: { data: SankeyData; isDark: boolean }): JSX.Element {
  return (
    <ResponsiveSankey
      data={data}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 100, bottom: 10, left: 10 }}
      label={(n: NodeDatum) => n.label}
      valueFormat={formatVisits}
      nodePadding={12}
    />
  )
}
