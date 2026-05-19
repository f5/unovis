<script setup lang="ts">
import { VisSingleContainer, VisRadialBar, VisTooltip, VisBulletLegend } from '@unovis/vue'
import { RadialBar, type RadialBarArcDatum } from '@unovis/ts'
import { data, DataRecord, maxValue, completion } from './data'

const legendItems = data.map(d => ({ name: d.key }))

const triggers = {
  [RadialBar.selectors.bar]: (d: RadialBarArcDatum<DataRecord>) => {
    const max = maxValue[d.index] ?? '—'
    return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
  },
}
</script>

<template>
  <VisBulletLegend :items="legendItems"/>
  <VisSingleContainer :height="400">
    <VisRadialBar
      :value="d => d.value"
      :data
      :maxValue="maxValue"
      :trackWidth="18"
      :trackPadding="4"
      :cornerRadius="9"
      :centralLabel="`${completion}%`"
      centralSubLabel="daily goals"
    />
    <VisTooltip :triggers="triggers"/>
  </VisSingleContainer>
</template>
