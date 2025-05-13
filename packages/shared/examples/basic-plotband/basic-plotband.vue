<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisPlotband } from '@unovis/vue'
import { data } from './data'
</script>

<template>
  <VisXYContainer :height="600">
    <VisLine :data="data" :x="d => d.x" :y="d => d.y" />
    <VisAxis type="x" />
    <VisAxis type="y" />
    <VisPlotband :from="3" :to="5" labelText="Plot Band" />
  </VisXYContainer>
</template>
