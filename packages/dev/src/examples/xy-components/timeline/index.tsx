import { TransitionComponentProps } from '@/components/TransitionComponent'
import { generateTimeSeries, TimeDataRecord } from '@/utils/data'
import { VisTimeline, VisXYContainer } from '@unovis/react'
import React from 'react'

export const transitionComponent: TransitionComponentProps<TimeDataRecord[]> = {
  data: generateTimeSeries,
  dataSeries: {
    noData: () => [],
    singleDataElement: d => [d[0]],
    fewElements: d => d.filter((_, i) => i % 3 === 0),
    singleLayer: d => d.map(d => ({ ...d, type: 'A' })),
  },
  component: (props) => (
    <VisXYContainer data={props.data}>
      <VisTimeline x={d => d.timestamp} duration={props.duration ?? 1000}/>
    </VisXYContainer>
  ),
}
