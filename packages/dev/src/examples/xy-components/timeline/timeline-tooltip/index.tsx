import React, { useState } from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip } from '@unovis/react'
import { Position, Timeline, TimelineRowLabel } from '@unovis/ts'


export const title = 'Tooltip and Scrolling'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data, setData] = useState(() => generateTimeSeries(45, 20, 10).map((d, i) => ({
    ...d,
  })))

  const regenerateData = (): void => {
    const numLines = Math.floor(Math.random() * 20) + 10
    const numRows = Math.ceil(Math.random() * 10)
    setData(generateTimeSeries(numLines, numRows, 10).map((d, i) => ({
      ...d,
    })))
  }

  return (<>
    <div style={{ marginBottom: '1rem' }}>
      <button onClick={regenerateData}>Generate New Data</button>
    </div>
    <VisXYContainer<TimeDataRecord> data={data} height={600}>
      <VisTimeline
        lineRow={(d: TimeDataRecord) => d.type as string}
        x={(d: TimeDataRecord) => d.timestamp}
        rowHeight={50}
        lineWidth={10}
        showRowLabels
        duration={props.duration}
      />
      <VisAxis type='x' numTicks={3} tickFormat={(tick: number | Date) => new Date(tick).toDateString()} duration={props.duration}/>
      <VisTooltip
        triggers={{
          [Timeline.selectors.line]: (d: TimeDataRecord) =>
            `${(new Date(d.timestamp)).toDateString()} — ${(new Date(d.timestamp + d.length)).toDateString()}`,
          [Timeline.selectors.row]: (l: TimelineRowLabel<TimeDataRecord> | undefined) => `Timeline Row ${l?.label || ''}`,
        }}/>
    </VisXYContainer>
  </>
  )
}
