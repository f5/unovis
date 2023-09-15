<script lang='ts'>
  import { Timeline } from '@unovis/ts'
  import { VisXYContainer, VisBulletLegend, VisTooltip, VisTimeline, VisAxis } from '@unovis/svelte'
  import { colorMap, data, DataRecord, ProductType } from './data'

  const labelWidth = 220
  const dateFormatter = Intl.DateTimeFormat().format

  function getTooltipText (_: string, i: number): string {
    const { startDate, endDate, description } = data[i]
    return `
      <div style="width:${labelWidth}px">
        ${[startDate, endDate].map(dateFormatter).join(' - ')}
        ${description}
      </div>`
  }

  const x = (d: DataRecord) => d.startDate
  const length = (d: DataRecord) => d.endDate - d.startDate
  const type = (d: DataRecord) => d.name
  const color = (d: DataRecord) => colorMap[d.type]

  const legendItems = Object.keys(ProductType).map((name, i) => ({ name, color: colorMap[name] }))
  const triggers = { [Timeline.selectors.label]: getTooltipText }
</script>

<VisXYContainer data={data} height={500}>
  <h3>A Timeline of Abandoned Google Products, 1997 - 2022</h3>
  <VisBulletLegend items={legendItems}/>
  <VisTimeline {x} {length} {type} {color} {labelWidth} showLabels={true}/>
  <VisTooltip triggers={triggers}/>
  <VisAxis type="x" tickFormat={dateFormatter} numTicks={10}/>
</VisXYContainer>
