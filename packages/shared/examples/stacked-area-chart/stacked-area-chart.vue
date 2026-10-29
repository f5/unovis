<script setup lang="ts">
import { VisXYContainer, VisAxis, VisArea, VisXYLabels, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/vue'
import { data, formats, DataRecord, getLabels, gradients, legendItems, svgDefs, tooltipTemplate } from './data'

const labels = getLabels(data)

const x = (d: DataRecord) => d.year
const y = formats.map(g => (d: DataRecord) => d[g])
const color = (_: DataRecord[], i: number) => gradients[i]
const labelProps = {
  x: (d: DataRecord) => labels[d.year] ? d.year : undefined,
  y: (d: DataRecord) => labels[d.year]?.value,
  label: (d: DataRecord) => labels[d.year]?.label,
  backgroundColor: (d: DataRecord) => labels[d.year]?.color ?? 'none',
}
</script>

<template>
  <VisBulletLegend :items="legendItems" />
  <VisXYContainer :data :height="500" :svgDefs>
    <VisXYLabels v-bind="labelProps" clusterBackgroundColor="none" :clusterLabel="() => ''" />
    <VisArea :x :y :color />
    <VisAxis type="x" label="Year" :numTicks="10" :gridLine="false" :domainLine="false" />
    <VisAxis type="y" label="Revenue (USD, billions)" :numTicks="10" />
    <VisCrosshair :x :yStacked="y" :template="tooltipTemplate" />
    <VisTooltip />
  </VisXYContainer>
</template>
