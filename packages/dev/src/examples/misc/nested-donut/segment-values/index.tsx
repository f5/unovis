import React, { useCallback } from 'react'
import { NestedDonut } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut, VisTooltip } from '@unovis/react'

import s from './styles.module.css'

export const title = 'Segment values'
export const subTitle = 'Configuration with custom value accessor'

type Datum = { group: string; subgroup?: string; status?: string; value: number }

const nestedDonutData: Datum[] = [
  {
    group: 'risky',
    subgroup: 'challenge',
    status: 'A',
    value: 106,
  },
  {
    group: 'risky',
    subgroup: 'challenge',
    status: 'B',
    value: 50,
  },
  {
    group: 'risky',
    subgroup: 'review',
    status: 'A',
    value: 20,
  },
  {
    group: 'risky',
    subgroup: 'review',
    status: 'B',
    value: 12,
  },
  {
    group: 'risky',
    subgroup: 'review',
    status: 'C',
    value: 10,
  },
  {
    group: 'risky',
    subgroup: 'block',
    value: 160,
  },
  {
    group: 'allow',
    value: 214,
  },
]

export const component = (): JSX.Element => {
  return (
    <div className={s.chart}>
      <VisSingleContainer data={nestedDonutData} height={600}>
        <VisTooltip triggers={{
          [NestedDonut.selectors.segment]: d => [d.data.key, d.value].join(': '),
        }} />
        <VisNestedDonut
          layers={[
            (d: Datum) => d.group,
            (d: Datum) => d.subgroup,
            (d: Datum) => d.status,
          ]}
          value={useCallback((d: Datum) => d.value, [])}
          showBackground={true} />
      </VisSingleContainer>
    </div>
  )
}

