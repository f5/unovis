import React, { useCallback } from 'react'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Empty Segments'
export const subTitle = 'In various positions'

type Datum = { group: string; subgroup?: string; subsubgroup?: string; value: number }

const data: Datum[] = [
  // middle layer (first)
  ...Array(5).fill(0).map((_, i) => ({ group: 'A', subgroup: `a${i}`, value: i })),
  // outer layer (mid)
  { group: 'B', value: 0 },
  // middle layer (mid)
  ...Array(5).fill(0).map((_, i) => ({ group: 'C', subgroup: `c${i}`, value: i === 2 ? 0 : 1 })),
  // inner layer (first, mid, last)
  ...Array(10).fill(0).map((_, i) => ({
    group: 'D',
    subgroup: `d${[i % 2]}`,
    subsubgroup: `d${i + 2}`,
    value: i === 0 || i > 7 ? 0 : 1,
  })),
  // outer layer (last)
  ...Array(5).fill(0).map((_, i) => ({ group: 'E', subgroup: `e${i}`, value: 0 })),
]

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  return (<>
    <VisSingleContainer data={data} height={500}>
      <VisNestedDonut
        layers={[
          (d: Datum) => d.group,
          (d: Datum) => d.subgroup,
          (d: Datum) => d.subsubgroup,
        ]}
        // segmentColor={d => d.value === 0 && 'black'}
        showEmptySegments={true}
        value={useCallback((d: Datum) => d.value, [])}
        duration={props.duration}
      />
    </VisSingleContainer>
  </>)
}
