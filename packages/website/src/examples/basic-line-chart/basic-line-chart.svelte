<script lang='ts'>
  import { VisXYContainer, VisLine, VisAxis } from '@volterra/vis-svelte'
  import { data } from './data'
</script>

<VisXYContainer height={600}>
  <VisLine {data} x={d => d.x} y={d => d.y}/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
</VisXYContainer>

