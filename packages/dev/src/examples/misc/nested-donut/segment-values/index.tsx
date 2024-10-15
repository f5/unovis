import React, { useCallback, useState } from 'react'
import { NestedDonut, NestedDonutSegment } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut, VisTooltip } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import s from './styles.module.css'

export const title = 'Segment values'
export const subTitle = 'Custom value accessor + sort function'

type Datum = { group: string; subgroup?: string; status?: string; value: number }
type SortFn<T> = { label: string; compare?: (a: T, b: T) => number }

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

const sortFns: SortFn<NestedDonutSegment<Datum>>[] = [
  { label: 'Default' },
  { label: 'Alphabetic (by Key)', compare: (a, b) => a.data.key.localeCompare(b.data.key) },
  { label: 'By Value (ascending)', compare: (a, b) => a.value - b.value },
  { label: 'By Value (descending)', compare: (a, b) => b.value - a.value },
  { label: 'By Child Count', compare: (a, b) => b.children.length - a.children.length },
]
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [sort, setSort] = useState<SortFn<NestedDonutSegment<Datum>>>()
  return (
    <div className={s.chart}>
      Sort: <select onChange={e => setSort(sortFns[Number(e.target.value)])}>
        {sortFns.map(({ label }, i) => <option key={label} value={i} label={label}/>)}
      </select>
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
          showBackground={true}
          sort={sort?.compare}
          duration={props.duration}
        />
      </VisSingleContainer>
    </div>
  )
}

