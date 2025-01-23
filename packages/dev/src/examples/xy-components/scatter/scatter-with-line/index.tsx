import React from 'react'
import { VisXYContainer, VisScatter, VisAxis, VisLine } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import type { WithOptional } from '@unovis/ts/lib/types/misc'

export const title = 'Scatter with Line'
export const subTitle = 'And undefined segments'
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const accessors = [
    (d: XYDataRecord) => d.y,
  ]

  const data: WithOptional<XYDataRecord, 'y'>[] = [
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
    <VisXYContainer data={data} margin={{ top: 5, left: 5 }} xDomain={[-1, 15]}>
      <VisScatter x={d => d.x} y={accessors} duration={props.duration}/>
      <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
    </VisXYContainer>
  )
}
