import React, { useCallback, useMemo, useRef, ReactElement, useState } from 'react'
import { Selection } from 'd3-selection'
import { cx } from '@emotion/css'
import { GraphNode, GraphLink, GraphConfigInterface, Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
import { VisSingleContainer, VisGraph, VisSingleContainerProps, VisGraphProps, VisGraphRef, VisTooltip } from '@unovis/react'
import { nodeEnterCustomRenderFunction, nodeSvgDefs, nodeUpdateCustomRenderFunction } from './node-rendering'
import { DEFAULT_NODE_SIZE, nodeTypeColorMap, nodeTypeIconMap } from './constants'
import type { CustomGraphNodeType } from './enums'

import './font.css'
import * as s from './styles'
import type { CustomGraphLink, CustomGraphNode } from './types'
import { renderSwimlanes, updateSwimlanes } from './swimlane-rendering'

export type CustomGraphProps<
  N extends CustomGraphNode,
  L extends CustomGraphLink,
> = VisSingleContainerProps<{ links: L; nodes: N }> &
VisGraphProps<N, L> & {
  links: L[];
  nodes: N[];
  onBackgroundClick?: (event: MouseEvent) => void;
  onLinkClick?: (link: L, event: MouseEvent, i: number) => void;
  onNodeClick?: (node: N, event: MouseEvent, i: number) => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function CustomGraphComponent<N extends CustomGraphNode, L extends CustomGraphLink> (
  props: CustomGraphProps<N, L>,
  ref: React.Ref<VisGraphRef<N, L> | null>
): ReactElement {
  const graphRef = useRef<VisGraphRef<N, L>>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined)

  const graphD3SelectionRef = useRef<Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const getNodeIcon = useCallback((n: N) => {
    return nodeTypeIconMap.get(n.type as CustomGraphNodeType)
  }, [])

  const getNodeFillColor = useCallback((n: N) => {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as CustomGraphNodeType)
  }, [])

  const data = useMemo(
    () => ({
      nodes: props.nodes,
      links: props.links,
    }),
    [props.nodes, props.links]
  )

  const onRenderComplete = useCallback(
    (
      g: Selection<SVGGElement, unknown, null, undefined>,
      nodes: GraphNode<N, L>[],
      links: GraphLink<N, L>[],
      config: GraphConfigInterface<N, L>,
      duration: number,
      zoomLevel: number
    ): void => {
      graphD3SelectionRef.current = g
      renderSwimlanes(g, nodes)
    },
    []
  )

  const onZoom = useCallback((zoomLevel: number) => {
    if (graphD3SelectionRef.current) {
      updateSwimlanes(graphD3SelectionRef.current)
    }
  }, [])

  const events = useMemo(
    () => ({
      [Graph.selectors.node]: {
        click: (n: N) => {
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

  React.useImperativeHandle(ref, () => graphRef.current)

  const tooltipContent = useCallback((datum: CustomGraphNode): string => {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      Edit <a href="#">Manage</a>
    `
  }, [])

  const triggers = useMemo((): Record<string, (datum: CustomGraphNode) => string> => ({
    [Graph.selectors.node]: (datum: CustomGraphNode) => tooltipContent(datum),
  }), [tooltipContent])

  return (
    <VisSingleContainer
      className={cx(s.exaforceGraph, props.className)}
      svgDefs={nodeSvgDefs}
      data={data}
      height={props.height}
      duration={1000}
    >
      <VisTooltip
        triggers={triggers}
        allowHover={true}
        followCursor={false}
      />
      <VisGraph<N, L>
        ref={graphRef}
        layoutType={'parallel'}
        layoutNodeGroup={useCallback((n: N) => n.type, [])}
        linkArrow={useCallback((l: L) => l.showArrow, [])}
        linkBandWidth={useCallback((l: L) => l.bandWidth, [])}
        linkCurvature={1}
        linkWidth={useCallback((l: L) => l.width, [])}
        nodeFill={getNodeFillColor}
        nodeIcon={getNodeIcon}
        nodeSize={DEFAULT_NODE_SIZE}
        nodeIconSize={DEFAULT_NODE_SIZE}
        nodeLabel={useCallback((n: N) => n.label, [])}
        nodeLabelTrimLength={30}
        nodeStroke={'none'}
        nodeSubLabel={useCallback((n: N) => n.subLabel, [])}
        nodeSubLabelTrimLength={30}
        nodeEnterCustomRenderFunction={nodeEnterCustomRenderFunction}
        nodeUpdateCustomRenderFunction={nodeUpdateCustomRenderFunction}
        onRenderComplete={onRenderComplete}
        nodeSelectionHighlightMode={GraphNodeSelectionHighlightMode.None}
        onZoom={onZoom}
        selectedNodeId={selectedNodeId}
        events={events}
        zoomScaleExtent={useMemo(() => [0.5, 3], [])}
        {...props}
      />
    </VisSingleContainer>
  )
}

export const CustomGraph = React.forwardRef(CustomGraphComponent) as <N extends CustomGraphNode, L extends CustomGraphLink>(
  props: CustomGraphProps<N, L> & { ref?: React.Ref<VisGraphRef<N, L>> }
) => ReactElement
