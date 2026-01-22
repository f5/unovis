import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { Selection } from 'd3-selection'
import { GraphNode, Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
import { VisGraphComponent } from '@unovis/angular'
import {
  globalControlsContainer,
  customNodesGraph,
  graphButton,
  nodeEnterCustomRenderFunction,
  nodeUpdateCustomRenderFunction,
  renderSwimlanes,
  updateSwimlanes,
} from './constants'
import { nodeTypeColorMap, CustomGraphNodeType, CustomGraphLink, CustomGraphNode, data, DEFAULT_NODE_SIZE } from './data'


@Component({
  selector: 'custom-nodes-graph',
  templateUrl: './custom-nodes-graph.component.html',
  styleUrls: ['./styles.css'],
  standalone: false,
})
export class CustomNodesGraphComponent {
  @ViewChild('graphRef', { static: false }) graphRef!: VisGraphComponent<CustomGraphNode, CustomGraphLink>

  selectedNodeId: string | undefined = undefined
  showLinkFlow = true
  tooltipFollowCursor = true
  tooltipAllowHover = true
  nodeEnterCustomRenderFunction = nodeEnterCustomRenderFunction
  nodeUpdateCustomRenderFunction = nodeUpdateCustomRenderFunction
  globalControlsContainerCls = globalControlsContainer
  customNodesGraphCls = customNodesGraph
  graphButtonCls = graphButton
  nodeSelectionHighlightMode = GraphNodeSelectionHighlightMode.None

  private graphD3SelectionRef: Selection<SVGGElement, unknown, null, undefined> | null = null

  data = data

  // Configuration objects
  events: Record<string, Record<string, (n: CustomGraphNode) => void>>
  triggers: Record<string, (datum: CustomGraphNode) => string>
  fitViewPadding = { top: 50, right: 50, bottom: 100, left: 50 }
  zoomScaleExtent = [0.5, 3]

  constructor (private cdr: ChangeDetectorRef) {
    this.events = {
      [Graph.selectors.node]: {
        click: (n: CustomGraphNode) => {
          this.selectedNodeId = n.id
          this.cdr.detectChanges()
        },
      },
      [Graph.selectors.background]: {
        click: () => {
          this.selectedNodeId = undefined
          this.cdr.detectChanges()
        },
      },
    }

    this.triggers = {
      [Graph.selectors.node]: (datum: CustomGraphNode) => this.tooltipContent(datum),
    }
  }

  getNodeFillColor = (n: CustomGraphNode): string | undefined => {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as CustomGraphNodeType)
  }

  onRenderComplete = (
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void => {
    this.graphD3SelectionRef = g
    renderSwimlanes(g, nodes)
  }

  onZoom = (): void => {
    if (this.graphD3SelectionRef) {
      updateSwimlanes(this.graphD3SelectionRef)
    }
  }

  tooltipContent = (datum: CustomGraphNode): string => {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      ${this.tooltipAllowHover ? 'Visit <a href="#">website</a>' : ''}
    `
  }

  tooltipTriggers = {
    [Graph.selectors.node]: (datum: CustomGraphNode): string => this.tooltipContent(datum),
  }

  onLayoutCalculated = (nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]): void => {
    nodes[0].x = 100
  }

  handleLinkFlow = (l: CustomGraphLink): boolean => {
    return (this.showLinkFlow && l.showFlow) || false
  }

  handleLinkFlowAnimDuration = (l: CustomGraphLink): number | undefined => {
    return l?.linkFlowAnimDuration || undefined
  }

  handleLinkFlowParticleSpeed = (l: CustomGraphLink): number | undefined => {
    return l?.linkFlowParticleSpeed
  }

  handleLinkFlowParticleSize = (l: CustomGraphLink): number | undefined => {
    return l?.linkFlowParticleSize
  }

  layoutNodeGroup = (n: CustomGraphNode): any => n.type

  linkArrow = (l: CustomGraphLink): boolean | undefined => l.showArrow

  linkBandWidth = (l: CustomGraphLink): number => 2 * (l.linkFlowParticleSize ?? 1)

  linkWidth = (l: CustomGraphLink): number | undefined => l.width

  nodeLabel = (n: CustomGraphNode): string => n.label || ''

  nodeSubLabel = (n: CustomGraphNode): string | undefined => n.subLabel

  nodeSize = DEFAULT_NODE_SIZE

  onShowLinkFlowChange (event: Event): void {
    const target = event.target as HTMLInputElement
    this.showLinkFlow = target.checked
  }

  onTooltipFollowCursorChange (event: Event): void {
    const target = event.target as HTMLInputElement
    this.tooltipFollowCursor = target.checked
  }

  onTooltipAllowHoverChange (event: Event): void {
    const target = event.target as HTMLInputElement
    this.tooltipAllowHover = target.checked
  }

  fitView (nodeIds?: string[]): void {
    this.graphRef?.component?.fitView(undefined, nodeIds)
  }

  zoomToIdentityAndNetwork (): void {
    this.fitView(['0', '1', '2', '3'])
  }

  fitGraph (): void {
    this.fitView()
  }
}
