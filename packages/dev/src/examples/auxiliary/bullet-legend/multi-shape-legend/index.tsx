import React, { useState, useCallback, useEffect } from 'react'
import { BulletLegendItemInterface, BulletShape } from '@unovis/ts'
import { VisBulletLegend, VisXYContainer, VisScatter, VisAxis } from '@unovis/react'
import { generateStackedDataRecords, StackedDataRecord } from '@src/utils/data'

export const title = 'Shape Legend'
export const subTitle = 'with Scatter Plot'

const STACKED = 7
const data = generateStackedDataRecords(10, STACKED)
const items = Array(STACKED).fill(0).map((_, i) => ({ name: `Y${i}`, inactive: false }))
const shapes = Object.values(BulletShape)

export const component = (): JSX.Element => {
  const x = (d: StackedDataRecord): number => d.x
  const shape = (_, i: number): string => shapes[i % shapes.length]

  const [accessors, setAccessors] = useState<(null | ((d: StackedDataRecord) => number))[]>()
  const [legendItems, setLegendItems] = useState(items)

  const toggleItem = useCallback((_: BulletLegendItemInterface, index: number) => {
    const newItems = legendItems.map((l, i) => i === index ? ({ ...l, inactive: !l.inactive }) : l)
    setLegendItems(newItems)
  }, [legendItems])

  useEffect(() =>
    setAccessors(legendItems.map((l, i) => l.inactive ? null : (d: StackedDataRecord) => d.ys[i]))
  , [legendItems])

  return (<>
    <VisBulletLegend
      items={legendItems}
      bulletShape={shape}
      onLegendItemClick={toggleItem}
    />
    <VisXYContainer>
      <VisScatter data={data} x={x} y={accessors} shape={shape}/>
      <VisAxis type='x'/>
      <VisAxis type='y'/>
    </VisXYContainer>
  </>
  )
}
