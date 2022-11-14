<script lang='ts'>
  import { VisXYContainer, VisAxis, VisArea, VisXYLabels } from '@unovis/svelte'
  import { data, formats, DataRecord, getLabels } from './data'

  const labels = getLabels(data)

  const x = (d: DataRecord) => d.year
  const y = formats.map(g => (d: DataRecord) => d[g])
  const labelProps = {
    x: (d: DataRecord) => labels[d.year] ? d.year : undefined,
    y: (d: DataRecord) => labels[d.year]?.value,
    label: (d: DataRecord) => labels[d.year]?.label,
    backgroundColor: (d: DataRecord) => labels[d.year]?.color ?? 'none',
  }
</script>

<VisXYContainer {data} height={500}>
  <VisXYLabels {...labelProps} clusterBackgroundColor="none" clusterLabel={() => ''}/>
  <VisArea {x} {y}/>
  <VisAxis type='x' label='Year' numTicks={10} gridLine={false} domainLine={false}/>
  <VisAxis type='y' label='Revenue (USD, billions)' numTicks={10}/>
</VisXYContainer>

