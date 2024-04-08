<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisBulletLegend } from '@unovis/vue'
import { data, DataRecord } from './data'

const legendItems = Object.entries(data).map(([_, data]) => ({
  name: data.key.charAt(0).toUpperCase() + data.key.slice(1)
}))
</script>

<template>
  <h3>Most Common Password Categories</h3>
  <VisBulletLegend :items="legendItems"/>
  <VisSingleContainer :height="400">
  <VisDonut
    :value="d => d.value"
    :data="data"
    :showEmptySegments="true"
    :padAngle="0.01"
    :arcWidth="100"
  />
</VisSingleContainer>
</template>

