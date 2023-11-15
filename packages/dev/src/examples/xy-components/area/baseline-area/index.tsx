import React from 'react'
import { VisXYContainer, VisArea, VisAxis, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const title = 'Area Chart with Baseline'
export const subTitle = 'Generated Data'

export const component = (): JSX.Element => {
  const data = generateXYDataRecords(20)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]
  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisArea x={d => d.x} y={accessors} baseline={(_, i) => Math.sin(i)}/>
      <VisAxis type='x'/>
      <VisAxis type='y'/>
      <VisCrosshair/>
    </VisXYContainer>
  )
}
