<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisAxis, VisBulletLegend, VisPlotline, VisTimeline, VisTooltip, VisXYContainer } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value))
const changeStatus = (event: Event): void => {
  update({ status: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example">
    <div class="gallery-controls">
      <label class="gallery-select">
        Show releases
        <select :value="state.status" @change="changeStatus">
          <option v-for="option in c.statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisBulletLegend :items="c.legend" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Release → end of support</p>
      <VisXYContainer :height="430" :duration="600" :xDomain="c.domain">
        <VisTimeline
          :data="view.data"
          :id="c.id"
          :x="c.start"
          :lineDuration="c.duration"
          :lineRow="c.row"
          :color="c.color"
          :lineWidth="12"
          :showRowLabels="true"
          :rowHeight="38"
          :rowLabelWidth="100"
          :rowLabelTextAlign="'left'"
          :lineCap="true"
          :pattern="c.pattern" />
        <VisPlotline :axis="'x'" :value="c.snapshot" :labelText="'19 Oct 2026'" :labelPosition="view.labelPosition" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" :triggers="c.tooltipTriggers" />
        <VisAxis :type="'x'" :tickFormat="c.yearLabel" :numTicks="8" />
      </VisXYContainer>
    </div>
  </div>
</template>
