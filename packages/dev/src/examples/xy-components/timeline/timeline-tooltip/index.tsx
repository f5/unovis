import React from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip } from '@unovis/react'
import { Timeline, TimelineRowLabel } from '@unovis/ts'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Tooltip and Scrolling'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateTimeSeries(25, 10, 10).map((d, i) => ({
    ...d,
  }))
  return (<>
    <VisXYContainer<TimeDataRecord> data={data} height={300}>
      <VisTimeline
        lineRow={(d: TimeDataRecord) => d.type as string}
        x={(d: TimeDataRecord) => d.timestamp}
        rowHeight={50}
        lineWidth={10}
        showRowLabels
        duration={props.duration}
      />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => new Date(x).toDateString()} duration={props.duration}/>
      <VisTooltip triggers={{
        [Timeline.selectors.line]: (d: TimeDataRecord) =>
          `${(new Date(d.timestamp)).toDateString()} — ${(new Date(d.timestamp + d.length)).toDateString()}`,
        [Timeline.selectors.row]: (l: TimelineRowLabel<TimeDataRecord>) => `Timeline Row ${l.label}`,
      }}/>
    </VisXYContainer>
  </>
  )
}
