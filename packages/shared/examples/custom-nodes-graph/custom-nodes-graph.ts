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
  private selectedNodeId: string | undefined
  private graphD3SelectionRef: Selection<SVGGElement, unknown, null, undefined> | null = null
  private showLinkFlow = true
  private tooltipFollowCursor = true
  private tooltipAllowHover = true

  constructor (containerElement: HTMLElement) {
    this.initializeComponents(containerElement)
    this.render()
  }

  getConfig (): any {
    return {
      component: this.graph,
      height: '50vh',
      duration: 1000,
      tooltip: new Tooltip({
        followCursor: this.tooltipFollowCursor,
        allowHover: this.tooltipAllowHover,
        triggers: {
          [Graph.selectors.node]: (datum: CustomGraphNode) => this.getTooltipContent(datum),
        },
      }),
    }
  }

  private initializeComponents (containerElement: HTMLElement): void {
    const mainWrapperDiv = document.createElement('div')
    containerElement.appendChild(mainWrapperDiv)
    this.setupEventListeners(mainWrapperDiv)


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
      selectedNodeId: this.selectedNodeId,
      events: {
        [Graph.selectors.node]: {
          click: (n: CustomGraphNode) => {
            this.selectedNodeId = n.id
          },
        },
        [Graph.selectors.background]: {
          click: () => {
            this.selectedNodeId = undefined
          },
        },
      },
    })

    // Initialize container
    this.container = new SingleContainer(mainWrapperDiv, this.getConfig(), data)

    this.container.element.classList.add(customNodesGraph)
  }

  private setupEventListeners (containerElement: HTMLElement): void {
    const globalControlsDiv = document.createElement('div')
    globalControlsDiv.className = globalControlsContainer
    containerElement.appendChild(globalControlsDiv)

    const tooltipFollowCursorCheckbox = document.createElement('input') as HTMLInputElement
    tooltipFollowCursorCheckbox.type = 'checkbox'
    tooltipFollowCursorCheckbox.id = 'tooltipFollowCursor'
    tooltipFollowCursorCheckbox.checked = true

    const tooltipFollowCursorLabel = document.createElement('label') as HTMLLabelElement
    tooltipFollowCursorLabel.htmlFor = 'tooltipFollowCursor'
    tooltipFollowCursorLabel.textContent = 'tooltipFollowCursor'

    const tooltipAllowHoverCheckbox = document.createElement('input') as HTMLInputElement
    tooltipAllowHoverCheckbox.type = 'checkbox'
    tooltipAllowHoverCheckbox.id = 'tooltipAllowHover'
    tooltipAllowHoverCheckbox.checked = true

    const tooltipAllowHoverLabel = document.createElement('label') as HTMLLabelElement
    tooltipAllowHoverLabel.htmlFor = 'tooltipAllowHover'
    tooltipAllowHoverLabel.textContent = 'tooltipAllowHover'

    const zoomToNodesButton = document.createElement('button') as HTMLButtonElement
    zoomToNodesButton.id = 'zoomToNodes'
    zoomToNodesButton.textContent = 'Zoom To Identity and Network Nodes'

    const fitGraphButton = document.createElement('button') as HTMLButtonElement
    fitGraphButton.id = 'fitGraph'
    fitGraphButton.textContent = 'Fit Graph'

    // append elements
    globalControlsDiv.appendChild(tooltipFollowCursorCheckbox)
    globalControlsDiv.appendChild(tooltipFollowCursorLabel)
    globalControlsDiv.appendChild(tooltipAllowHoverCheckbox)
    globalControlsDiv.appendChild(tooltipAllowHoverLabel)
    globalControlsDiv.appendChild(zoomToNodesButton)
    globalControlsDiv.appendChild(fitGraphButton)

    tooltipFollowCursorCheckbox?.addEventListener('change', (e) => {
      this.tooltipFollowCursor = (e.target as HTMLInputElement).checked
      this.container.updateContainer(this.getConfig())
    })

    tooltipAllowHoverCheckbox?.addEventListener('change', (e) => {
      this.tooltipAllowHover = (e.target as HTMLInputElement).checked
      this.container.updateContainer(this.getConfig())
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
