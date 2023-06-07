import React from 'react'
import { VisXYContainer, VisScatter, VisAxis, VisLine } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'

export const title = 'Scatter with Line'
export const subTitle = 'And undefined segments'
export const component = (): JSX.Element => {
  const accessors = [
    (d: XYDataRecord) => d.y,
  ]

  const data: XYDataRecord[] = [
    { x: 0, y: 9.4 },
    { x: 1, y: 8.6 },
    { x: 2, y: undefined },
    { x: 3, y: undefined },
    { x: 4, y: 7.9 },
    { x: 5, y: 7.6 },
    { x: 6, y: 6.5 },
    { x: 7, y: undefined },
    { x: 8, y: undefined },
    { x: 9, y: 3.5 },
    { x: 14, y: 5.2 },
  ]
  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }} xDomain={[-1, 15]}>
      <VisScatter x={d => d.x} y={accessors} />
      <VisLine x={d => d.x} y={accessors} />
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`}/>
    </VisXYContainer>
  )
}
