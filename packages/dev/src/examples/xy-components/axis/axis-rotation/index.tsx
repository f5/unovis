import React, { useMemo } from 'react'
import { VisXYContainer, VisAxis, VisLine, VisGroupedBar } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords, randomNumberGenerator } from '@src/utils/data'
import { Scale } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

type LineDataRecord = XYDataRecord & { y3: number; y4: number }

export const title = 'Axis with Ticks Rotation'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => Array.from({ length: 3 }, () => generateXYDataRecords(15).map(d => ({
    ...d,
    y3: randomNumberGenerator(),
    y4: randomNumberGenerator(),
  }))), [])
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    (d: LineDataRecord) => d.y3,
    (d: LineDataRecord) => d.y4,
  ]
  return (
    <>
      <VisXYContainer<LineDataRecord> data={data[0]}
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

      <VisXYContainer<LineDataRecord> data={data[1]}
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

      <VisXYContainer<LineDataRecord> ariaLabel='A simple example of a Grouped Bar chart' data={data[2]} margin={{ top: 5, left: 5 }} xDomain={[1, 10]}>
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
