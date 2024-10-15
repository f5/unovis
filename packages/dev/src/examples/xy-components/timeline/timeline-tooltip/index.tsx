import React from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip } from '@unovis/react'
import { Timeline } from '@unovis/ts'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Tooltip and Scrolling'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
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
