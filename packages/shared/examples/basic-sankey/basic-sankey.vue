<script setup lang="ts">
import { FitMode } from '@unovis/ts'
import { VisSingleContainer, VisSankey } from '@unovis/vue'
import { data, NodeDatum } from './data'

const subLabel = (d: NodeDatum) => `£${d.value.toFixed(2)}`
</script>

<template>
  <VisSingleContainer :data :height="400">
    <VisSankey :labelFit="FitMode.Wrap" labelForceWordBreak="false" :labelMaxWidth="150" :nodePadding="20"
      :subLabel />
  </VisSingleContainer>
</template>
