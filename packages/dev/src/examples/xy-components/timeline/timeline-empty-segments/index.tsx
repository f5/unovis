import React from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Timeline: Negative Lengths'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [showEmptySegments, toggleEmptySegments] = React.useState(true)
  const data = generateTimeSeries(10).map((d, i) => ({
    ...d,
    length: [d.length, 0, -d.length][i % 3],
    type: ['Positive', 'Zero', 'Negative'][i % 3],
  }))
  return (<>
    <label>Show empty segments: <input type='checkbox' checked={showEmptySegments} onChange={e => toggleEmptySegments(e.target.checked)}/></label>
    <VisXYContainer<TimeDataRecord> data={data} height={200}>
      <VisTimeline x={(d: TimeDataRecord) => d.timestamp} rowHeight={50} showEmptySegments={showEmptySegments} showLabels duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => new Date(x).toDateString()} duration={props.duration}/>
      <VisCrosshair template={(d: TimeDataRecord) => `${Intl.DateTimeFormat().format(d.timestamp)}: ${Math.round(d.length / Math.pow(10, 7))}m`}/>
      <VisTooltip/>
    </VisXYContainer>
  </>
  )
}
