<script setup lang="ts">
import { VisSingleContainer, VisGraph } from '@unovis/vue'
import { GraphForceLayoutSettings, GraphLayoutType } from '@unovis/ts'
import { data, LinkDatum, NodeDatum } from './data'

const forceLayoutSettings: GraphForceLayoutSettings = {
  forceXStrength: 0.2,
  forceYStrength: 0.4,
  charge: -700,
}
const linkLabel = (l: LinkDatum) => ({ text: l.chapter })
const nodeLabel = (n: NodeDatum) => n.id
const nodeFill = (n: NodeDatum) => n.color

</script>

<template>
  <VisSingleContainer :data="data" height="60vh">
    <VisGraph :layoutType="GraphLayoutType.Force" :nodeSize="40" :forceLayoutSettings="forceLayoutSettings"
      :linkLabel="linkLabel" :nodeFill="nodeFill" :nodeLabel="nodeLabel" />
  </VisSingleContainer>
</template>
