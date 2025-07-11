<script lang="ts">
  import type { Selection } from 'd3-selection'
  import { GraphNode, Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
  import { VisSingleContainer, VisGraph, VisTooltip } from '@unovis/svelte'
  import {
    globalControlsContainer,
    customNodesGraph,
    graphButton,
    nodeEnterCustomRenderFunction,
    nodeUpdateCustomRenderFunction,
    renderSwimlanes,
    updateSwimlanes,
  } from './constants'
  import { data, DEFAULT_NODE_SIZE, nodeTypeColorMap, CustomGraphNodeType, CustomGraphLink, CustomGraphNode } from './data'

  let graphRef: any = null
  let selectedNodeId: string | undefined
  let graphD3SelectionRef: Selection<SVGGElement, unknown, null, undefined> | null = null
  const showLinkFlow = true
  let tooltipFollowCursor = true
  let tooltipAllowHover = true

  const getNodeFillColor = (n: CustomGraphNode): string | undefined => {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as CustomGraphNodeType)
  }

  const onRenderComplete = (
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    graphD3SelectionRef = g
    renderSwimlanes(g, nodes)
  }

  const onZoom = (): void => {
    if (graphD3SelectionRef) {
      updateSwimlanes(graphD3SelectionRef)
    }
  }

  const events: Record<string, Record<string, (n: CustomGraphNode) => void>> = {
    [Graph.selectors.node]: {
      click: (n: CustomGraphNode) => {
        selectedNodeId = n.id
      },
    },
    [Graph.selectors.background]: {
      click: () => {
        selectedNodeId = undefined
      },
    },
  }

  const tooltipContent = (datum: CustomGraphNode): string => {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      ${tooltipAllowHover ? 'Visit <a href="#">website</a>' : ''}
    `
  }

  $: triggers = {
    [Graph.selectors.node]: (datum: CustomGraphNode) => tooltipContent(datum),
  }

  $: fitViewPadding = { top: 50, right: 50, bottom: 100, left: 50 }
  $: zoomScaleExtent = [0.5, 3]

  const onLayoutCalculated = (
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    nodes[0].x = 100
  }

  const handleLinkFlow = (l: CustomGraphLink): boolean => (showLinkFlow && l.showFlow) || false
  const handleLinkFlowAnimDuration = (l: CustomGraphLink): number | undefined => l.linkFlowAnimDuration
  const handleLinkFlowParticleSpeed = (l: CustomGraphLink): number | undefined => l.linkFlowParticleSpeed
  const handleLinkFlowParticleSize = (l: CustomGraphLink): number | undefined => l.linkFlowParticleSize

  const fitView = (nodeIds?: string[]) => {
    graphRef?.getComponent()?.fitView(undefined, nodeIds)
  }

  const layoutNodeGroup = (n: CustomGraphNode) => n.type
  const linkArrow = (l: CustomGraphLink) => l.showArrow
  const linkBandWidth = (l: CustomGraphLink) => 2 * (l.linkFlowParticleSize ?? 1)
  const linkWidth = (l: CustomGraphLink) => l.width
  const nodeLabel = (n: CustomGraphNode) => n.label
  const nodeSubLabel = (n: CustomGraphNode) => n.subLabel
</script>

<div class={globalControlsContainer}>
  <label>
    <input
      type="checkbox"
      bind:checked={tooltipFollowCursor}
    />
    Tooltip - followCursor
  </label>
  <label>
    <input
      type="checkbox"
      bind:checked={tooltipAllowHover}
    />
    Tooltip - allowHover
  </label>
  <button class={graphButton} on:click={() => fitView(['0', '1', '2', '3'])}>
    Zoom To Identity and Network Nodes
  </button>
  <button class={graphButton} on:click={() => fitView()}>
    Fit Graph
  </button>
</div>

<VisSingleContainer
  class={customNodesGraph}
  {data}
  height="50vh"
  duration={1000}
>
  <VisTooltip
    {triggers}
    followCursor={tooltipFollowCursor}
    allowHover={tooltipAllowHover}
  />
  <VisGraph
    bind:this={graphRef}
    layoutType="parallel"
    {layoutNodeGroup}
    {linkArrow}
    {linkBandWidth}
    linkCurvature={1}
    {linkWidth}
    nodeFill={getNodeFillColor}
    nodeSize={DEFAULT_NODE_SIZE}
    nodeIconSize={DEFAULT_NODE_SIZE}
    {nodeLabel}
    nodeLabelTrimLength={30}
    nodeStroke="none"
    {nodeSubLabel}
    nodeSubLabelTrimLength={30}
    {nodeEnterCustomRenderFunction}
    {nodeUpdateCustomRenderFunction}
    {onRenderComplete}
    nodeSelectionHighlightMode={GraphNodeSelectionHighlightMode.None}
    {selectedNodeId}
    {events}
    linkFlow={handleLinkFlow}
    {onLayoutCalculated}
    linkFlowAnimDuration={handleLinkFlowAnimDuration}
    linkFlowParticleSpeed={handleLinkFlowParticleSpeed}
    linkFlowParticleSize={handleLinkFlowParticleSize}
    {fitViewPadding}
    {onZoom}
    {zoomScaleExtent}
  />
</VisSingleContainer>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&display=swap');
</style>
