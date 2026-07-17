<script lang="ts">
  import { VisXYContainer, VisBoxplot, VisAxis } from '@unovis/svelte'
  import { data } from './data'
</script>

<VisXYContainer height={600}>
  <VisBoxplot {data} x={d => d.x} median={d => d.median} quartiles={d => d.quartiles} whiskers={d => d.whiskers}/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
</VisXYContainer>
