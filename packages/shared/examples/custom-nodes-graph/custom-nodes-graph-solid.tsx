import { createSignal, createMemo } from 'solid-js'
import { Selection } from 'd3-selection'
import { GraphNode, Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
import { VisSingleContainer, VisGraph, VisTooltip } from '@unovis/solid'
import {
  globalControlsContainer,
  customNodesGraph,
  graphButton,
  nodeEnterCustomRenderFunction,
  nodeUpdateCustomRenderFunction,
  renderSwimlanes,
  updateSwimlanes,
} from './constants'
import './styles.css'
import type { CustomGraphLink, CustomGraphNode } from './data'
import { data, DEFAULT_NODE_SIZE, nodeTypeColorMap, CustomGraphNodeType } from './data'

const CustomNodesGraph = (): JSX.Element => {
  const showLinkFlow = true
  const [selectedNodeId, setSelectedNodeId] = createSignal<string | undefined>(undefined)
  let graphD3SelectionRef: Selection<SVGGElement, unknown, null, undefined> | null = null
  const [graphRef, setGraphRef] = createSignal<Graph<CustomGraphNode, CustomGraphLink> | undefined>(undefined)
  const [tooltipFollowCursor, setTooltipFollowCursor] = createSignal(true)
  const [tooltipAllowHover, setTooltipAllowHover] = createSignal(true)

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

  const onZoom = () => {
    if (graphD3SelectionRef) {
      updateSwimlanes(graphD3SelectionRef)
    }
  }

  const events = createMemo(
    (): Record<string, Record<string, (n: CustomGraphNode) => void>> => ({
      [Graph.selectors.node]: {
        click: (n: CustomGraphNode) => {
          setSelectedNodeId(n.id)
        },
      },
      [Graph.selectors.background]: {
        click: () => {
          setSelectedNodeId(undefined)
        },
      },
    })
  )

  const tooltipContent = (datum: CustomGraphNode): string => {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      ${tooltipAllowHover() ? 'Visit <a href="#">website</a>' : ''}
    `
  }

  const triggers = createMemo((): Record<string, (datum: CustomGraphNode) => string> => ({
    [Graph.selectors.node]: (datum: CustomGraphNode) => tooltipContent(datum),
  }))

  const onLayoutCalculated = (
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    nodes[0].x = 100
  }

  const handleLinkFlow = createMemo(() =>
    (l: CustomGraphLink): boolean => (showLinkFlow && l.showFlow) || false
  )

  const handleLinkFlowAnimDuration = (l: CustomGraphLink): number | undefined =>
    l.linkFlowAnimDuration

  const handleLinkFlowParticleSpeed = (l: CustomGraphLink): number | undefined =>
    l.linkFlowParticleSpeed

  const handleLinkFlowParticleSize = (l: CustomGraphLink): number | undefined =>
    l.linkFlowParticleSize

  const fitView = (nodeIds?: string[]) => {
    graphRef()?.fitView(undefined, nodeIds)
  }

  const fitViewPadding = createMemo(() => ({ top: 50, right: 50, bottom: 100, left: 50 }))
  const zoomScaleExtent = createMemo(() => [0.5, 3])

  return (
    <>
      <div class={globalControlsContainer}>
        <label>
          <input
            type="checkbox"
            checked={tooltipFollowCursor()}
            onChange={(e) => setTooltipFollowCursor(e.target.checked)}
          />
          Tooltip - followCursor
        </label>
        <label>
          <input
            type="checkbox"
            checked={tooltipAllowHover()}
            onChange={(e) => setTooltipAllowHover(e.target.checked)}
          />
          Tooltip - allowHover
        </label>
        <button class={graphButton} onClick={() => fitView(['0', '1', '2', '3'])}>
          Zoom To Identity and Network Nodes
        </button>
        <button class={graphButton} onClick={() => fitView()}>
          Fit Graph
        </button>
      </div>
      <VisSingleContainer
        class={customNodesGraph}
        data={data}
        height="50vh"
        duration={1000}
      >
        <VisTooltip
          triggers={triggers()}
          followCursor={tooltipFollowCursor()}
          allowHover={tooltipAllowHover()}
        />
        <VisGraph<CustomGraphNode, CustomGraphLink>
          ref={setGraphRef}
          layoutType="parallel"
          layoutNodeGroup={(n: CustomGraphNode) => n.type}
          linkArrow={(l: CustomGraphLink) => l.showArrow}
          linkBandWidth={(l: CustomGraphLink) => 2 * (l.linkFlowParticleSize ?? 1)}
          linkCurvature={1}
          linkWidth={(l: CustomGraphLink) => l.width}
          nodeFill={getNodeFillColor}
          nodeSize={DEFAULT_NODE_SIZE}
          nodeIconSize={DEFAULT_NODE_SIZE}
          nodeLabel={(n: CustomGraphNode) => n.label}
          nodeLabelTrimLength={30}
          nodeStroke="none"
          nodeSubLabel={(n: CustomGraphNode) => n.subLabel}
          nodeSubLabelTrimLength={30}
          nodeEnterCustomRenderFunction={nodeEnterCustomRenderFunction}
          nodeUpdateCustomRenderFunction={nodeUpdateCustomRenderFunction}
          onRenderComplete={onRenderComplete}
          nodeSelectionHighlightMode={GraphNodeSelectionHighlightMode.None}
          selectedNodeId={selectedNodeId()}
          events={events()}
          linkFlow={handleLinkFlow()}
          onLayoutCalculated={onLayoutCalculated}
          linkFlowAnimDuration={handleLinkFlowAnimDuration}
          linkFlowParticleSpeed={handleLinkFlowParticleSpeed}
          linkFlowParticleSize={handleLinkFlowParticleSize}
          fitViewPadding={fitViewPadding()}
          onZoom={onZoom}
          zoomScaleExtent={zoomScaleExtent()}
        />
      </VisSingleContainer>
    </>
  )
}

export default CustomNodesGraph
