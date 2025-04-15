import { GeneratedComponent } from '@/examples'
import { generateNestedData, NestedDatum } from '@/utils/data'
import { VisNestedDonut, VisSingleContainer } from '@unovis/react'
import React from 'react'

export const transitionComponent: GeneratedComponent<NestedDatum[]> = {
  data: () => generateNestedData(100, 3),
  dataSeries: {
    noData: () => [],
    singleLayer: data => data.map(d => ({ group: d.group })),
    twoRoots: data => data.filter(d => d.group !== 'A'),
  },
  component: (props) => (
    <VisSingleContainer data={props.data}>
      <VisNestedDonut
        direction={'outwards'}
        layers={[
          (d: NestedDatum) => d.group,
          (d: NestedDatum) => d.subgroup,
          (d: NestedDatum) => d.value,
        ]}
        duration={props.duration}/>
    </VisSingleContainer>
  ),
}
