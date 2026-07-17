import React from 'react'
import { VisXYContainer, VisArea, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { TextAlign } from '@unovis/ts'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'

export const title = 'Tick Text Alignment'
export const subTitle = 'Fine control'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateXYDataRecords(10)
  const yAccessors = [
    (d: XYDataRecord) => d.y,
  ]

  const tickTextAlign = (tick: number | Date, i: number, ticks: number[] | Date[], pos: [number, number], width: number): TextAlign => {
    if (i === 0) return TextAlign.Left
    if (i === ticks.length - 1 && pos[0] > (width - 10)) return TextAlign.Right
    return TextAlign.Center
  }

  const tickFormat = (tick: number | Date): string => `${tick}ms`

  return (<>
    <p style={{ fontSize: 18 }}>This example shows to how to control the text alignment of the tick labels granularly by providing a function to <code>tickTextAlign</code>.</p>
    <p>The first last X axis tick label is left aligned, the last one is too close to the edge of the chart and should be right aligned:</p>
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }} height={150}>
      <VisArea x={d => d.x} y={yAccessors} duration={props.duration}/>
      <VisAxis type='x' minMaxTicksOnly={true} tickTextAlign={tickTextAlign} tickFormat={tickFormat} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number | Date) => `${y}bps`} duration={props.duration}/>
    </VisXYContainer>
    <p>When the last label fits, it should be center aligned:</p>
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }} height={150}>
      <VisArea x={d => d.x} y={yAccessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={5} tickTextHideOverlapping={true} tickTextAlign={tickTextAlign} tickFormat={tickFormat} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number | Date) => `${y}bps`} duration={props.duration}/>
    </VisXYContainer>
  </>
  )
}
