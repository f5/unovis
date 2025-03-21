import React, { useRef } from 'react'
import { VisXYContainer, VisAxis, VisTooltip, VisCrosshair, VisLine } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Multi Line Chart'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
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
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
        <VisTooltip ref={tooltipRef} />
      </VisXYContainer>
    </>
  )
}
