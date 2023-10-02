<script setup lang="ts">
import { BulletLegendItemInterface } from '@unovis/ts'
import { VisXYContainer, VisArea, VisAxis, VisBulletLegend } from '@unovis/vue'
import { candidates, data, DataRecord } from './data'
import { ref, computed } from "vue"

let curr = ref(candidates[0].name)

const keys = computed(() => Object.keys(data[0][curr.value]).map(d => ({ name: d })))
const x = (d: DataRecord) => d.year

function onLegendItemClick(i: BulletLegendItemInterface): void {
  curr.value = i.name as string
}

const y = computed(() => keys.value.map(i => (d: DataRecord) => d[curr.value][i.name]))
const items = computed(() => candidates.map(c => ({ ...c, inactive: curr.value !== c.name })))
</script>

<template>
  <div class="step-area-chart">
    <div class='panel'>
      <VisBulletLegend :items="Object.keys(data[0][curr]).map(d => ({ name: d }))" />
      <div class='legendSwitch'>
        <VisBulletLegend labelClassName='legendLabel' :items="items" @legend-item-click="onLegendItemClick" />
      </div>
    </div>
    <VisXYContainer :data="data" :height="400" :yDomain="[0, 42]">
      <VisArea :x="x" :y="y" curveType='stepAfter' />
      <VisAxis type='x' label='Year' />
      <VisAxis type='y' label='Number of Mentions' />
    </VisXYContainer>
  </div>
</template>

<style>
.step-area-chart {
  --vis-area-stroke-width: 3;
  --vis-area-stroke-opacity: 1;
  --vis-area-fill-opacity: 0.75;
}

.panel {
  display: flex;
  text-transform: capitalize;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.legendSwitch {
  width: max-content;
  background-color: #f8f8f8;
  padding: 10px 20px;
  display: inline-block;
  border-radius: 5px;
  border: 1px solid #f4f4f4;
}

:is(.legendLabel:hover) {
  text-decoration: underline;
}
</style>

