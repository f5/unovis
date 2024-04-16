import React, { useCallback } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisBulletLegend } from '@unovis/react'

import { data, capitalize, colors } from './data'

const legendItems = Object.entries(colors).map(([n, c]) => ({
  name: capitalize(n),
  color: c,
}))

export default function BasicGroupedBar (): JSX.Element {
  return (
    <>
      <h2>U.S. Election Popular Vote Results by Political Party</h2>
      <VisBulletLegend items={legendItems}/>
      <VisXYContainer height={'50vh'} data={data}>
        <VisGroupedBar
          x={useCallback(d => d.year, [])}
          y={[
            useCallback(d => d.republican, []),
            useCallback(d => d.democrat, []),
            useCallback(d => d.other, []),
            useCallback(d => d.libertarian, []),
          ]}
          color={useCallback((_, i) => legendItems[i].color, [])}
        />
        <VisAxis type="x" label="Election Year" numTicks={data.length}/>
        <VisAxis
          type="y"
          tickFormat={useCallback((value: number) => (value / 10 ** 6).toFixed(1), [])}
          label="Number of Votes (millions)"/>
      </VisXYContainer>
    </>
  )
}
