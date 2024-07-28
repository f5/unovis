import { BulletLegendItemInterface } from '@unovis/ts'
import { batch, createMemo, createSignal, JSX } from 'solid-js'
import { VisAxis, VisBrush, VisBulletLegend, VisGroupedBar, VisXYContainer } from '@unovis/solid'

import { data, groups, GroupItem, DataRecord } from './data'

type LegendItem = BulletLegendItemInterface & GroupItem

const BrushGroupedBar = (): JSX.Element => {
  const [items, setItem] = createSignal<LegendItem[]>(
    groups.map((g) => ({ ...g, inactive: false }))
  )
  const [duration, setDuration] = createSignal<number | undefined>(0)

  const x = (d: DataRecord) => d.year
  const y = createMemo(() =>
    items().map((i) => (d: DataRecord) => i.inactive ? null : d[i.key])
  )
  const [domain, setDomain] = createSignal<[number, number]>([1980, 1990])

  function updateDomain (
    selection: [number, number],
    _: unknown,
    userDriven: boolean
  ) {
    if (userDriven) {
      batch(() => {
      // We set duration to 0 to update the main chart immediately (without animation) after the brush event
        setDuration(0)
        setDomain(selection)
      })
    }
  }

  function updateItems (item: LegendItem, i: number) {
    const newItems = [...items()]
    newItems[i] = { ...item, inactive: !item.inactive }
    batch(() => {
      setDuration(undefined) // Enabling default animation duration for legend interactions
      setItem(newItems)
    })
  }

  return (
    <div>
      <VisBulletLegend items={items()} onLegendItemClick={updateItems} />
      <VisXYContainer
        duration={duration()}
        data={data}
        height='50dvh'
        xDomain={domain()}
        scaleByDomain
      >
        <VisGroupedBar
          x={x}
          y={y()}
          groupPadding={0.2}
          roundedCorners
          barMinHeight={0}
        />
        <VisAxis
          type='x'
          label='Year'
          numTicks={Math.min(15, domain()[1] - domain()[0])}
          gridLine={false}
        />
        <VisAxis type='y' label='Cereal Production (metric tons, millions)' />
      </VisXYContainer>
      <VisXYContainer data={data} height={75} margin={{ left: 60 }}>
        <VisGroupedBar x={x} y={y()} />
        <VisBrush selection={domain()} onBrush={updateDomain} draggable />
        <VisAxis type='x' numTicks={15} />
      </VisXYContainer>
    </div>
  )
}

export default BrushGroupedBar
