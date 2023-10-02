<script setup lang="ts">
import { VisSingleContainer, VisGraph } from '@unovis/vue'
import { Graph, GraphLayoutType } from '@unovis/ts'
import { ref, computed } from "vue"

import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'

const mainSite = nodes[0].site

// Reactive statements
const expanded = ref([mainSite])
const panels = computed(() => expanded.value.map(site => sites[site].panel))
const data = computed(() => ({
  nodes: nodes.flatMap<NodeDatum>(n => expanded.value.includes(n.site) ? n.children : n),
  links: links.map(l => ({
    ...l,
    source: expanded.value.includes(l.sourceGroup) ? l.source : sites[l.sourceGroup].groupNodeId,
    target: expanded.value.includes(l.targetGroup) ? l.target : sites[l.targetGroup].groupNodeId,
  })),
}))

// Graph config
const graphConfig = computed(() => ({
  events: {
    [Graph.selectors.node]: {
      click: (d: NodeDatum) => {
        expanded.value = d.site === mainSite ? [mainSite] : [mainSite, d.site]
      },
    },
  },
  nodeGaugeValue: (n: NodeDatum) => n.score,
  nodeGaugeFill: (n: NodeDatum) => StatusMap[n.status]?.color,
  nodeIconSize: 20,
  nodeShape: (n: NodeDatum) => n.shape,
  nodeSideLabels: (n: NodeDatum) => [{
    radius: 16,
    fontSize: 12,
    ...(n.children ? { text: n.children.length } : StatusMap[n.status]),
  }],
  nodeSize: (n: NodeDatum) => n.children ? 75 : 50,
  nodeSubLabel: (n: NodeDatum) => n.score && `${n.score}/100`,
  nodeStrokeWidth: 3,
  linkFlow: (l: LinkDatum) => l.showTraffic,
  linkStroke: (l: LinkDatum) => StatusMap[l.status]?.color || null,
  linkBandWidth: (l: LinkDatum) => l.showTraffic ? 12 : 6,
}))
</script>

<template>
  <div class="chart">
    <VisSingleContainer :data="data">
      <VisGraph v-bind="graphConfig" :layoutType="GraphLayoutType.Parallel" :layoutGroupOrder="['west', mainSite, 'east']"
        :layoutParallelNodesPerColumn="4" :panels="panels" />
    </VisSingleContainer>
  </div>
</template>

<style>
.chart {
  --vis-graph-icon-font-family: 'Font Awesome 6 Free';
  --vis-graph-link-stroke-opacity: 0.8;
  --vis-graph-link-band-opacity: 0.2;
  font-family: 'Font Awesome 6 Free';
}

@font-face {
  font-family: 'Font Awesome 6 Free';
  src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/webfonts/fa-solid-900.woff2) format('woff2');
}
</style>


