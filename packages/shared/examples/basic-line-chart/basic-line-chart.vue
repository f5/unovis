<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
import { data } from './data'
</script>

<template>
  <VisXYContainer :height="600">
    <VisLine :data="data" :x="d => d.x" :y="d => d.y" />
    <VisAxis type="x" />
    <VisAxis type="y" />
  </VisXYContainer>
</template>

