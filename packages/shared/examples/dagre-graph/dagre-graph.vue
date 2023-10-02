<script setup lang="ts">
import { VisSingleContainer, VisGraph } from '@unovis/vue'
import { GraphLayoutType, GraphNodeShape } from '@unovis/ts'
import { data, NodeDatum, LinkDatum } from './data'

const layoutType = GraphLayoutType.Dagre
const nodeLabel = (n: NodeDatum) => n.label
const nodeShape = (n: NodeDatum) => n.shape as GraphNodeShape
const nodeStroke = (l: LinkDatum) => l.color
const linkFlow = (l: LinkDatum) => l.active
const linkStroke = (l: LinkDatum) => l.color
</script>

<template>
  <VisSingleContainer :data="data" :height="600">
    <VisGraph v-bind="{
      layoutType,
      nodeLabel,
      nodeShape,
      nodeStroke,
      linkFlow,
      linkStroke

    }" />
  </VisSingleContainer>
</template>
