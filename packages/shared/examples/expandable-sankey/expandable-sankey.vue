<script setup lang="ts">
import { FitMode, Sankey, SankeyLink, SankeyNode, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts'
import { VisSingleContainer, VisSankey } from '@unovis/vue'
import { sankeyData, root, Node, Link } from './data'
import { ref } from "vue"

const data = ref({ nodes: sankeyData.nodes, links: sankeyData.links })

function toggleGroup(n: SankeyNode<Node, Link>): void {
  if (n.expandable) {
    if (n.expanded) {
      sankeyData.collapse(n)
    } else {
      sankeyData.expand(n)
    }
    data.value = ({ nodes: sankeyData.nodes, links: sankeyData.links })
  }
}

const callbacks = {
  linkColor: (d: SankeyLink<Node, Link>): string => d.source.color ?? null,
  nodeCursor: (d: Node) => d.expandable ? 'pointer' : null,
  nodeIcon: (d: Node): string => d.expandable ? (d.expanded ? '-' : '+') : '',
  subLabel: (d: SankeyNode<Node, Link>): string => (d.depth === 0 || d.expanded)
    ? ''
    : `${((d.value / root.value) * 100).toFixed(1)}%`,
  events: {
    [Sankey.selectors.node]: {
      click: toggleGroup,
    },
  },
}
</script>

<template>
  <VisSingleContainer :data="data" height="min(60vh,75vw)">
    <VisSankey v-bind="callbacks" :labelFit="FitMode.Wrap" :labelForceWordBreak="false" :labelMaxWidth="150"
      :labelVerticalAlign="VerticalAlign.Middle" :nodePadding="20" :subLabelPlacement="SankeySubLabelPlacement.Inline" />
  </VisSingleContainer>
</template>
