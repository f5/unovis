import React, { useState, useCallback, useEffect, ChangeEvent } from 'react'
import { BulletLegendItemInterface, BulletShape } from '@unovis/ts'
import { VisBulletLegend, VisXYContainer, VisScatter, VisGroupedBar, VisLine, VisAxis } from '@unovis/react'
import { generateStackedDataRecords, StackedDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Bullet Shapes'
export const subTitle = 'Select chart type'

const data = generateStackedDataRecords(10)
const items = Array(6).fill(0).map((_, i) => ({ name: `Y${i}`, inactive: false }))

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const chartOptions = [
    { type: 'Line', legendShape: BulletShape.Line },
    { type: 'Scatter', legendShape: BulletShape.Circle },
    { type: 'Bar', legendShape: BulletShape.Square },
  ]

  const x = (d: StackedDataRecord): number => d.x

  const [accessors, setAccessors] = useState<(null | ((d: StackedDataRecord) => number))[]>()
  const [chart, setChart] = useState(chartOptions[0])
  const [legendItems, setLegendItems] = useState(items)

  const toggleItem = useCallback((_: BulletLegendItemInterface, index: number) => {
    const newItems = legendItems.map((l, i) => i === index ? ({ ...l, inactive: !l.inactive }) : l)
    setLegendItems(newItems)
  }, [legendItems])

  useEffect(() =>
    setAccessors(legendItems.map((l, i) => l.inactive ? null : (d: StackedDataRecord) => d.ys[i]))
  , [legendItems])

  return (<>
    <select onChange={(e: ChangeEvent<HTMLSelectElement>) => setChart(chartOptions[Number(e.target.value)])}>
      {chartOptions.map((o, i) => <option value={i}>{o.type}</option>)}
    </select>
    <VisBulletLegend
      items={legendItems}
      bulletShape={chart.legendShape}
      onLegendItemClick={toggleItem}
    />
    <VisXYContainer>
      {chart.type === 'Line' && <VisLine data={data} x={x} y={accessors} duration={props.duration}/>}
      {chart.type === 'Scatter' && <VisScatter data={data} x={x} y={accessors} duration={props.duration}/>}
      {chart.type === 'Bar' && <VisGroupedBar data={data} x={x} y={accessors} roundedCorners={0} duration={props.duration}/>}
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
    </VisXYContainer>
  </>
  )
}
