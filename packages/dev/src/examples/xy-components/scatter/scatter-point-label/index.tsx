import React from 'react'
import { VisXYContainer, VisScatter, VisAxis } from '@unovis/react'

import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Points with labels'
export const subTitle = 'Multi-accessor'
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y2,
  ]

  const data = generateXYDataRecords(35)
  const size = (d: XYDataRecord): number => (d.x % 2 === 0 ? 25 : 10)
  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisScatter x={d => d.x} y={accessors} size={size} label={(d, i) => `${accessors[i](d)?.toFixed(2)}`} duration={props.duration}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
    </VisXYContainer>
  )
}
