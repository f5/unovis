import React, { useCallback, useMemo, useState } from 'react'
import { BulletLegendItemInterface } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisBrush, VisGroupedBar, VisBulletLegend } from '@unovis/react'
import { data, groups, GroupItem, DataRecord } from './data'

type LegendItem = BulletLegendItemInterface & GroupItem
const legendItems: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))

export default function BrushGroupedBar (): JSX.Element {
  const [domain, setDomain] = useState<[number, number]>([1980, 1990])
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [items, setItems] = useState(legendItems)
  const x = useCallback((d: DataRecord) => d.year, [])
  const y = useMemo(() =>
    items.map(i => (d: DataRecord) => i.inactive ? null : d[i.key])
  , [items])

  const updateDomain = useCallback((selection: [number, number], _, userDriven: boolean) => {
    if (userDriven) {
      setDuration(0) // We set duration to 0 to update the main chart immediately (without animation) after the brush event
      setDomain(selection)
    }
  }, [])

  const updateItems = useCallback((item: LegendItem, i: number) => {
    const newItems = [...items]
    newItems[i] = { ...item, inactive: !item.inactive }
    setDuration(undefined) // Enabling default animation duration for legend interactions
    setItems(newItems)
  }, [items])

  return (
    <>
      <VisBulletLegend items={items} onLegendItemClick={updateItems} />
      <VisXYContainer duration={duration} data={data} height={300} xDomain={domain} scaleByDomain={true}>
        <VisGroupedBar x={x} y={y} groupPadding={0.2} roundedCorners barMinHeight={0} />
        <VisAxis type='x' label='Year' numTicks={Math.min(15, domain[1] - domain[0])} gridLine={false}/>
        <VisAxis type='y' label='Cereal Production (metric tons, millions)'/>
      </VisXYContainer>
      <VisXYContainer data={data} height={75} >
        <VisGroupedBar x={x} y={y}/>
        <VisBrush selection={domain} onBrush={updateDomain} draggable={true}/>
        <VisAxis type='x' numTicks={15}/>
      </VisXYContainer>
    </>
  )
}
