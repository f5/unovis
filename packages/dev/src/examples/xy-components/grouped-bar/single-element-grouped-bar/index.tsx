import React, { useRef } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'
import { Scale } from '@unovis/ts'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const title = 'Grouped Bar Chart'
export const subTitle = 'With a single group'
export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <VisXYContainer<XYDataRecord>
      data={generateXYDataRecords(1)}
      margin={{ top: 5, left: 5 }}
      xScale={Scale.scaleTime()}
    >
      <VisGroupedBar x={d => d.x + 15} y={accessors} groupWidth={40}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
      <VisTooltip ref={tooltipRef}/>
    </VisXYContainer>
  )
}
