<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisPlotline } from '@unovis/vue'
import { data } from './data'
</script>

<template>
  <VisXYContainer :height="600">
    <VisLine :data="data" :x="d => d.x" :y="d => d.y" />
    <VisAxis type="x" />
    <VisAxis type="y" />
    <VisPlotline :value="1" color="red" />
  </VisXYContainer>
</template>
