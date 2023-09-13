import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const title = 'Basic Area Chart'
export const subTitle = 'Generated Data'
export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
  ]

  return (
    <VisXYContainer<XYDataRecord> data={generateXYDataRecords(30)} margin={{ top: 5, left: 5 }}>
      <VisArea x={d => d.x} y={accessors} />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}bps`}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
      <VisTooltip ref={tooltipRef}/>
    </VisXYContainer>
  )
}
