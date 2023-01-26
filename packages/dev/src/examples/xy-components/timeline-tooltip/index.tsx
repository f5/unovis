import React from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip } from '@unovis/react'
import { Timeline } from '@unovis/ts'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'

export const title = 'Tooltip and Scrolling'
export const subTitle = 'Generated Data'
export const category = 'Timeline'

export const component = (): JSX.Element => {
  const data = generateTimeSeries(25, 10, 10).map((d, i) => ({
    ...d,
  }))
  return (<>
    <VisXYContainer<TimeDataRecord> data={data} height={300}>
      <VisTimeline x={(d: TimeDataRecord) => d.timestamp} rowHeight={50} lineWidth={10} showLabels/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => new Date(x).toDateString()}/>
      <VisTooltip triggers={{
        [Timeline.selectors.line]: (d: TimeDataRecord) =>
          `${(new Date(d.timestamp)).toDateString()} — ${(new Date(d.timestamp + d.length)).toDateString()}`,
      }}/>
    </VisXYContainer>
  </>
  )
}
