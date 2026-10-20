<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisAxis, VisBulletLegend, VisPlotline, VisScatter, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value))
const changeSort = (event: Event): void => {
  update({ sort: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example">
    <div class="gallery-controls">
      <label class="gallery-select">
        Show states
        <select :value="state.sort" @change="changeSort">
          <option v-for="option in c.sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisBulletLegend :items="c.legend" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Interstate arrivals, departures, and net change</p>
      <VisXYContainer :height="460" :duration="600">
        <VisStackedBar :data="view.data" :x="c.rank" :y="c.accessors" :color="c.balanceColors" :barPadding="0.3" />
        <VisScatter :data="view.data" :x="c.rank" :y="c.net" :color="'var(--vis-color2)'" :size="8" />
        <VisPlotline :value="0" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" :triggers="c.tooltipTriggers" />
        <VisAxis :type="'x'" :tickValues="c.rankTicks" :tickFormat="view.stateLabel" :tickTextAngle="-35" :tickTextAlign="'right'" :gridLine="false" />
        <VisAxis :type="'y'" :tickFormat="c.compact" :label="'People'" />
      </VisXYContainer>
    </div>
  </div>
</template>
