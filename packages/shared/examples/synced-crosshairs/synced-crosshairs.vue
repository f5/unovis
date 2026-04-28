<script setup lang="ts">
import { ref } from 'vue'
import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { data, accessors, XYDataRecord } from './data'

const forcePosition = ref<number | undefined>(75)

const template = (d: XYDataRecord): string =>
  `Forced at: ${forcePosition.value}<br/>Data: ${d.x}`

function onCrosshairMove (x: number | Date | undefined): void {
  forcePosition.value = typeof x === 'number' ? x : undefined
}

const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
</script>

<template>
  <div>
    <div style="margin-bottom: 10px; font-size: 14px; color: #666">
      Crosshair forced to show at position: {{ forcePosition }}
    </div>

    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px">
      <button v-for="v in [0, 25, 50, 75, 100, 125]" :key="v" type="button" @click="forcePosition = v">
        {{ v }}
      </button>
      <button type="button" @click="forcePosition = undefined">clear</button>
      <input
        type="range"
        min="0"
        max="150"
        step="1"
        :value="forcePosition ?? 0"
        style="flex: 1"
        @input="forcePosition = Number(($event.target as HTMLInputElement).value)"
      />
    </div>

    <VisXYContainer :data="data" :margin="{ top: 5, left: 5 }">
      <VisArea :x="(d: XYDataRecord) => d.x" :y="accessors" />
      <VisAxis type="x" />
      <VisAxis type="y" />
      <VisCrosshair v-bind="{ template, forceShowAt: forcePosition, onCrosshairMove }" />
      <VisTooltip :container="tooltipContainer" />
    </VisXYContainer>

    <VisXYContainer
      y-direction="south"
      :data="data"
      :margin="{ top: 5, left: 5 }"
      :x-domain="[0, 100]"
    >
      <VisLine :x="(d: XYDataRecord) => d.x" :y="accessors" />
      <VisAxis type="x" />
      <VisAxis type="y" />
      <VisCrosshair v-bind="{ template, forceShowAt: forcePosition, onCrosshairMove }" />
      <VisTooltip :container="tooltipContainer" />
    </VisXYContainer>

    <div style="height: 800px; width: 100%" />
  </div>
</template>