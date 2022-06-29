<script lang='ts'>
  import { VisXYContainer, VisAxis, VisArea, VisXYLabels } from '@volterra/vis-svelte'
  import { data, formats, DataRecord, getMaxItems } from './data'

  type Label = {
    color: string;
    label: string;
    value: number;
  }

  // map formats to their maximum data records
  const peakItems = getMaxItems(data.slice(0, data.length - 2), formats)

  // place labels at [x,y] where x = peak year and y = area midpoint
  const labelItems: Record<number, Label> = formats.reduce((obj, k, i) => {
    const offset = Array(i).fill(0).reduce((sum, _, j) => sum + peakItems[k][formats[j]], 0)
    const [x, y] = [peakItems[k].year, offset + peakItems[k][k] / 2]
    obj[x] = { label: k === 'cd' ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1), value: y, color: `var(--vis-color${i})` }
    return obj
  }, {})

  const x = (d: DataRecord) => d.year
  const y = formats.map(g => (d: DataRecord) => d[g])
  const labelProps = {
    x: (d: DataRecord) => labelItems[d.year] ? d.year : undefined,
    y: (d: DataRecord) => labelItems[d.year]?.value,
    label: (d: DataRecord) => labelItems[d.year]?.label,
    backgroundColor: (d: DataRecord) => labelItems[d.year]?.color ?? 'none',
  }
</script>

<VisXYContainer {data} height={500}>
  <VisXYLabels {...labelProps} clusterBackgroundColor="none" clusterLabel={() => ''}/>
  <VisArea {x} {y}/>
  <VisAxis type='x' label='Year' gridLine={false} domainLine={false}/>
  <VisAxis type='y' label='Revenue (USD, billions)' numTicks={10}/>
</VisXYContainer>

