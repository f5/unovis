import React from 'react'
import { VisXYContainer, VisArea, VisAxis } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Area Min Height'
export const subTitle = 'Negative stacking'
export const component = (props: ExampleViewerDurationProps): React.ReactElement => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  // Generate data with some very small values
  const data = generateXYDataRecords(15).map((d, i) => ({
    ...d,
    y: i > 3 ? -0.0001 : -d.y, // Make some values very small
    y1: i > 4 ? -0.0001 : -(d.y1 ?? 0),
    y2: i > 5 ? -0.0001 : -(d.y2 ?? 0),
  }))

  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisArea
        x={d => d.x}
        y={accessors}
        duration={props.duration}
        minHeight={5} // Set minimum height
      />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} duration={props.duration}/>
    </VisXYContainer>
  )
}
