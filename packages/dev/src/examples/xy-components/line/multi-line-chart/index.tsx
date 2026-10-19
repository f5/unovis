import React, { useRef, useMemo } from 'react'
import { VisXYContainer, VisAxis, VisTooltip, VisCrosshair, VisLine } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords, randomNumberGenerator } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

type LineDataRecord = XYDataRecord & { y3: number; y4: number }

export const title = 'Multi Line Chart'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => generateXYDataRecords(15).map(d => ({
    ...d,
    y3: randomNumberGenerator(),
    y4: randomNumberGenerator(),
  })), [])
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    (d: LineDataRecord) => d.y3,
    (d: LineDataRecord) => d.y4,
  ]
  return (
    <>
      <VisXYContainer<LineDataRecord> data={data}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
        <VisTooltip ref={tooltipRef} />
      </VisXYContainer>
    </>
  )
}
