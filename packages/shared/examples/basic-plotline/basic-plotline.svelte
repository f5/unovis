<script lang='ts'>
  import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/svelte';
  import { data } from './data';
</script>

<VisXYContainer height={600}>
  <VisLine {data} x={d => d.x} y={d => d.y}/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
  <VisPlotline value={1} color="red" />
</VisXYContainer>
