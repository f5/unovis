import { TransitionComponentProps } from '@/components/TransitionComponent'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisArea, VisXYContainer } from '@unovis/react'
import React from 'react'

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
