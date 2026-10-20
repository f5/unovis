<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisBulletLegend, VisGraph, VisSingleContainer, VisTooltip } from '@unovis/vue'
import * as c from './constants'
import './styles.css'

const state = ref(c.initialState)
const update = (patch: Partial<c.ExampleState>): void => {
  state.value = { ...state.value, ...patch }
}
const view = computed(() => c.getView(state.value, update))
const changeQuery = (event: Event): void => {
  update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
const changeLayout = (event: Event): void => {
  update({ layout: (event.target as HTMLInputElement | HTMLSelectElement).value })
}
</script>

<template>
  <div class="gallery-example dependency-explorer">
    <div class="gallery-controls">
      <label>
        Find a package
        <input type="search" :value="state.query" @input="changeQuery" />
      </label>
      <label class="gallery-select">
        Layout
        <select :value="state.layout" @change="changeLayout">
          <option v-for="option in c.layoutOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>
    <VisBulletLegend :items="c.legend" />
    <p class="gallery-summary" aria-live="polite">{{ view.summary }}</p>
    <div class="gallery-panel">
      <p class="gallery-caption">Selected direct dependencies</p>
      <VisSingleContainer :svgDefs="c.svgDefs" :height="500" :duration="600">
        <VisGraph
          :nodeStroke="c.nodeFill"
          :nodeIconSize="22"
          :nodeIcon="c.nodeIcon"
          :data="view.data"
          :layoutType="state.layout"
          :nodeLabel="c.nodeLabel"
          :nodeSubLabel="c.nodeSubLabel"
          :nodeFill="'var(--gallery-node-fill)'"
          :nodeSize="34"
          :linkArrow="'single'"
          :linkWidth="1.5"
          :linkCurvature="1"
          :selectedNodeId="state.selected"
          :events="view.events"
          :fitViewPadding="45"
          :layoutGroupOrder="c.groupOrder"
          :layoutParallelNodesPerColumn="6"
          :layoutParallelNodeSpacing="c.nodeSpacing" />
        <VisTooltip :className="c.tooltipClassName" :container="c.tooltipContainer" :triggers="c.tooltipTriggers" />
      </VisSingleContainer>
    </div>
  </div>
</template>
