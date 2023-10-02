<script setup lang="ts">
import { BulletLegendItemInterface } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisBrush, VisGroupedBar, VisBulletLegend } from '@unovis/vue'
import { data, groups, GroupItem, DataRecord } from './data'
import { ref, computed } from "vue"

type LegendItem = BulletLegendItemInterface & GroupItem

const items = ref<LegendItem[]>(groups.map(g => ({ ...g, inactive: false })))
const duration = ref(0)

const x = (d: DataRecord) => d.year
const y = computed(() => items.value.map(i => (d: DataRecord) => i.inactive ? null : d[i.key]))
const domain = ref([1980, 1990])

function updateDomain(selection: [number, number], _, userDriven: boolean) {
  if (userDriven) {
    // We set duration to 0 to update the main chart immediately (without animation) after the brush event
    duration.value = 0
    domain.value = selection
  }
}

function updateItems(item: LegendItem, i: number) {
  const newItems = [...items.value]
  newItems[i] = { ...item, inactive: !item.inactive }
  duration.value = undefined // Enabling default animation duration for legend interactions
  items.value = newItems
}
</script>

<template>
  <VisBulletLegend :items="items" :onLegendItemClick="updateItems" />
  <VisXYContainer :duration="duration" :data="data" :height="300" :xDomain="domain" :scaleByDomain="true">
    <VisGroupedBar :x="x" :y="y" :groupPadding="0.2" roundedCorners :barMinHeight="0" />
    <VisAxis type='x' label='Year' :numTicks="Math.min(15, domain[1] - domain[0])" :gridLine="false" />
    <VisAxis type='y' label='Cereal Production (metric tons, millions)' />
  </VisXYContainer>
  <VisXYContainer :data="data" :height="75" :margin="{ left: 60 }">
    <VisGroupedBar :x="x" :y="y" />
    <VisBrush :selection="domain" :onBrush="updateDomain" :draggable="true" />
    <VisAxis type='x' :numTicks="15" />
  </VisXYContainer>
</template>
