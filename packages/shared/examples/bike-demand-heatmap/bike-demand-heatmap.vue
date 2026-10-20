<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisRollingPinLegend, VisHeatmap, VisSingleContainer, VisTooltip } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value))
const changeRider = (event: Event): void => {
  update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example">
    <div class="gallery-controls">
      <label class="gallery-select">
        Riders
        <select :value="state.rider" @change="changeRider">
          <option v-for="option in c.riderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisRollingPinLegend :rects="c.colorRange" leftLabelText="0" :rightLabelText="view.maxLabel" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Average trip starts · weekday × hour</p>
      <VisSingleContainer :height="330" :duration="600">
        <VisHeatmap
          :data="view.data"
          :value="c.value"
          :numRows="7"
          :colorRange="c.colorRange"
          :colorDomain="view.colorDomain"
          :rowLabel="c.weekdayLabel"
          :columnLabel="c.hourLabel"
          :cellPadding="3"
          :cellCornerRadius="3"
          :cursor="'pointer'" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" :triggers="c.tooltipTriggers" />
      </VisSingleContainer>
    </div>
  </div>
</template>
