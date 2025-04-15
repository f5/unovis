import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisAxis, VisCrosshair, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/react'
import React, { useRef } from 'react'


export const title = 'Basic Grouped Bar Chart'
export const subTitle = 'Generated Data'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <VisXYContainer<XYDataRecord> ariaLabel='A simple example of a Grouped Bar chart' data={generateXYDataRecords(15)} margin={{ top: 5, left: 5 }} xDomain={[-1, 15]}>
      <VisGroupedBar x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
      <VisTooltip ref={tooltipRef}/>
    </VisXYContainer>
  )
}
