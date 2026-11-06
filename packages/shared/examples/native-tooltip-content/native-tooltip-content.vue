<script setup lang="ts">
import { VisXYContainer, VisLine, VisScatter, VisCrosshair, VisAxis, VisTooltip } from '@unovis/vue'

import { data, DataRecord, formatDay, formatRevenue, tooltipTemplate } from './data'
import { CHART_HEIGHT } from './constants'
import './styles.css'

const x = (d: DataRecord): number => d.day
const y = (d: DataRecord): number => d.revenue
const formatTick = (value: number | Date): string => formatRevenue(Number(value))
</script>

<template>
  <div class="native-tooltip-content">
    <h4>Daily revenue</h4>
    <p class="hint">Move across the chart to inspect daily revenue.</p>
    <VisXYContainer :data="data" :height="CHART_HEIGHT">
      <VisLine :x="x" :y="y" />
      <VisScatter :x="x" :y="y" :size="8" />
      <VisCrosshair :x="x" :y="y" :template="tooltipTemplate" />
      <VisAxis type="x" :tick-format="formatDay" :num-ticks="7" />
      <VisAxis type="y" :tick-format="formatTick" />
      <VisTooltip class-name="native-tooltip-content-popup" />
    </VisXYContainer>
  </div>
</template>
