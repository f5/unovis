<script lang='ts'>
  import { Scale, Scatter } from '@unovis/ts'
  import { VisXYContainer, VisScatter, VisAxis, VisTooltip } from '@unovis/svelte'
  import { palette, data, DataRecord } from './data'

  const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
  const colorScale = Scale.scaleOrdinal(palette).domain(categories)
  const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

  // scatter props
  const x = (d: DataRecord) => d.medianSalary
  const y = (d: DataRecord) => d.employmentRate
  const color = (d: DataRecord) => colorScale(d.category)
  const size = (d: DataRecord) => d.total
  const label = (d: DataRecord) => formatNumber(d.total)

  const items = categories.map(v => ({ name: v, color: colorScale(v) }))
  const triggers = {
    [Scatter.selectors.point]: (d: DataRecord) => `
      ${d.major}<br/>Number of graduates: ${d.total.toLocaleString()}
    `,
  }
</script>

<VisXYContainer {data} height={600} scaleByDomain={true}>
  <h2>American College Graduates, 2010-2012</h2>
  <VisScatter {x} {y} {color} {size} {label} sizeRange={[10, 50]} cursor='pointer'/>
  <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber}/>
  <VisAxis excludeFromDomainCalculation type='y' label='Employment Rate' tickPadding={0}/>
  <VisTooltip {triggers}/>
</VisXYContainer>
