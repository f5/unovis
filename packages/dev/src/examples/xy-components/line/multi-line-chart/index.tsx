import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/react'
import React, { useRef } from 'react'

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
