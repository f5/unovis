import React, { useCallback, useState } from 'react'
import { NestedDonut, NestedDonutSegment, StringAccessor } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut, VisTooltip } from '@unovis/react'

export const title = 'Segment values'
export const subTitle = 'Configuration with custom value accessor'

type Datum = { group: string; subgroup?: string; value: number }

const nestedDonutData: Datum[] = [
  {
    group: 'risky',
    subgroup: 'challenge',
    value: 106,
  },
  {
    group: 'risky',
    subgroup: 'review',
    value: 54,
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
  const [layers, setLayers] = useState<StringAccessor<Datum>[]>([(d: Datum) => d.subgroup || null])
  const toggleLayers = useCallback(() => {
    setLayers(layers.length === 1 ? [d => d.group, layers[0]] : [layers[1]])
  }, [layers])

  return (
    <VisSingleContainer data={nestedDonutData} height={500}>
      <VisTooltip triggers={{
        [NestedDonut.selectors.segment]: d => [d.data.key, d.value].join(': '),
      }}/>
      <VisNestedDonut
        layers={layers}
        events={{
          [NestedDonut.selectors.centralLabel]: {
            click: toggleLayers,
          },
        }}
        centralLabel='Click'
        segmentLabel={useCallback((d: NestedDonutSegment<Datum>) => [d.data.key, d.value].join(' '), [layers])}
        value={useCallback((d: Datum) => d.value, [layers])}
        showBackground={true}
      />
    </VisSingleContainer>
  )
}

