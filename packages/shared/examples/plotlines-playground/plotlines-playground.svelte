<script lang="ts">
  import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/svelte'
  import { data } from './data'
</script>

<template>
  <VisXYContainer :height="600">
    <VisLine {data} x={d => d.x} y={d => d.y} />
    <VisAxis type="x" />
    <VisAxis type="y" />
    <VisPlotline value={6} color="rgba(7, 114, 21, 1)" labelText="Plot line on y-axis" labelPosition="top-left" />
    <VisPlotline value={10} color="rgba(220, 114, 0, 1)" axis="x" labelOrientation="vertical" labelText="Plot line on x-axis" />
  </VisXYContainer>
</template>
