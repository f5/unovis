import React, { useRef } from 'react'
import { VisXYContainer, VisAxis, VisTooltip, VisCrosshair, VisBulletLegend, VisLine } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const title = 'Multi Line Chart'
export const subTitle = 'Generated Data'

export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    () => Math.random(),
    () => Math.random(),
  ]
  return (
    <>
      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)}>
        <VisLine x={d => d.x} y={accessors}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} />
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} />
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
        <VisTooltip ref={tooltipRef} />
      </VisXYContainer>
    </>
  )
}
