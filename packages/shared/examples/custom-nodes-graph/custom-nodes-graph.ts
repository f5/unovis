import { SingleContainer, Graph, GraphNode, GraphNodeSelectionHighlightMode, Tooltip, GraphInputData } from '@unovis/ts'
import { Selection } from 'd3-selection'
import { data, DEFAULT_NODE_SIZE, nodeTypeColorMap, CustomGraphNodeType, CustomGraphLink, CustomGraphNode } from './data'
import {
  globalControlsContainer,
  customNodesGraph,
  nodeEnterCustomRenderFunction,
  nodeUpdateCustomRenderFunction,
  renderSwimlanes,
  updateSwimlanes,
} from './constants'

class CustomNodesGraphExample {
  private container!: SingleContainer<GraphInputData<CustomGraphNode, CustomGraphLink>>
  private graph!: Graph<CustomGraphNode, CustomGraphLink>
  private tooltip!: Tooltip
  private selectedNodeId: string | undefined
  private graphD3SelectionRef: Selection<SVGGElement, unknown, null, undefined> | null = null
  private showLinkFlow = true
  private tooltipFollowCursor = true
  private tooltipAllowHover = true

  constructor (containerElement: HTMLElement) {
    this.initializeComponents(containerElement)
    this.setupEventListeners(containerElement)
    this.render()
  }

  private initializeComponents (containerElement: HTMLElement): void {
    this.tooltip = new Tooltip({
      followCursor: this.tooltipFollowCursor,
      allowHover: this.tooltipAllowHover,
      triggers: {
        [Graph.selectors.node]: (datum: CustomGraphNode) => this.getTooltipContent(datum),
      },
    })

    // Initialize graph
    this.graph = new Graph<CustomGraphNode, CustomGraphLink>({
      layoutType: 'parallel',
      layoutNodeGroup: (n: CustomGraphNode) => n.type,
      linkArrow: (l: CustomGraphLink) => l.showArrow,
      linkBandWidth: (l: CustomGraphLink) => 2 * (l.linkFlowParticleSize ?? 1),
      linkCurvature: 1,
      linkWidth: (l: CustomGraphLink) => l.width,
      nodeFill: this.getNodeFillColor.bind(this),
      nodeSize: DEFAULT_NODE_SIZE,
      nodeIconSize: DEFAULT_NODE_SIZE,
      nodeLabel: (n: CustomGraphNode) => n.label,
      nodeLabelTrimLength: 30,
      nodeStroke: 'none',
      nodeSubLabel: (n: CustomGraphNode) => n.subLabel,
      nodeSubLabelTrimLength: 30,
      nodeEnterCustomRenderFunction,
      nodeUpdateCustomRenderFunction,
      nodeSelectionHighlightMode: GraphNodeSelectionHighlightMode.None,
      linkFlow: this.handleLinkFlow.bind(this),
      linkFlowAnimDuration: (l: CustomGraphLink) => l.linkFlowAnimDuration,
      linkFlowParticleSpeed: (l: CustomGraphLink) => l.linkFlowParticleSpeed,
      linkFlowParticleSize: (l: CustomGraphLink) => l.linkFlowParticleSize,
      fitViewPadding: { top: 50, right: 50, bottom: 100, left: 50 },
      zoomScaleExtent: [0.5, 3],
      onRenderComplete: this.onRenderComplete.bind(this),
      onZoom: this.onZoom.bind(this),
      onLayoutCalculated: this.onLayoutCalculated.bind(this),
      events: {
        [Graph.selectors.node]: {
          click: (n: CustomGraphNode) => {
            this.selectedNodeId = n.id
            this.graph.setConfig({ selectedNodeId: this.selectedNodeId })
          },
        },
        [Graph.selectors.background]: {
          click: () => {
            this.selectedNodeId = undefined
            this.graph.setConfig({ selectedNodeId: this.selectedNodeId })
          },
        },
      },
    })

    // Initialize container
    this.container = new SingleContainer(containerElement, {
      component: this.graph,
      height: '50vh',
      duration: 1000,
    }, data)

    this.container.element.classList.add(customNodesGraph)
  }

  private setupEventListeners (containerElement: HTMLElement): void {
    const mainDiv = document.createElement('div')
    mainDiv.className = globalControlsContainer
    containerElement.appendChild(mainDiv)
    const showLinkFlowCheckbox = document.createElement('input') as HTMLInputElement
    showLinkFlowCheckbox.type = 'checkbox'
    showLinkFlowCheckbox.id = 'showLinkFlow'

    const showLinkFlowLabel = document.createElement('label') as HTMLLabelElement
    showLinkFlowLabel.htmlFor = 'showLinkFlow'
    showLinkFlowLabel.textContent = 'showLinkFlow'

    const tooltipFollowCursorCheckbox = document.createElement('input') as HTMLInputElement
    tooltipFollowCursorCheckbox.type = 'checkbox'
    tooltipFollowCursorCheckbox.id = 'tooltipFollowCursor'

    const tooltipFollowCursorLabel = document.createElement('label') as HTMLLabelElement
    tooltipFollowCursorLabel.htmlFor = 'tooltipFollowCursor'
    tooltipFollowCursorLabel.textContent = 'tooltipFollowCursor'

    const tooltipAllowHoverCheckbox = document.createElement('input') as HTMLInputElement
    tooltipAllowHoverCheckbox.type = 'checkbox'
    tooltipAllowHoverCheckbox.id = 'tooltipAllowHover'

    const tooltipAllowHoverLabel = document.createElement('label') as HTMLLabelElement
    tooltipAllowHoverLabel.htmlFor = 'tooltipAllowHover'
    tooltipAllowHoverLabel.textContent = 'tooltipAllowHover'

    const zoomToNodesButton = document.createElement('button') as HTMLButtonElement
    zoomToNodesButton.id = 'zoomToNodes'
    zoomToNodesButton.textContent = 'Zoom to Nodes'

    const fitGraphButton = document.createElement('button') as HTMLButtonElement
    fitGraphButton.id = 'fitGraph'
    fitGraphButton.textContent = 'Fit Graph'

    // append elements
    mainDiv.appendChild(showLinkFlowCheckbox)
    mainDiv.appendChild(showLinkFlowLabel)
    mainDiv.appendChild(tooltipFollowCursorCheckbox)
    mainDiv.appendChild(tooltipFollowCursorLabel)
    mainDiv.appendChild(tooltipAllowHoverCheckbox)
    mainDiv.appendChild(tooltipAllowHoverLabel)
    mainDiv.appendChild(zoomToNodesButton)
    mainDiv.appendChild(fitGraphButton)

    showLinkFlowCheckbox?.addEventListener('change', (e) => {
      this.showLinkFlow = (e.target as HTMLInputElement).checked
      this.graph.setConfig({ linkFlow: this.handleLinkFlow.bind(this) })
    })

    tooltipFollowCursorCheckbox?.addEventListener('change', (e) => {
      this.tooltipFollowCursor = (e.target as HTMLInputElement).checked
      this.tooltip.setConfig({ followCursor: this.tooltipFollowCursor })
    })

    tooltipAllowHoverCheckbox?.addEventListener('change', (e) => {
      this.tooltipAllowHover = (e.target as HTMLInputElement).checked
      this.tooltip.setConfig({
        allowHover: this.tooltipAllowHover,
        triggers: {
          [Graph.selectors.node]: (datum: CustomGraphNode) => this.getTooltipContent(datum),
        },
      })
    })

    zoomToNodesButton?.addEventListener('click', () => {
      this.fitView(['0', '1', '2', '3'])
    })

    fitGraphButton?.addEventListener('click', () => {
      this.fitView()
    })
  }

  private getNodeFillColor (n: CustomGraphNode): string | undefined {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as CustomGraphNodeType)
  }

  private onRenderComplete (
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
  ): void {
    this.graphD3SelectionRef = g
    renderSwimlanes(g, nodes)
  }

  private onZoom (): void {
    if (this.graphD3SelectionRef) {
      updateSwimlanes(this.graphD3SelectionRef)
    }
  }

  private onLayoutCalculated (nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]): void {
    if (nodes.length > 0) {
      nodes[0].x = 100
    }
  }

  private getTooltipContent (datum: CustomGraphNode): string {
    return `
      <strong>${datum.label}</strong><br/>
      Type: ${datum.type}<br/>
      ${this.tooltipAllowHover ? 'Visit <a href="#">website</a>' : ''}
    `
  }

  private handleLinkFlow (l: CustomGraphLink): boolean {
    return (this.showLinkFlow && l.showFlow) || false
  }

  private fitView (nodeIds?: string[]): void {
    this.graph.fitView(undefined, nodeIds)
  }

  public render (): void {
    this.container.render()
  }

  public destroy (): void {
    this.container.destroy()
  }
}

const containerElement: HTMLElement | null = document.getElementById('vis-container')
const customNodesGraphExample = new CustomNodesGraphExample(containerElement as HTMLElement)
