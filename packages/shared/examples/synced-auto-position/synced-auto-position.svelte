<script lang="ts">
  import { VisXYContainer, VisLine, VisAxis, VisPlotline } from '@unovis/svelte'
  import { LabelOverflow } from '@unovis/ts'
  import { data, thresholds, DataRecord } from './data'

  const margin = { top: 10, right: 200, bottom: 30, left: 40 }
  const x = (d: DataRecord): number => d.x
  const y = (d: DataRecord): number => d.y
</script>

<VisXYContainer {data} height={400} {margin} yDomain={[5.0, 7.0]}>
  <VisLine {x} {y}/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
  {#each thresholds as t (t.value)}
    <VisPlotline
      value={t.value}
      labelText={t.label}
      labelPosition="top-right"
      labelAutoPosition={true}
      labelOverflow={LabelOverflow.Smart}
      color="#666"
      lineStyle="dash"
    />
  {/each}
</VisXYContainer>
