import React, { useCallback, useState } from 'react'
import { BulletLegendItemInterface } from '@volterra/vis'
import { VisXYContainer, VisAxis, VisBrush, VisGroupedBar, VisBulletLegend } from '@volterra/vis-react'
import { data, groups, GroupItem, DataRecord } from './data'

type LegendItem = BulletLegendItemInterface & GroupItem
const legendItems: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))

export default function BrushGroupedBar (): JSX.Element {
  const [domain, setDomain] = useState([1980, 1990])
  const [items, setItems] = useState(legendItems)
  const x = useCallback((d: DataRecord) => d.year, [])
  const y = items.map(i => useCallback((d: DataRecord) => i.inactive ? null : d[i.key], [items]))

  function updateItems (item: LegendItem, i: number): void {
    const newItems = [...items]
    newItems[i] = { ...item, inactive: !item.inactive }
    setItems(newItems)
  }

  function updateDomain (selection: [number, number], _, userDriven: boolean): void {
    if (userDriven) setDomain(selection)
  }

  return (
    <>
      <VisBulletLegend items={items} onLegendItemClick={updateItems} />
      <VisXYContainer data={data} height={300} xDomain={domain} scaleByDomain={true}>
        <VisGroupedBar x={x} y={y} groupPadding={0.2} roundedCorners barMinHeight={0} />
        <VisAxis type='x' label='Year' numTicks={domain[1] - domain[0]} gridLine={false}/>
        <VisAxis type='y' label='Cereal Production (metric tons, millions)'/>
      </VisXYContainer>
      <VisXYContainer data={data} height={75} margin={{ top: 20 }} >
        <VisGroupedBar x={x} y={y} roundedCorners/>
        <VisBrush selection={domain} onBrushMove={updateDomain} draggable={true}/>
        <VisAxis type='x' numTicks={15}/>
      </VisXYContainer>
    </>
  )
}
