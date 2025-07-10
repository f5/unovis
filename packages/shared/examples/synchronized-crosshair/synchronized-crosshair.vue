<template>
    <div>
      <h4>Line Chart</h4>
      <VisXYContainer :data="data1" :height="height">
        <VisLine :x="x" :y="y" />
        <VisCrosshair 
          ref="lineCrosshair"
          :x="x" 
          :y="[y]"
          :xPosition="lineXPosition"
          :forceShow="lineForceShow"
          :onCrosshairMove="onLineCrosshairMove"
          :template="tooltipTemplate" 
        />
        <VisTooltip />
        <VisAxis type="x" />
        <VisAxis type="y" />
      </VisXYContainer>
    </div>

    <div>
      <h4>Area Chart</h4>
      <VisXYContainer :data="data2" :height="height">
        <VisArea :x="x" :y="y" />
        <VisCrosshair 
          ref="areaCrosshair"
          :x="x" 
          :y="[y]"
          :xPosition="areaXPosition"
          :forceShow="areaForceShow"
          :onCrosshairMove="onAreaCrosshairMove"
          :template="tooltipTemplate" 
        />
        <VisTooltip />
        <VisAxis type="x" />
        <VisAxis type="y" />
      </VisXYContainer>
    </div> 

    <div>
      <h4>Scatter Plot</h4>
      <VisXYContainer :data="data3" :height="height">
        <VisScatter :x="x" :y="y" />
        <VisCrosshair 
          ref="scatterCrosshair"
          :x="x" 
          :y="[y]"
          :x-position="scatterXPosition"
          :force-show="scatterForceShow"
          :onCrosshairMove="onScatterCrosshairMove"
          :template="tooltipTemplate" 
        />
        <VisTooltip />
        <VisAxis type="x" />
        <VisAxis type="y" />
      </VisXYContainer>
    </div>
</template>

<script setup lang="ts">
import { VisXYContainer, VisLine, VisArea, VisScatter, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { data1, data2, data3, type DataRecord } from './data'
import { ref, computed, watch } from 'vue'

const height = 200

const x = (d: DataRecord) => d.x
const y = (d: DataRecord) => d.y

// Refs to crosshair components
const lineCrosshair = ref()
const areaCrosshair = ref()
const scatterCrosshair = ref()

// State management for synchronization
const syncXPosition = ref<number | undefined>(undefined)
const activeChart = ref<'line' | 'area' | 'scatter' | null>(null)

const handleCrosshairMove = (x: number | undefined, chartId: 'line' | 'area' | 'scatter') => {
  syncXPosition.value = x
  activeChart.value = x === undefined ? null : chartId
}

// Computed properties for each chart's crosshair configuration
const lineXPosition = computed(() => {
  return activeChart.value !== 'line' ? syncXPosition.value : undefined
})

const lineForceShow = computed(() => {
  return activeChart.value !== 'line' && !!syncXPosition.value
})

const areaXPosition = computed(() => {
  return activeChart.value !== 'area' ? syncXPosition.value : undefined
})

const areaForceShow = computed(() => {
  return activeChart.value !== 'area' && !!syncXPosition.value
})

const scatterXPosition = computed(() => {
  return activeChart.value !== 'scatter' ? syncXPosition.value : undefined
})

const scatterForceShow = computed(() => {
  return activeChart.value !== 'scatter' && !!syncXPosition.value
})

// Watch for changes and update component configs directly
watch([lineXPosition, lineForceShow], ([xPos, forceShow]) => {
  if (lineCrosshair.value?.component) {
    const config = lineCrosshair.value.component.config
    lineCrosshair.value.component.setConfig({
      ...config,
      xPosition: xPos,
      forceShow: forceShow
    })
    lineCrosshair.value.component._render()
  }
})

watch([areaXPosition, areaForceShow], ([xPos, forceShow]) => {
  if (areaCrosshair.value?.component) {
    const config = areaCrosshair.value.component.config
    areaCrosshair.value.component.setConfig({
      ...config,
      xPosition: xPos,
      forceShow: forceShow
    })
    areaCrosshair.value.component._render()
  }
})

watch([scatterXPosition, scatterForceShow], ([xPos, forceShow]) => {
  if (scatterCrosshair.value?.component) {
    const config = scatterCrosshair.value.component.config
    scatterCrosshair.value.component.setConfig({
      ...config,
      xPosition: xPos,
      forceShow: forceShow
    })
    scatterCrosshair.value.component._render()
  }
})

// Memoized callback functions
const onLineCrosshairMove = (x: number | undefined) => {
  handleCrosshairMove(x, 'line')
}
const onAreaCrosshairMove = (x: number | undefined) => {
  handleCrosshairMove(x, 'area')
}
const onScatterCrosshairMove = (x: number | undefined) => {
  handleCrosshairMove(x, 'scatter')
}

const tooltipTemplate = (d: DataRecord): string => {
  return `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`
}
</script>

