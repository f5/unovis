<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisBulletLegend, VisNestedDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value, update))
const changeEra = (event: Event): void => {
  update({ era: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example">
    <div class="gallery-controls">
      <label class="gallery-select">
        Discovery period
        <select :value="state.era" @change="changeEra">
          <option v-for="option in c.eraOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisBulletLegend :items="view.legend" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Discovery method → facility</p>
      <VisSingleContainer :height="500" :duration="600">
        <VisNestedDonut
          :data="view.data"
          :layers="view.layers"
          :value="c.value"
          :direction="'outwards'"
          :centralLabel="view.centralLabel"
          :centralSubLabel="view.centralSubLabel"
          :segmentColor="view.segmentColor"
          :layerSettings="c.layerSettings"
          :sort="c.sort"
          :events="view.events"
          :showBackground="true" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" :triggers="c.tooltipTriggers" />
      </VisSingleContainer>
    </div>
  </div>
</template>
