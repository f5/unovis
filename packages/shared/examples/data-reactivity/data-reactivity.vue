<script setup lang="ts">
import { computed, ref } from 'vue'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'

import { DataRecord, generateData, DEFAULT_NUM_POINTS, DEFAULT_LINE_WIDTH, THICK_LINE_WIDTH } from './data'

// Reactivity smoke test: the data and lineWidth props live on the <VisLine> child
// (not the container), so clicking the controls exercises child-level data and
// config updates — the path that must trigger a chart re-render.
const numPoints = ref(DEFAULT_NUM_POINTS)
const seed = ref(0)
const lineWidth = ref(DEFAULT_LINE_WIDTH)
const data = computed(() => generateData(numPoints.value, seed.value))

function reset (): void {
  numPoints.value = DEFAULT_NUM_POINTS
  seed.value = 0
  lineWidth.value = DEFAULT_LINE_WIDTH
}
</script>

<template>
  <div>
    <div class="controls">
      <button @click="numPoints++">Add point ({{ numPoints }})</button>
      <button @click="seed++">Shuffle</button>
      <button @click="lineWidth = lineWidth === DEFAULT_LINE_WIDTH ? THICK_LINE_WIDTH : DEFAULT_LINE_WIDTH">Toggle width</button>
      <button @click="numPoints = 0">Clear</button>
      <button @click="reset">Reset</button>
    </div>
    <VisXYContainer :height="200" :duration="0">
      <VisLine :data="data" :x="(d: DataRecord) => d.x" :y="(d: DataRecord) => d.y" :lineWidth="lineWidth" />
      <VisAxis type="x" />
      <VisAxis type="y" />
    </VisXYContainer>
  </div>
</template>
