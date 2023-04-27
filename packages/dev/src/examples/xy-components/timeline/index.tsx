import React from 'react'
import { VisXYContainer, VisTimeline } from '@unovis/react'
import { TransitionComponentProps } from '@src/components/TransitionComponent'
import { generateTimeSeries, TimeDataRecord } from '@src/utils/data'

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
      <VisTimeline x={d => d.timestamp}/>
    </VisXYContainer>
  ),
}
