import React, { useCallback, useMemo, useState } from 'react'
import { NestedDonut, NestedDonutSegment } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { generateNestedData, NestedDatum } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'


export const title = 'Interactive Nested Donut'
export const subTitle = 'Click on node to toggle subchart, center to go back'

const defaultData = generateNestedData(100, 3)//, ['A1', 'B0', 'B1', 'B2'])

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  // Segment keys are prefixed with their parent's key (A -> A0 -> A0b), so the key length is the level
  const [currentKey, setCurrentKey] = useState('')
  const currentLevel = currentKey.length
  const data = useMemo(() => currentLevel
    ? defaultData.filter(d => [d.group, d.subgroup, d.value][currentLevel - 1] === currentKey)
    : defaultData,
  [currentKey])

  const toggleSegmentData = useCallback((segment: NestedDonutSegment<NestedDatum>) => {
    const key = segment.data?.key
    setCurrentKey(key.length > currentLevel ? key : key.slice(0, -1))
  }, [currentLevel])

  const goToPreviousLevel = useCallback(() => {
    setCurrentKey(key => key.slice(0, -1))
  }, [])

  return (<>

    <VisSingleContainer height={600}>
      <VisNestedDonut
        data={data}
        layers={[
          (d: NestedDatum) => d.group,
          (d: NestedDatum) => d.subgroup,
          (d: NestedDatum) => d.value,
        ]}
        events={{
          [NestedDonut.selectors.segment]: {
            click: toggleSegmentData,
          },
          [NestedDonut.selectors.centralBackground]: {
            click: goToPreviousLevel,
          },
        }}
        layerSettings={useCallback((i: number) => i < currentLevel
          ? { width: '10%', labelAlignment: 'straight' }
          : { width: `${(80 - currentLevel * 10) / (3 - currentLevel)}%` },
        [currentLevel])}
        showBackground={true}
        duration={props.duration} />
    </VisSingleContainer></>
  )
}
