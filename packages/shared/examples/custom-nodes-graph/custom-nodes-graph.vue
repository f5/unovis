<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { Selection } from 'd3-selection'
  import { GraphNode, Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
  import { VisSingleContainer, VisGraph, VisTooltip } from '@unovis/vue'
  import {
    globalControlsContainer,
    customNodesGraph,
    graphButton,
    nodeEnterCustomRenderFunction,
    nodeUpdateCustomRenderFunction,
    renderSwimlanes,
    updateSwimlanes,
  } from './constants'
  import { data, DEFAULT_NODE_SIZE, nodeTypeColorMap, CustomGraphNodeType, CustomGraphLink, CustomGraphNode} from './data'

  interface GraphRef {
    component?: Graph<CustomGraphNode, CustomGraphLink>;
  }

  const graphRef = ref<GraphRef | null>(null)
  const selectedNodeId = ref<string | undefined>(undefined)
  const graphD3SelectionRef = ref<Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const showLinkFlow = ref(true)
  const tooltipFollowCursor = ref(true)
  const tooltipAllowHover = ref(true)
  const fitViewPadding = computed(() => ({ top: 50, right: 50, bottom: 100, left: 50 }))
  const zoomScaleExtent = computed(() => [0.5, 3])

  const events = computed(() => ({
    [Graph.selectors.node]: {
      click: (n: CustomGraphNode) => {
        selectedNodeId.value = n.id
      },
    },
    [Graph.selectors.background]: {
      click: () => {
        selectedNodeId.value = undefined
      },
    },
  }))

  const tooltipContent = computed(() => (datum: CustomGraphNode): string => {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      ${tooltipAllowHover.value ? 'Visit <a href="#">website</a>' : ''}
    `
  })

  const triggers = computed(() => ({
    [Graph.selectors.node]: (datum: CustomGraphNode) => tooltipContent.value(datum),
  }))


  const getNodeFillColor = (n: CustomGraphNode): string | undefined => {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as CustomGraphNodeType)
  }

  const getNodeGroup = (n: CustomGraphNode) => n.type
  const getLinkArrow = (l: CustomGraphLink) => l.showArrow
  const getLinkBandWidth = (l: CustomGraphLink) => 2 * (l.linkFlowParticleSize ?? 1)
  const getLinkWidth = (l: CustomGraphLink) => l.width
  const getNodeLabel = (n: CustomGraphNode) => n.label
  const getNodeSubLabel = (n: CustomGraphNode) => n.subLabel

  const onRenderComplete = (
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    graphD3SelectionRef.value = g
    renderSwimlanes(g, nodes)
  }

  const onZoom = (): void => {
    if (graphD3SelectionRef.value) {
      updateSwimlanes(graphD3SelectionRef.value)
    }
  }

  const onLayoutCalculated = (
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    nodes[0].x = 100
  }

  const handleLinkFlow = (l: CustomGraphLink): boolean => {
    return (showLinkFlow.value && l?.showFlow) || false
  }

  const handleLinkFlowAnimDuration = (l: CustomGraphLink): number | undefined => {
    return l.linkFlowAnimDuration
  }

  const handleLinkFlowParticleSpeed = (l: CustomGraphLink): number | undefined => {
    return l.linkFlowParticleSpeed
  }

  const handleLinkFlowParticleSize = (l: CustomGraphLink): number | undefined => {
    return l.linkFlowParticleSize
  }

  const fitView = (nodeIds?: string[]): void => {
    graphRef.value?.component?.fitView(undefined, nodeIds)
  }
</script>

<template>
  <div>
    <div :class="globalControlsContainer">
      <label>
        <input
          type="checkbox"
          v-model="tooltipFollowCursor"
        />
        Tooltip - followCursor
      </label>
      <label>
        <input
          type="checkbox"
          v-model="tooltipAllowHover"
        />
        Tooltip - allowHover
      </label>
      <button :class="graphButton" @click="() => fitView(['0', '1', '2', '3'])">
        Zoom To Identity and Network Nodes
      </button>
      <button :class="graphButton" @click="() => fitView()">
        Fit Graph
      </button>
    </div>
    
    <VisSingleContainer
      :class="customNodesGraph"
      :data="data"
      height="50vh"
      :duration="1000"
    >
      <VisTooltip
        :triggers="triggers"
        :followCursor="tooltipFollowCursor"
        :allowHover="tooltipAllowHover"
      />
      <VisGraph
        ref="graphRef"
        layoutType="parallel"
        :layoutNodeGroup="getNodeGroup"
        :linkArrow="getLinkArrow"
        :linkBandWidth="getLinkBandWidth"
        :linkCurvature="1"
        :linkWidth="getLinkWidth"
        :nodeFill="getNodeFillColor"
        :nodeSize="DEFAULT_NODE_SIZE"
        :nodeIconSize="DEFAULT_NODE_SIZE"
        :nodeLabel="getNodeLabel"
        :nodeLabelTrimLength="30"
        nodeStroke="none"
        :nodeSubLabel="getNodeSubLabel"
        :nodeSubLabelTrimLength="30"
        :nodeEnterCustomRenderFunction="nodeEnterCustomRenderFunction"
        :nodeUpdateCustomRenderFunction="nodeUpdateCustomRenderFunction"
        @renderComplete="onRenderComplete"
        :nodeSelectionHighlightMode="GraphNodeSelectionHighlightMode.None"
        :selectedNodeId="selectedNodeId"
        :events="events"
        :linkFlow="handleLinkFlow"
        @layoutCalculated="onLayoutCalculated"
        :linkFlowAnimDuration="handleLinkFlowAnimDuration"
        :linkFlowParticleSpeed="handleLinkFlowParticleSpeed"
        :linkFlowParticleSize="handleLinkFlowParticleSize"
        :fitViewPadding="fitViewPadding"
        @zoom="onZoom"
        :zoomScaleExtent="zoomScaleExtent"
      />
    </VisSingleContainer>
  </div>
</template>
