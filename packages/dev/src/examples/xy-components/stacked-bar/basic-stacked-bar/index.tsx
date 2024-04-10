import React, { useRef } from 'react'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const title = 'Basic Stacked Bar Chart'
export const subTitle = 'Generated Data'
export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]
  const data = generateXYDataRecords(15)

  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisStackedBar x={d => d.x} y={accessors} />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} />
      <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} />
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
      <VisTooltip ref={tooltipRef} />
    </VisXYContainer>
  )
}
