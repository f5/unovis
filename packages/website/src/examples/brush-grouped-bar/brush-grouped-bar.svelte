<script lang='ts'>
  import { BulletLegendItemInterface } from '@volterra/vis'
  import { VisXYContainer, VisAxis, VisBrush, VisGroupedBar, VisBulletLegend } from '@volterra/vis-svelte'
  import { data, groups, GroupItem, DataRecord } from './data'

  type LegendItem = BulletLegendItemInterface & GroupItem

  let items: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))
  let selection = [1980, 1990]
  let duration = 0
  
  const x = (d: DataRecord) => d.year
  $: y = items.map(i => (d: DataRecord) => i.inactive ? null : d[i.key])
  $: xDomain = selection

  function updateDomain (selection: [number, number], _, userDriven: boolean) {
    if (userDriven) {
      // We set duration to 0 to update the main chart immediately (without animation) after the brush event
      duration = 0 
      xDomain = selection
    }
  }

  function updateItems (item: LegendItem, i: number) {
    const newItems = [...items]
    newItems[i] = { ...item, inactive: !item.inactive }
    duration = undefined // Enabling default animation duration for legend interactions
    items = newItems
  }
</script>

<VisBulletLegend {items} onLegendItemClick={updateItems} />
<VisXYContainer {duration} {data} height={300} {xDomain} scaleByDomain={true}>
  <VisGroupedBar x={x} y={y} groupPadding={0.2} roundedCorners barMinHeight={0} />
  <VisAxis type='x' label='Year' numTicks={Math.min(15, selection[1] - selection[0])} gridLine={false}/>
  <VisAxis type='y' label='Cereal Production (metric tons, millions)'/>
</VisXYContainer>
<VisXYContainer {data} height={75} >
  <VisGroupedBar {x} {y}/>
  <VisBrush bind:selection onBrush={updateDomain} draggable={true}/>
  <VisAxis type='x' numTicks={15}/>
</VisXYContainer>
