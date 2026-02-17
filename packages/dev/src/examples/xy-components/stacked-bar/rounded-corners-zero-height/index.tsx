import React, { useRef } from 'react'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Stacked Bar: Rounded Corners'
export const subTitle = 'Zero height segments'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1 ?? 0,
    (d: XYDataRecord) => d.y2 ?? 0,
  ]
  // Mix of bars: some with zero-height top (y2=0), some with zero y1 and y2, normal bars
  const data: XYDataRecord[] = [
    { x: 0, y: 8, y1: 4, y2: 0 },
    { x: 1, y: 5, y1: 6, y2: 3 },
    { x: 2, y: 10, y1: 0, y2: 0 },
    { x: 3, y: 0, y1: 5, y2: 0 },
    { x: 4, y: 7, y1: 0, y2: 4 },
    { x: 5, y: 6, y1: 3, y2: 0 },
    { x: 6, y: 9, y1: 1, y2: 2 },
  ]

  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisStackedBar x={d => d.x} y={accessors} roundedCorners={6} duration={props.duration}/>
      <VisAxis type='x' numTicks={7} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
      <VisTooltip ref={tooltipRef} />
    </VisXYContainer>
  )
}
