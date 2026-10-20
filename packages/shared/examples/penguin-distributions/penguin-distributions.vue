<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisAxis, VisBoxplot, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value))
const changeSex = (event: Event): void => {
  update({ sex: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example">
    <div class="gallery-controls">
      <label class="gallery-select">
        Sex
        <select :value="state.sex" @change="changeSex">
          <option v-for="option in c.sexOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisBulletLegend :items="c.legend" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Body mass by species</p>
      <VisXYContainer :height="420" :duration="600">
        <VisScatter :data="view.points" :x="c.pointX" :y="c.pointY" :size="5" :color="c.pointColor" />
        <VisBoxplot
          :data="view.boxes"
          :x="c.boxX"
          :median="c.median"
          :quartiles="c.quartiles"
          :whiskers="c.whiskers"
          :color="c.boxColor"
          :barPadding="0.55" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" :triggers="c.tooltipTriggers" />
        <VisAxis :type="'x'" :tickValues="c.speciesTicks" :tickFormat="c.speciesLabel" :gridLine="false" />
        <VisAxis :type="'y'" :label="'Body mass (g)'" />
      </VisXYContainer>
    </div>
  </div>
</template>
