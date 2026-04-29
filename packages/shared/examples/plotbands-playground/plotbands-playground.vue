<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisPlotband } from '@unovis/vue'
import { data } from './data'
</script>

<template>
  <VisXYContainer :height="600">
    <VisLine :data="data" :x="d => d.x" :y="d => d.y" />
    <VisAxis type="x" />
    <VisAxis type="y" />
    <VisPlotband :from="4" :to="6" labelText="Plot band on x-axis" axis="x" labelPosition="top-inside" />
    <VisPlotband :from="1" :to="3" color="rgba(34, 99, 182, 0.3)" labelText="Plot band on y-axis" labelPosition="left-inside" />
  </VisXYContainer>
</template>