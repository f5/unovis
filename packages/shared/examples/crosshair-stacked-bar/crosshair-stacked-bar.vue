<script setup lang="ts">
import { Position } from '@unovis/ts'
import { VisAxis, VisCrosshair, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/vue'
import { data, labels, DataRecord, FormatConfig } from './data'

const height = 450
const x = (d: DataRecord) => d.year
const y = labels.map((l: FormatConfig) => (d: DataRecord) => d[l.format])

function getIcon(f: FormatConfig): string {
  return `<span class="bi bi-${f.icon}" style="color:${f.color}; margin:0 4px"></span>${f.label}\t`
}

function tooltipTemplate(d: DataRecord): string {
  const numberFormat = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
  }).format
  const dataLegend = labels.filter(f => d[f.format] > 0)
    .reverse()
    .map(f => `<span>${getIcon({ ...f, label: numberFormat(d[f.format] * Math.pow(10, 10)) })}`)
    .join('</span>')
  return `<div><b>${d.year}</b>: ${dataLegend}</div>`
}
</script>

<template>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css" />
  <div>
    <span v-for="l in labels" style="margin-right: 20px" v-html="getIcon(l)"></span>
  </div>
  <VisXYContainer :data="data" :height="height">
    <VisStackedBar :x="x" :y="y" />
    <VisCrosshair :template="tooltipTemplate" />
    <VisTooltip :verticalShift="height" :horizontalPlacement="Position.Center" />
    <VisAxis type="x" />
  </VisXYContainer>
</template>
