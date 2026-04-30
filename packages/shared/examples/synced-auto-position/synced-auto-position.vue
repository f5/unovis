<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisPlotline } from '@unovis/vue'
import { LabelOverflow } from '@unovis/ts'
import { data, thresholds, DataRecord } from './data'

const margin = { top: 10, right: 200, bottom: 30, left: 40 }
</script>

<template>
  <VisXYContainer
    :data="data"
    :height="400"
    :margin="margin"
    :y-domain="[5.0, 7.0]"
  >
    <VisLine :x="(d: DataRecord) => d.x" :y="(d: DataRecord) => d.y" />
    <VisAxis type="x" />
    <VisAxis type="y" />
    <VisPlotline
      v-for="t in thresholds"
      :key="t.value"
      :value="t.value"
      :label-text="t.label"
      label-position="top-right"
      :label-auto-position="true"
      :label-overflow="LabelOverflow.Smart"
      color="#666"
      line-style="dash"
    />
  </VisXYContainer>
</template>
