import React from 'react'
import { VisXYContainer, VisAxis, VisLine, VisGroupedBar } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { Scale } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Axis with Ticks Rotation'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    () => Math.random(),
    () => Math.random(),
  ]
  return (
    <>
      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)}
        xScale={Scale.scaleTime()}
        margin={{ top: 5, left: 5, bottom: 40, right: 5 }}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x'
          label="X label"
          numTicks={15}
          tickFormat={(x: number) => `${Intl.DateTimeFormat().format(x)}`}
          tickTextAngle={60}
          tickTextAlign={'left'}
          duration={props.duration}
        />
        <VisAxis type='y'
          label="Y label"
          tickFormat={(y: number) => `${y * 10000}`}
          tickTextAngle={10}
          position={'right'}
          duration={props.duration}
        />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)}
        xScale={Scale.scaleTime()}
        margin={{ top: 35, left: 65, bottom: 5, right: 5 }}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x'
          numTicks={15}
          tickFormat={(x: number) => `${x}`}
          tickTextAngle={30}
          tickTextFitMode='trim'
          tickTextAlign={'right'}
          position='top'
          duration={props.duration}
        />
        <VisAxis type='y'
          label="Y label"
          tickFormat={(y: number) => `${y}`}
          tickTextAngle={40}
          position={'right'}
          duration={props.duration}
        />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> ariaLabel='A simple example of a Grouped Bar chart' data={generateXYDataRecords(15)} margin={{ top: 5, left: 5 }} xDomain={[1, 10]}>
        <VisGroupedBar x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis
          type='x'
          tickFormat= { d => new Date(d).toDateString()}
          tickTextAngle={-30}
          tickTextWidth={20}
          tickTextFitMode='wrap'
          tickTextAlign={'right'}
          duration={props.duration}
        />
        <VisAxis
          type='y'
          label="Y label"
          tickFormat={(y: number) => `${y * 100000000}`}
          tickTextAngle={-60}
          duration={props.duration}
        />
      </VisXYContainer>
    </>
  )
}
