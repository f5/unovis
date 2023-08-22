import React, { useRef } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const category = 'accessibility'
export const title = 'Basic Grouped Bar Chart'
export const subTitle = 'Generated Data'
export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} margin={{ top: 5, left: 5 }} xDomain={[-1, 15]}>
      <VisGroupedBar x={d => d.x} y={accessors} />
      <VisAxis type='x' label='xAxis' numTicks={15} tickFormat={(x: number) => `${x}`}/>
      <VisAxis type='y' label='yAxis' tickFormat={(y: number) => `${y}`}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
      <VisTooltip ref={tooltipRef}/>
    </VisXYContainer>
  )
}
