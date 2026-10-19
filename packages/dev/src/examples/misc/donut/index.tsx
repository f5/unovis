import React from 'react'
import { randomNumberGenerator } from '@src/utils/data'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { GeneratedComponent } from '@src/examples'

export const transitionComponent: GeneratedComponent<number[]> = {
  data: (): number[] => Array(10).fill(0).map(() => randomNumberGenerator()),
  dataSeries: {
    noData: () => [],
    singleDataElement: (data: number[]) => [data[0]],
  },
  component: (props) => (
    <VisSingleContainer data={props.data}>
      <VisDonut value={d => d} duration={props.duration}/>
    </VisSingleContainer>
  ),
}
