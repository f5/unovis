<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis, VisBulletLegend } from '@unovis/vue'
import { data, colors, ElectionDatum } from './data'

const items = Object.entries(colors).map(([n, c]) => ({
  name: n.toUpperCase(),
  color: c,
}))
const x = (d: ElectionDatum) => d.year
const y = [
  (d: ElectionDatum) => d.republican,
  (d: ElectionDatum) => d.democrat,
  (d: ElectionDatum) => d.other,
  (d: ElectionDatum) => d.libertarian,
]
const color = (d: ElectionDatum, i: number) => items[i].color
</script>

<template>
  <h2>U.S. Election Popular Vote Results by Political Party</h2>
  <VisBulletLegend :items="items" />
  <VisXYContainer :height="500">
    <VisGroupedBar :data="data" :x="x" :y="y" :color="color" />
    <VisAxis type="x" label="Election Year" :numTicks="data.length" />
    <VisAxis type="y" :tickFormat="(value) => (value / 10 ** 6).toFixed(1)" label="Number of Votes (millions)" />
  </VisXYContainer>
</template>
