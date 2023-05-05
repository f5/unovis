import React from 'react'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'

export const title = 'Segment values'
export const subTitle = 'Configuration with custom value accessor'

type Datum = { group: string; subgroup?: string; value: string }

const nestedDonutData: Datum[] = [
  {
    group: 'risky',
    subgroup: 'challenge',
    value: '106',
  },
  {
    group: 'risky',
    subgroup: 'review',
    value: '54',
  },
  {
    group: 'risky',
    subgroup: 'block',
    value: '160',
  },
  {
    group: 'allow',
    value: '214',
  },
]
export const component = (): JSX.Element => {
  return (
    <VisSingleContainer data={nestedDonutData} height={500}>
      <VisNestedDonut
        layers={[
          (d: Datum) => d.group,
          (d: Datum) => d.subgroup,
        ]}
        showBackground={true}
        value={(d: Datum) => d.value}/>
    </VisSingleContainer>
  )
}

