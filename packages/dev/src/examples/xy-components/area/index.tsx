import React from 'react'
import { VisXYContainer, VisArea } from '@unovis/react'
import { TransitionComponentProps } from '@src/components/TransitionComponent'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'

export const transitionComponent: TransitionComponentProps<XYDataRecord[]> = {
  data: generateXYDataRecords,
  dataSeries: {
    noData: () => [],
    singleDataElement: d => [d[0]],
    fewElements: () => generateXYDataRecords(3),
    singleLayer: d => d.map(d => ({ x: d.x, y: d.y })),
  },
  component: (props) => (
    <VisXYContainer data={props.data}>
      <VisArea x={d => d.x} y={[d => d.y, d => d.y1, d => d.y2]} duration={props.duration}/>
    </VisXYContainer>
  ),
}
