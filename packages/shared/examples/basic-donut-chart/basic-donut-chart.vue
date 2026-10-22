<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisBulletLegend } from '@unovis/vue'
import { data, DataRecord } from './data'

const legendItems = Object.entries(data).map(([_, data]) => ({
  name: data.key.charAt(0).toUpperCase() + data.key.slice(1)
}))
</script>

<template>
  <div class="donut-chart">
    <VisBulletLegend :items="legendItems"/>
    <VisSingleContainer :height="400">
      <VisDonut
        :value="d => d.value"
        :icon="d => d.icon"
        :data
        :showEmptySegments="true"
        :padAngle="0.01"
        :arcWidth="100"
      />
    </VisSingleContainer>
  </div>
</template>

<style>
@font-face {
  font-family: 'Font Awesome 6 Free';
  src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/webfonts/fa-solid-900.woff2) format('woff2');
  font-weight: 900;
}

.donut-chart {
  --vis-donut-icon-font-family: 'Font Awesome 6 Free';
  --vis-donut-icon-font-weight: 900;
}
</style>
