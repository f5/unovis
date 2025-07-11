import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Selection } from 'd3-selection'
import { GraphNode, Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
import { VisSingleContainer, VisGraph, VisGraphRef, VisTooltip } from '@unovis/react'
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

import './styles.css'

export default function BasicGraph (): JSX.Element {
  const graphRef = useRef<VisGraphRef<CustomGraphNode, CustomGraphLink> | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined)
  const graphD3SelectionRef = useRef<Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const showLinkFlow = true
  const [tooltipFollowCursor, setTooltipFollowCursor] = useState(true)
  const [tooltipAllowHover, setTooltipAllowHover] = useState(true)

  const getNodeFillColor = useCallback((n: CustomGraphNode): string | undefined => {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as CustomGraphNodeType)
  }, [])

  const onRenderComplete = useCallback(
    (
      g: Selection<SVGGElement, unknown, null, undefined>,
      nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
    ): void => {
      graphD3SelectionRef.current = g
      renderSwimlanes(g, nodes)
    },
    []
  )

  const onZoom = useCallback(() => {
    if (graphD3SelectionRef.current) {
      updateSwimlanes(graphD3SelectionRef.current)
    }
  }, [])

  const events = useMemo(
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
    }),
    [setSelectedNodeId]
  )

  const tooltipContent = useCallback((datum: CustomGraphNode): string => {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      ${tooltipAllowHover ? 'Vist <a href="#">website</a>' : ''}
    `
  }, [tooltipAllowHover])

  const triggers = useMemo((): Record<string, (datum: CustomGraphNode) => string> => ({
    [Graph.selectors.node]: (datum: CustomGraphNode) => tooltipContent(datum),
  }), [tooltipContent])

  // Modifying layout after the calculation
  const onLayoutCalculated = useCallback((
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    nodes[0].x = 100
  }, [])

  const handleLinkFlow = useCallback(
    (l: CustomGraphLink): boolean => (showLinkFlow && l.showFlow) || false,
    [showLinkFlow]
  )

  const handleLinkFlowAnimDuration = useCallback(
    (l: CustomGraphLink): number | undefined => l.linkFlowAnimDuration,
    []
  )

  const handleLinkFlowParticleSpeed = useCallback(
    (l: CustomGraphLink): number | undefined => l.linkFlowParticleSpeed,
    []
  )

  const handleLinkFlowParticleSize = useCallback(
    (l: CustomGraphLink): number | undefined => l.linkFlowParticleSize,
    []
  )

  const fitView = useCallback((nodeIds?: string[]) => {
    graphRef.current?.component?.fitView(undefined, nodeIds)
  }, [])

  return (
    <>
      <div className={globalControlsContainer}>
        <label>
          <input
            type="checkbox"
            checked={tooltipFollowCursor}
            onChange={(e) => setTooltipFollowCursor(e.target.checked)}
          />
          Tooltip - followCursor
        </label>
        <label>
          <input
            type="checkbox"
            checked={tooltipAllowHover}
            onChange={(e) => setTooltipAllowHover(e.target.checked)}
          />
          Tooltip - allowHover
        </label>
        <button className={graphButton} onClick={() => fitView(['0', '1', '2', '3'])}>Zoom To Identity and Network Nodes</button>
        <button className={graphButton} onClick={() => fitView()}>Fit Graph</button>
      </div>
      <VisSingleContainer
        className={customNodesGraph}
        data={data}
        height="50vh"
        duration={1000}
      >
        <VisTooltip
          triggers={triggers}
          followCursor={tooltipFollowCursor}
          allowHover={tooltipAllowHover}
        />
        <VisGraph<CustomGraphNode, CustomGraphLink>
          ref={graphRef}
          layoutType="parallel"
          layoutNodeGroup={useCallback((n: CustomGraphNode) => n.type, [])}
          linkArrow={useCallback((l: CustomGraphLink) => l.showArrow, [])}
          linkBandWidth={useCallback((l: CustomGraphLink) => 2 * (l.linkFlowParticleSize ?? 1), [])}
          linkCurvature={1}
          linkWidth={useCallback((l: CustomGraphLink) => l.width, [])}
          nodeFill={getNodeFillColor}
          nodeSize={DEFAULT_NODE_SIZE}
          nodeIconSize={DEFAULT_NODE_SIZE}
          nodeLabel={useCallback((n: CustomGraphNode) => n.label, [])}
          nodeLabelTrimLength={30}
          nodeStroke="none"
          nodeSubLabel={useCallback((n: CustomGraphNode) => n.subLabel, [])}
          nodeSubLabelTrimLength={30}
          nodeEnterCustomRenderFunction={nodeEnterCustomRenderFunction}
          nodeUpdateCustomRenderFunction={nodeUpdateCustomRenderFunction}
          onRenderComplete={onRenderComplete}
          nodeSelectionHighlightMode={GraphNodeSelectionHighlightMode.None}
          selectedNodeId={selectedNodeId}
          events={events}
          linkFlow={handleLinkFlow}
          onLayoutCalculated={onLayoutCalculated}
          linkFlowAnimDuration={handleLinkFlowAnimDuration}
          linkFlowParticleSpeed={handleLinkFlowParticleSpeed}
          linkFlowParticleSize={handleLinkFlowParticleSize}
          fitViewPadding={useMemo(() => ({ top: 50, right: 50, bottom: 100, left: 50 }), [])}
          onZoom={onZoom}
          zoomScaleExtent={useMemo(() => [0.5, 3], [])}
        />
      </VisSingleContainer>
    </>
  )
}
