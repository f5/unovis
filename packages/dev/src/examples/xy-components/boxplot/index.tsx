import React from 'react'
import { VisXYContainer, VisBoxplot } from '@unovis/react'
import { TransitionComponentProps } from '@src/components/TransitionComponent'
import { generateBoxplotDataRecords, BoxplotDataRecord } from '@src/utils/data'

export const transitionComponent: TransitionComponentProps<BoxplotDataRecord[]> = {
  data: generateBoxplotDataRecords,
  dataSeries: {
    noData: () => [],
    singleDataElement: d => [d[0]],
    fewElements: () => generateBoxplotDataRecords(3),
    moreElements: () => generateBoxplotDataRecords(20),
  },
  component: (props) => (
    <VisXYContainer data={props.data}>
      <VisBoxplot<BoxplotDataRecord>
        x={d => d.x}
        median={d => d.median}
        quartiles={d => d.quartiles}
        whiskers={d => d.whiskers}
      />
    </VisXYContainer>
  ),
}
