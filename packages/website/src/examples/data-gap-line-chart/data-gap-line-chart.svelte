<script lang='ts'>
  import { VisXYContainer, VisLine, VisBulletLegend, VisAxis, VisXYLabels } from '@unovis/svelte'
  import type { DataRecord, Country } from './data'
  import { countries, data, legendItems } from './data'

  function getY (c: Country): (d: DataRecord) => number{
    return (d: DataRecord) => d[c.id]
  }

  const x = (d: DataRecord): number => d.year
  const y = countries.map(getY)
  const labelConfig = {
    data: countries,
    x: 2019.5,
    y: (c: Country) => getY(c)(data[data.length - 1]),
    label: (c: Country) => c.label,
  }

  let curr = 0
  $: fallbackValue = legendItems[curr].value
  $: items = legendItems.map((o, i) => ({
      name: o.name,
      inactive: curr !== i,
      color: countries[0].color,
  }))

  function onLegendItemClick (_, i: number): void {
    curr = i
  }
</script>

<VisXYContainer height={300} xDomain={[1961, 2022]}>
  Select a fallback value for missing data points:
  <VisBulletLegend {items} {onLegendItemClick}/>
  <VisLine {data} {x} {y} {fallbackValue}/>
  <VisXYLabels backgroundColor='none' {...labelConfig}/>
  <VisAxis type='x' numTicks={10}/>
  <VisAxis type='y' tickValues={[fallbackValue, 600]}/>
</VisXYContainer>

