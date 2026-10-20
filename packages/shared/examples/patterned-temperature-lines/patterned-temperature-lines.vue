<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisAxis, VisBulletLegend, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value))
const changeMode = (event: Event): void => {
  update({ mode: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example">
    <div class="gallery-controls">
      <label class="gallery-select">
        Appearance
        <select :value="state.mode" @change="changeMode">
          <option v-for="option in c.modeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisBulletLegend :items="view.legend" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Seven-day mean temperature · °C</p>
      <VisXYContainer :height="420" :duration="600" :data="c.data">
        <VisLine :x="c.time" :y="c.accessors" :pattern="c.pattern" :color="view.colors" :lineWidth="1.6" :curveType="c.CurveType.Linear" />
        <VisCrosshair :template="c.crosshairTemplate" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" />
        <VisAxis :type="'x'" :tickFormat="c.monthLabel" :numTicks="6" />
        <VisAxis :type="'y'" :label="'Temperature (°C)'" />
      </VisXYContainer>
    </div>
  </div>
</template>
