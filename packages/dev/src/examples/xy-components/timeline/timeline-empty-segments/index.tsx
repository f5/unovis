import React, { useMemo } from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Timeline: Empty Segments'
export const subTitle = 'Small and Negative Lengths'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [showEmptySegments, toggleEmptySegments] = React.useState(true)
  const [lineCap, setLineCap] = React.useState(false)
  const data = useMemo(() => generateTimeSeries(50).map((d, i) => ({
    ...d,
    length: [d.length, 0, -d.length][i % 3],
    type: ['Positive', 'Zero', 'Negative'][i % 3],
  })), [])

  return (<>
    <div><input type='checkbox' checked={showEmptySegments} onChange={e => toggleEmptySegments(e.target.checked)}/><label>Show empty segments</label></div>
    <div><input type='checkbox' checked={lineCap} onChange={e => setLineCap(e.target.checked)}/><label>Rounded corners</label></div>
    <VisXYContainer<TimeDataRecord> data={data} height={200}>
      <VisTimeline
        lineRow={(d: TimeDataRecord) => d.type as string}
        x={(d: TimeDataRecord) => d.timestamp}
        rowHeight={50}
        showEmptySegments={showEmptySegments}
        showRowLabels
        duration={props.duration}
        lineCap={lineCap}
      />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => new Date(x).toDateString()} duration={props.duration}/>
      <VisCrosshair template={(d: TimeDataRecord) => `${Intl.DateTimeFormat().format(d.timestamp)}: ${Math.round(d.length / Math.pow(10, 7))}m`}/>
      <VisTooltip/>
    </VisXYContainer>
  </>
  )
}
