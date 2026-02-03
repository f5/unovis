import React, { useMemo, useState } from 'react'
import { VisXYContainer, VisAxis, VisLine } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@/utils/data'
import { Scale } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

export const title = 'Axis with Ticks Rotation Slider'
export const subTitle = 'All 4 axis types'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [tickTextAngle, setTickTextAngle] = useState(0)
  const data = useMemo(() => generateXYDataRecords(15), [])
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={-180} max={180} value={tickTextAngle} onChange={e => setTickTextAngle(Number(e.target.value))} style={{ marginRight: 10, width: 500 }}/>
        <label> tickTextAngle: {tickTextAngle}° </label>
      </div>
      <h3>Bottom / Right Axis</h3>
      <VisXYContainer<XYDataRecord> duration={0} data={data} xScale={Scale.scaleTime()} height={200}>
        <VisLine x={d => d.x} y={accessors}/>
        <VisAxis type='x'
          label="X label"
          numTicks={15}
          tickFormat={(x: number | Date) => `${Intl.DateTimeFormat().format(x)}`}
          tickTextAngle={tickTextAngle}
          tickTextAlign={'right'}
          tickTextHideOverlapping={true}
        />
        <VisAxis type='y'
          label="Y label"
          tickFormat={(y: number | Date) => `${(y as number) * 100}`}
          tickTextAngle={tickTextAngle}
          position={'right'}
          numTicks={5}
        />
      </VisXYContainer>
      <h3>Top / Left Axis</h3>
      <VisXYContainer<XYDataRecord> duration={0} data={data} xScale={Scale.scaleTime()} height={200}>
        <VisLine x={d => d.x} y={accessors}/>
        <VisAxis type='x'
          label="X label"
          numTicks={15}
          tickFormat={(x: number | Date) => `${Intl.DateTimeFormat().format(x)}`}
          tickTextAngle={tickTextAngle}
          tickTextAlign={'left'}
          tickTextHideOverlapping={true}
          position={'top'}
        />
        <VisAxis type='y'
          label="Y label"
          tickFormat={(y: number | Date) => `${(y as number) * 100}`}
          tickTextAngle={tickTextAngle}
          position={'left'}
          numTicks={5}
        />
      </VisXYContainer>
    </>
  )
}
