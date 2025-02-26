import React, { useCallback, useState } from 'react'
import { NestedDonut, NestedDonutSegment } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { generateNestedData, NestedDatum } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'


export const title = 'Interactive Nested Donut'
export const subTitle = 'Click on node to toggle subchart'

const defaultData = generateNestedData(100, 3)//, ['A1', 'B0', 'B1', 'B2'])

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data, setData] = useState<NestedDatum[]>(defaultData)
  const [currentLevel, setCurrentLevel] = useState(0)

  const toggleSegmentData = useCallback((segment: NestedDonutSegment<NestedDatum>) => {
    const lvl = segment.data?.key?.length
    setData(lvl > currentLevel ? segment.data.values : segment.parent?.data.values)
    setCurrentLevel(lvl > currentLevel ? lvl : lvl - 1)
  }, [currentLevel])

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
        }}
        layerSettings={useCallback((i: number) => i < currentLevel
          ? { width: 30, labelAlignment: 'straight' }
          : { width: (250 - currentLevel * 30) / (3 - currentLevel) },
        [currentLevel])}
        showBackground={true}
        duration={props.duration} />
    </VisSingleContainer></>
  )
}

