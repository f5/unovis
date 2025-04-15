import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateTimeSeries, TimeDataRecord } from '@/utils/data'
import { VisAxis, VisTimeline, VisTooltip, VisXYContainer } from '@unovis/react'
import { Timeline } from '@unovis/ts'
import React from 'react'


export const title = 'Tooltip and Scrolling'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateTimeSeries(25, 10, 10).map((d, i) => ({
    ...d,
  }))
  return (<>
    <VisXYContainer<TimeDataRecord> data={data} height={300}>
      <VisTimeline x={(d: TimeDataRecord) => d.timestamp} rowHeight={50} lineWidth={10} showLabels duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => new Date(x).toDateString()} duration={props.duration}/>
      <VisTooltip triggers={{
        [Timeline.selectors.line]: (d: TimeDataRecord) =>
          `${(new Date(d.timestamp)).toDateString()} — ${(new Date(d.timestamp + d.length)).toDateString()}`,
        [Timeline.selectors.row]: (label: string) => `Timeline Row ${label}`,
      }}/>
    </VisXYContainer>
  </>
  )
}
