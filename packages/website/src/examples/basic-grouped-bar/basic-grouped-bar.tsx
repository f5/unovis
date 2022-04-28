import React, { useCallback } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisBulletLegend } from '@volterra/vis-react'

import { data, colors } from './data'

const legendItems = Object.entries(colors).map(([n, c]) => ({
  name: n.toUpperCase(),
  color: c,
}))

export default function BasicGroupedBar (): JSX.Element {
  const years = data.map(d => d.year)

  return (
    <VisXYContainer height={500}>
      <h2>U.S. Election Popular Vote Results by Political Party</h2>
      <VisGroupedBar
        data={data}
        x={useCallback(d => d.year, [])}
        y={[
          useCallback(d => d.republican, []),
          useCallback(d => d.democrat, []),
          useCallback(d => d.other, []),
          useCallback(d => d.libertarian, []),
        ]}
        color={useCallback((_, i) => legendItems[i].color, [])}
      />
      <VisBulletLegend items={legendItems}/>
      <VisAxis type="x" label="Election Year" tickValues={years}/>
      <VisAxis
        type="y"
        tickFormat={useCallback((_, i: number) => `${i / Math.pow(10, 6)}.0`, [])}
        label="Number of Votes (millions)"/>
    </VisXYContainer>
  )
}
