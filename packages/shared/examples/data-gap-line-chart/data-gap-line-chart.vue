<script setup lang="ts">
import { VisXYContainer, VisLine, VisBulletLegend, VisAxis, VisXYLabels } from '@unovis/vue'
import type { DataRecord, Country } from './data'
import { countries, data, legendItems } from './data'
import { ref, computed } from "vue"

function getY(c: Country): (d: DataRecord) => number {
  return (d: DataRecord) => d[c.id]
}

const x = (d: DataRecord): number => d.year
const y = countries.map(getY)
const labelConfig = {
  data: countries,
  x: 2019.5,
  y: (c: Country) => getY(c)(data[data.length - 1]),
  label: (c: Country) => c.label,
}

const curr = ref(0)
const fallbackValue = computed(() => legendItems[curr.value].value)
const items = computed(() => legendItems.map((o, i) => ({
  name: o.name,
  inactive: curr.value !== i,
  color: countries[0].color,
})))

function onLegendItemClick(_, i: number): void {
  curr.value = i
}
</script>

<template>
  <div class="fallbackValueSwitch"> Select a fallback value for missing data points:
    <VisBulletLegend :items="items" :onLegendItemClick="onLegendItemClick" />
  </div>
  <VisXYContainer :duration="0" :height="300" :xDomain="[1961, 2022]" :yDomain="[0, 650]">
    <VisLine :data="data" :x="x" :y="y" :fallbackValue="fallbackValue" />
    <VisXYLabels :style="{ backgroundColor: 'none' }" v-bind="labelConfig" />
    <VisAxis type='x' :numTicks="10" />
    <VisAxis type='y' label='National Cereal Production, tons' :tickFormat="d => `${d}${d ? 'M' : ''}`"
      :tickValues="[0, 200, 400, fallbackValue, 600]" />
  </VisXYContainer>
</template>

<style>
.fallbackValueSwitch {
  width: 415px;
  background-color: #f8f8f8;
  padding: 10px 20px;
  display: inline-block;
  border-radius: 5px;
  border: 1px solid #f4f4f4;
  margin-bottom: 10px;
}
</style>
