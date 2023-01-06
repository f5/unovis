import { min, extent } from 'd3-array'
import { Transition } from 'd3-transition'
import { select, Selection, pointer, BaseType } from 'd3-selection'
import { zoom, zoomTransform, zoomIdentity, ZoomTransform, D3ZoomEvent, ZoomBehavior } from 'd3-zoom'
import { drag, D3DragEvent } from 'd3-drag'
import { interval, Timer } from 'd3-timer'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'
import { Spacing } from 'types/spacing'

// Utils
import { isNumber, clamp, find, cloneDeep, flatten, findIndex, clean, unique, shallowDiff, isFunction, getBoolean } from 'utils/data'
import { stringToHtmlId } from 'utils/misc'
import { smartTransition } from 'utils/d3'

// Local Types
import { GraphNode, GraphLink, GraphLayoutType, GraphLinkArrowStyle, GraphPanel } from './types'

// Config
import { GraphConfig, GraphConfigInterface } from './config'

// Styles
import * as generalSelectors from './style'
import * as nodeSelectors from './modules/node/style'
import * as linkSelectors from './modules/link/style'
import * as panelSelectors from './modules/panel/style'

// Modules
import { createNodes, updateNodes, removeNodes, zoomNodesThrottled, zoomNodes, updateSelectedNodes } from './modules/node'
import { getMaxNodeSize, getX, getY } from './modules/node/helper'
import { createLinks, updateLinks, removeLinks, zoomLinksThrottled, zoomLinks, animateLinkFlow, updateSelectedLinks } from './modules/link'
import { LINK_MARKER_WIDTH, LINK_MARKER_HEIGHT, getDoubleArrowPath, getArrowPath, getLinkColor } from './modules/link/helper'
import { createPanels, updatePanels, removePanels } from './modules/panel'
import { setPanelForNodes, updatePanelBBoxSize, updatePanelNumNodes, getMaxPanelPadding } from './modules/panel/helper'
import { applyLayoutCircular, applyLayoutParallel, applyLayoutDagre, applyLayoutConcentric, applyLayoutForce } from './modules/layout'

export class Graph<
  N extends GraphInputNode,
  L extends GraphInputLink,
> extends ComponentCore<
  {nodes: N[]; links?: L[]},
  GraphConfig<N, L>,
  GraphConfigInterface<N, L>
  > {
  static selectors = {
    root: generalSelectors.root,
    background: generalSelectors.background,
    node: nodeSelectors.gNode,
    nodeShape: nodeSelectors.node,
    nodeGauge: nodeSelectors.nodeGauge,
    nodeSideLabel: nodeSelectors.sideLabelGroup,
    nodeLabel: nodeSelectors.label,
    link: linkSelectors.gLink,
    linkLine: linkSelectors.link,
    panel: panelSelectors.gPanel,
    panelRect: panelSelectors.panel,
    panelSelection: panelSelectors.panelSelection,
    panelLabel: panelSelectors.label,
    panelLabelText: panelSelectors.labelText,
    panelSideIcon: panelSelectors.sideIconGroup,
    panelSideIconShape: panelSelectors.sideIconShape,
    panelSideIconSymbol: panelSelectors.sideIconSymbol,
  }

  static nodeSelectors = nodeSelectors
  g: Selection<SVGGElement, unknown, null, undefined>
  config: GraphConfig<N, L> = new GraphConfig()
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>> = new GraphDataModel()
  private _selectedNode: GraphNode<N>
  private _selectedLink: GraphLink<N, L>

  private _graphGroup: Selection<SVGGElement, unknown, SVGGElement, undefined>
  private _panelsGroup: Selection<SVGGElement, unknown, SVGGElement, undefined>
  private _linksGroup: Selection<SVGGElement, unknown, SVGGElement, undefined>
  private _nodesGroup: Selection<SVGGElement, unknown, SVGGElement, undefined>
  private _timer: Timer

  private _firstRender = true
  private _prevWidth: number
  private _prevHeight: number
  private _recalculateLayout = false

  private _fitLayout: boolean
  private _setPanels = false
  private _panels: GraphPanel[]

  private _defs: Selection<SVGDefsElement, unknown, SVGGElement, undefined>
  private _backgroundRect: Selection<SVGRectElement, unknown, SVGGElement, undefined>
  private _zoomBehavior: ZoomBehavior<SVGGElement, unknown>
  private _disableAutoFit = false
  private _scale: number
  private _initialTransform
  private _isDragging = false

  events = {
    [Graph.selectors.background]: {
      click: this._onBackgroundClick.bind(this),
    },
    [Graph.selectors.node]: {
      click: this._onNodeClick.bind(this),
      mouseover: this._onNodeMouseOver.bind(this),
      mouseout: this._onNodeMouseOut.bind(this),
    },
    [Graph.selectors.link]: {
      click: this._onLinkClick.bind(this),
      mouseover: this._onLinkMouseOver.bind(this),
      mouseout: this._onLinkMouseOut.bind(this),
    },
  }

  public get selectedNode (): GraphNode<N> {
    return this._selectedNode
  }

  public get selectedLink (): GraphLink<N, L> {
    return this._selectedLink
  }

  constructor (config?: GraphConfigInterface<N, L>) {
    super()
    if (config) this.config.init(config)

    this._backgroundRect = this.g.append('rect').attr('class', generalSelectors.background)
    this._graphGroup = this.g.append('g').attr('class', generalSelectors.graphGroup)

    this._zoomBehavior = zoom<SVGGElement, unknown>()
      .scaleExtent(this.config.zoomScaleExtent)
      .on('zoom', (e: D3ZoomEvent<SVGGElement, unknown>) => this._onZoom(e.transform, e))

    this._panelsGroup = this._graphGroup.append('g').attr('class', panelSelectors.panels)
    this._linksGroup = this._graphGroup.append('g').attr('class', linkSelectors.links)
    this._nodesGroup = this._graphGroup.append('g').attr('class', nodeSelectors.nodes)

    this._defs = this._graphGroup.append('defs')
  }

  setData (data: {nodes: N[]; links?: L[]}): void {
    const { config } = this

    this.datamodel.nodeSort = config.nodeSort
    this.datamodel.data = data
    this._recalculateLayout = true
    if (config.layoutAutofit) this._fitLayout = true
    this._setPanels = true

    this._addSVGDefs()
  }

  setConfig (config: GraphConfigInterface<N, L>): void {
    this._fitLayout = this._fitLayout || this.config.layoutType !== config.layoutType
    this._recalculateLayout = this._recalculateLayout || this._shouldLayoutRecalculate(config)

    super.setConfig(config)
    this._setPanels = true
  }

  get bleed (): Spacing {
    const { datamodel: { nodes }, config: { nodeSize } } = this
    const maxPanelPadding = getMaxPanelPadding(this._panels)
    const maxNodeSize = getMaxNodeSize(nodes, nodeSize)
    const extra = 20 // Extra padding to take into account labels
    const padding = maxNodeSize * 0.5 + maxPanelPadding + extra
    const panelLabelHeight = this._panels?.length ? 50 : 0

    return { top: padding + panelLabelHeight, bottom: padding, left: padding, right: padding }
  }

  _render (customDuration?: number): void {
    const { config: { disableZoom, duration, layoutAutofit, panels }, datamodel } = this
    if (!datamodel.nodes && !datamodel.links) return
    const animDuration = isNumber(customDuration) ? customDuration : duration

    this._backgroundRect
      .attr('width', this._width)
      .attr('height', this._height)
      .attr('opacity', 0)

    if ((this._prevWidth !== this._width || this._prevHeight !== this._height) && layoutAutofit) {
      // Fit layout on resize
      this._fitLayout = true
      this._prevWidth = this._width
      this._prevHeight = this._height
    }

    // Apply layout and render
    this._calculateLayout().then((isFirstRender) => {
      // If the component has been destroyed while the layout calculation
      // was in progress, we cancel the render
      if (this.isDestroyed()) return

      if (this._setPanels) {
        smartTransition(this._panelsGroup, duration / 2)
          .style('opacity', panels?.length ? 1 : 0)

        this._panels = cloneDeep(panels) as GraphPanel[]
        setPanelForNodes(this._panels, datamodel.nodes, this.config)
        this._setPanels = false
      }

      if (isFirstRender) {
        this._fit()
        this._fitLayout = false
      } else if (this._fitLayout && !this._disableAutoFit) {
        this._fit(duration)
        this._fitLayout = false
      }

      // Draw
      this._drawNodes(animDuration)
      this._drawLinks(animDuration)

      // Select Links / Nodes
      this._resetSelection()
      if (this.config.selectedNodeId) {
        const selectedNode = find(datamodel.nodes, node => node.id === this.config.selectedNodeId)
        this._selectNode(selectedNode)
      }

      if (this.config.selectedLinkId) {
        const selectedLink = find(datamodel.links, link => link.id === this.config.selectedLinkId)
        this._selectLink(selectedLink)
      }

      // Link flow animation timer
      if (!this._timer) {
        const refreshRateMs = 35
        this._timer = interval(this._onLinkFlowTimerFrame.bind(this), refreshRateMs)
      }

      // Zoom
      if (disableZoom) this.g.on('.zoom', null)
      else this.g.call(this._zoomBehavior).on('dblclick.zoom', null)

      if (!this._firstRender && !disableZoom) {
        const transform = zoomTransform(this.g.node())
        this._onZoom(transform)
      }

      // While the graph is animating we disable pointer events on the graph group
      if (animDuration) { this._graphGroup.attr('pointer-events', 'none') }
      smartTransition(this._graphGroup, animDuration)
        .on('end interrupt', () => {
          this._graphGroup.attr('pointer-events', null)
        })

      // We need to set up events and attributes again because the rendering might have been delayed by the layout
      // calculation and they were not set up properly (see the render function of `ComponentCore`)
      this._setUpComponentEventsThrottled()
      this._setCustomAttributesThrottled()
    })


    this._firstRender = false
  }

  private _drawNodes (duration: number): void {
    const { config, datamodel } = this

    const nodes: GraphNode<N>[] = datamodel.nodes
    const nodeGroups = this._nodesGroup
      .selectAll<SVGGElement, GraphNode<N>>(`.${nodeSelectors.gNode}:not(.${nodeSelectors.gNodeExit})`)
      .data(nodes, d => String(d._id))

    const nodeGroupsEnter = nodeGroups.enter().append('g')
      .attr('class', nodeSelectors.gNode)
      .call(createNodes, config, duration)

    const nodeGroupsMerged = nodeGroups.merge(nodeGroupsEnter)
    const nodeUpdateSelection = updateNodes(nodeGroupsMerged, config, duration, this._scale)
    this._drawPanels(nodeUpdateSelection, duration)

    const nodesGroupExit = nodeGroups.exit()
    nodesGroupExit
      .classed(nodeSelectors.gNodeExit, true)
      .call(removeNodes, config, duration)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef = this
    if (!config.disableDrag) {
      const dragBehaviour = drag<SVGGElement, GraphNode<N>>()
        .on('start', function (event, d) { thisRef._onDragStarted(d, event, select(this)) })
        .on('drag', function (event, d) { thisRef._onDragged(d, event, nodeGroupsMerged) })
        .on('end', function (event, d) { thisRef._onDragEnded(d, event, select(this)) })
      nodeGroupsMerged.call(dragBehaviour)
    } else {
      nodeGroupsMerged.on('.drag', null)
    }
  }

  private _drawLinks (duration: number): void {
    const { config, datamodel: { links } } = this

    const linkGroups = this._linksGroup
      .selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.gLink}`)
      .data(links, (d: GraphLink<N, L>) => String(d._id))

    const linkGroupsEnter = linkGroups.enter().append('g')
      .attr('class', linkSelectors.gLink)
      .call(createLinks, config, duration)

    const linkGroupsMerged = linkGroups.merge(linkGroupsEnter)
    linkGroupsMerged.call(updateLinks, config, duration, this._scale)

    const linkGroupsExit = linkGroups.exit()
    linkGroupsExit
      .attr('class', linkSelectors.gLinkExit)
      .call(removeLinks, config, duration)
  }

  private _drawPanels (
    nodeUpdateSelection: Selection<SVGGElement, GraphNode<N>, SVGGElement, unknown> |
    Transition<BaseType, GraphNode<N>, SVGGElement, unknown>,
    duration: number
  ): void {
    const { config } = this
    if (!this._panels) return

    const selection = ((nodeUpdateSelection as Transition<SVGGElement, GraphNode<N>, SVGGElement, unknown>).duration)
      ? (nodeUpdateSelection as Transition<SVGGElement, GraphNode<N>, SVGGElement, unknown>).selection()
      : nodeUpdateSelection as Selection<SVGGElement, GraphNode<N>, SVGGElement, unknown>

    updatePanelNumNodes(selection, this._panels, config)
    updatePanelBBoxSize(selection, this._panels, config)
    const panelData = this._panels.filter(p => p._numNodes)
    const panelGroup = this._panelsGroup
      .selectAll<SVGGElement, GraphPanel>(`.${panelSelectors.gPanel}`)
      .data(panelData, p => p.label)

    const panelGroupExit = panelGroup.exit()
    panelGroupExit.call(removePanels, config, duration)

    const panelGroupEnter = panelGroup.enter().append('g')
      .attr('class', panelSelectors.gPanel)
      .call(createPanels, selection)
    const panelGroupMerged = panelGroup.merge(panelGroupEnter)

    this._updatePanels(panelGroupMerged, duration)
  }

  private _updatePanels (panelToUpdate: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>, duration: number): void {
    const { config } = this
    if (!this._panels) return

    panelToUpdate.call(updatePanels, config, duration)
  }

  private async _calculateLayout (): Promise<boolean> {
    const { config, datamodel } = this

    const firstRender = this._firstRender
    if (this._recalculateLayout) {
      switch (config.layoutType) {
        case GraphLayoutType.Parallel:
          applyLayoutParallel(datamodel, config, this._width, this._height)
          break
        case GraphLayoutType.ParallelHorizontal:
          applyLayoutParallel(datamodel, config, this._width, this._height, 'horizontal')
          break
        case GraphLayoutType.Dagre:
          await applyLayoutDagre(datamodel, config, this._width)
          break
        case GraphLayoutType.Force:
          await applyLayoutForce(datamodel, config, this._width)
          break
        case GraphLayoutType.Concentric:
          applyLayoutConcentric(datamodel, config, this._width, this._height)
          break
        case GraphLayoutType.Circular:
        default:
          applyLayoutCircular(datamodel, config, this._width, this._height)
          break
      }

      this._recalculateLayout = false
    }

    return firstRender
  }

  private _fit (duration = 0): void {
    const { datamodel: { nodes } } = this
    if (nodes?.length && this.g?.size()) {
      const transform = this._getTransform(nodes)
      smartTransition(this.g, duration)
        .call(this._zoomBehavior.transform, transform)
      this._onZoom(transform)
    } else {
      console.warn('Unovis | Graph: Node data is not defined. Check if the component has been initialized.')
    }
  }

  private _getTransform (nodes: GraphNode<N>[]): ZoomTransform {
    const { nodeSize, zoomScaleExtent } = this.config
    const { left, top, right, bottom } = this.bleed

    const maxNodeSize = getMaxNodeSize(nodes, nodeSize)
    const w = this._width
    const h = this._height
    const xExtent = extent(nodes, d => getX(d)) as number[]
    const yExtent = extent(nodes, d => getY(d)) as number[]

    const xScale = w / (xExtent[1] - xExtent[0] + left + right)
    const yScale = h / (yExtent[1] - yExtent[0] + maxNodeSize + top + bottom)

    const clampedScale = clamp(min([xScale, yScale]), zoomScaleExtent[0], zoomScaleExtent[1])

    const xCenter = (xExtent[1] + xExtent[0]) / 2
    const yCenter = (yExtent[1] + yExtent[0] + maxNodeSize) / 2
    const translateX = this._width / 2 - xCenter * clampedScale
    const translateY = this._height / 2 - yCenter * clampedScale
    const transform = zoomIdentity
      .translate(translateX, translateY)
      .scale(clampedScale)

    return transform
  }

  private _selectNode (node: GraphNode<N>): void {
    const { datamodel: { nodes, links } } = this
    if (!node) console.warn('Unovis | Graph: Select Node: Not found')
    this._selectedNode = node

    // Apply grey out
    // Grey out all nodes
    nodes.forEach(n => {
      n._state.selected = false
      n._state.greyout = true
    })

    // Grey out all links
    links.forEach(l => {
      l._state.greyout = true
      l._state.selected = false
    })

    // Highlight selected
    if (node) {
      node._state.selected = true
      node._state.greyout = false

      const connectedLinks = links.filter(l => (l.source === node) || (l.target === node))
      connectedLinks.forEach(l => {
        const source = l.source as GraphNode<N>
        const target = l.target as GraphNode<N>
        source._state.greyout = false
        target._state.greyout = false
        l._state.greyout = false
      })
    }

    this._updateSelectedElements()
  }

  private _selectLink (link: GraphLink<N, L>): void {
    const { datamodel: { nodes, links } } = this
    if (!link) console.warn('Unovis: Graph: Select Link: Not found')
    this._selectedLink = link
    const selectedLinkSource = link?.source as GraphNode<N>
    const selectedLinkTarget = link?.target as GraphNode<N>

    // Apply grey out
    nodes.forEach(n => {
      n._state.selected = false
      n._state.greyout = true
      if (selectedLinkTarget?._id === n._id || selectedLinkSource?._id === n._id) {
        link._state.greyout = false
      }
    })

    links.forEach(l => {
      l._state.greyout = true
      const source = l.source as GraphNode<N>
      const target = l.target as GraphNode<N>
      if ((source._id === selectedLinkSource?._id) && (target._id === selectedLinkTarget?._id)) {
        source._state.greyout = false
        target._state.greyout = false
        l._state.greyout = false
      }
    })

    links.forEach(l => {
      delete l._state.selected
    })

    if (link) link._state.selected = true

    this._updateSelectedElements()
  }

  private _resetSelection (): void {
    const { datamodel: { nodes, links } } = this
    this._selectedNode = undefined
    this._selectedLink = undefined

    // Disable Grayout
    nodes.forEach(n => {
      delete n._state.selected
      delete n._state.greyout
    })
    links.forEach(l => {
      delete l._state.greyout
      delete l._state.selected
    })

    this._updateSelectedElements()
  }

  private _updateSelectedElements (): void {
    const { config } = this

    const linkElements = this._linksGroup.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.gLink}`)
    linkElements.call(updateSelectedLinks, config, this._scale)

    const nodeElements = this._nodesGroup.selectAll<SVGGElement, GraphNode<N>>(`.${nodeSelectors.gNode}`)
    nodeElements.call(updateSelectedNodes, config)

    // this._drawPanels(nodeElements, 0)
  }

  private _onBackgroundClick (): void {
    this._resetSelection()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onNodeClick (d: GraphNode<N>): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onNodeMouseOut (d: GraphNode<N>): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onNodeMouseOver (d: GraphNode<N>): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onLinkClick (d: GraphLink<N, L>): void {
  }

  private _onLinkMouseOver (d: GraphLink<N, L>): void {
    if (this._isDragging) return

    d._state.hovered = true
    this._updateSelectedElements()
  }

  private _onLinkMouseOut (d: GraphLink<N, L>): void {
    if (this._isDragging) return

    delete d._state.hovered
    this._updateSelectedElements()
  }

  private _onLinkFlowTimerFrame (elapsed = 0): void {
    const { config: { linkFlow, linkFlowAnimDuration }, datamodel: { links } } = this

    const hasLinksWithFlow = links.some((d, i) => getBoolean(d, linkFlow, i))
    if (!hasLinksWithFlow) return

    const t = (elapsed % linkFlowAnimDuration) / linkFlowAnimDuration
    const linkElements = this._linksGroup.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.gLink}`)

    const linksToAnimate = linkElements.filter(d => !d._state.greyout)
    linksToAnimate.each(d => { d._state.flowAnimTime = t })
    animateLinkFlow(linksToAnimate, this.config, this._scale)
  }

  private _onZoom (t: ZoomTransform, event?: D3ZoomEvent<SVGGElement, unknown>): void {
    const { config, datamodel: { nodes } } = this
    const transform = t || event.transform
    this._scale = transform.k
    this._graphGroup.attr('transform', transform.toString())
    if (isFunction(config.onZoom)) config.onZoom(this._scale, config.zoomScaleExtent)

    if (!this._initialTransform) this._initialTransform = transform

    // If the event was triggered by a mouse interaction (pan or zoom) we don't
    //   refit the layout after recalculation (e.g. on container resize)
    if (event?.sourceEvent) {
      const diff = Object.keys(transform).reduce((acc, prop) => {
        const val = transform[prop]
        const dVal = Math.abs(val - this._initialTransform[prop])
        return prop === 'k' ? 2 * dVal : dVal / 50
      }, 0)

      if (diff > config.layoutAutofitTolerance) this._disableAutoFit = true
      else this._disableAutoFit = false
    }

    this._nodesGroup.selectAll(`.${nodeSelectors.gNode}`)
      .call(nodes.length > config.zoomThrottledUpdateNodeThreshold ? zoomNodesThrottled : zoomNodes, config, this._scale)
    this._linksGroup.selectAll(`.${linkSelectors.gLink}`)
      .call(nodes.length > config.zoomThrottledUpdateNodeThreshold ? zoomLinksThrottled : zoomLinks, config, this._scale)
  }

  private _onDragStarted (
    d: GraphNode<N>,
    event: D3DragEvent<SVGGElement, GraphNode<N>, unknown>,
    nodeSelection: Selection<SVGGElement, GraphNode<N>, SVGGElement, unknown>
  ): void {
    const { config } = this
    this._isDragging = true
    d._state.isDragged = true
    nodeSelection.call(updateNodes, config, 0, this._scale)
  }

  private _onDragged (
    d: GraphNode<N>,
    event: D3DragEvent<SVGGElement, GraphNode<N>, unknown>,
    allNodesSelection: Selection<SVGGElement, GraphNode<N>, SVGGElement, unknown>
  ): void {
    const { config } = this
    const transform = zoomTransform(this.g.node())
    const scale = transform.k

    // Prevent from dragging outside
    const maxY = (this._height - transform.y) / scale
    const maxX = (this._width - transform.x) / scale
    const minY = -transform.y / scale
    const minX = -transform.x / scale
    let [x, y] = pointer(event, this._graphGroup.node())
    if (y < minY) y = minY
    else if (y > maxY) y = maxY
    if (x < minX) x = minX
    else if (x > maxX) x = maxX

    // Snap to Layout
    if (Math.sqrt(Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2)) < 15) {
      x = d.x
      y = d.y
    }

    const panelNeighbourNodes = flatten(d._panels)
    if (panelNeighbourNodes.length > 0) {
      const prevX = getX(d)
      const prevY = getY(d)
      panelNeighbourNodes.forEach(node => {
        const dx = getX(node) - prevX
        const dy = getY(node) - prevY
        node._state.fx = x + dx
        node._state.fy = y + dy
        if (node._state.fx === node.x) delete node._state.fx
        if (node._state.fy === node.y) delete node._state.fy
      })
    } else {
      d._state.fx = x
      d._state.fy = y
      if (d._state.fx === d.x) delete d._state.fx
      if (d._state.fy === d.y) delete d._state.fy
    }

    const panelNodesToUpdate = allNodesSelection.filter((node: GraphNode<N>) => {
      return node._id === d._id || findIndex(panelNeighbourNodes, (n: GraphNode<N>) => node._id === n._id) !== -1
    })

    panelNodesToUpdate
      .call(updateNodes, config, 0, scale)
      .call(zoomNodes, config, scale)
    const panelToUpdate = this._panelsGroup.selectAll<SVGGElement, GraphPanel>(`.${panelSelectors.gPanel}`)
    updatePanelBBoxSize(panelNodesToUpdate, this._panels, config)
    this._updatePanels(panelToUpdate, 0)

    const nodeElements = this._nodesGroup.selectAll<SVGGElement, GraphNode<N>>(`.${nodeSelectors.gNode}`)
    const nodesToUpdate = nodeElements.filter((n: GraphNode<N>) => n._id === d._id)
    nodesToUpdate.call(updateNodes, config, 0, scale)

    const linkElements = this._linksGroup.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.gLink}`)
    const linksToUpdate = linkElements.filter((l: L) => {
      const source = l.source as GraphNode<N>
      const target = l.target as GraphNode<N>
      return source._id === d._id || target._id === d._id || findIndex(panelNeighbourNodes, (n: GraphNode<N>) => source._id === n._id) !== -1 || findIndex(panelNeighbourNodes, (n: GraphNode<N>) => target._id === n._id) !== -1
    })
    linksToUpdate.call(updateLinks, config, 0, scale)
    const linksToAnimate = linksToUpdate.filter(d => d._state.greyout)
    if (linksToAnimate.size()) animateLinkFlow(linksToAnimate, config, this._scale)
  }

  private _onDragEnded (
    d: GraphNode<N>,
    event: D3DragEvent<SVGGElement, GraphNode<N>, unknown>,
    nodeSelection: Selection<SVGGElement, GraphNode<N>, SVGGElement, unknown>
  ): void {
    const { config } = this
    this._isDragging = false
    d._state.isDragged = false
    nodeSelection.call(updateNodes, config, 0, this._scale)
  }

  private _shouldLayoutRecalculate (nextConfig: GraphConfigInterface<N, L>): boolean {
    const { config } = this
    if (config.layoutType !== nextConfig.layoutType) return true
    if (config.layoutNonConnectedAside !== nextConfig.layoutNonConnectedAside) return true

    if (config.layoutType === GraphLayoutType.Force) {
      const forceSettingsDiff = shallowDiff(config.forceLayoutSettings, nextConfig.forceLayoutSettings)
      if (Object.keys(forceSettingsDiff).length) return true
    }

    if (config.layoutType === GraphLayoutType.Dagre) {
      const dagreSettingsDiff = shallowDiff(config.dagreLayoutSettings, nextConfig.dagreLayoutSettings)
      if (Object.keys(dagreSettingsDiff).length) return true
    }

    if (
      config.layoutType === GraphLayoutType.Parallel ||
      config.layoutType === GraphLayoutType.ParallelHorizontal ||
      config.layoutType === GraphLayoutType.Concentric
    ) {
      if (config.layoutGroupOrder !== nextConfig.layoutGroupOrder) return true
      if (config.layoutParallelNodesPerColumn !== nextConfig.layoutParallelNodesPerColumn) return true
      if (config.layoutParallelSortConnectionsByGroup !== nextConfig.layoutParallelSortConnectionsByGroup) return true
    }

    return false
  }

  private _addSVGDefs (): void {
    const { datamodel: { links } } = this

    // Clean up old defs
    this._defs.selectAll('*').remove()

    // Get all variations of link colors to create markers
    const linkColors = unique(clean(
      links.map(d => getLinkColor(d, this.config))
    ))

    this._defs.selectAll('marker')
      .data([
        ...linkColors.map(d => ({ color: d, arrow: GraphLinkArrowStyle.Single })), // Single-sided arrows
        ...linkColors.map(d => ({ color: d, arrow: GraphLinkArrowStyle.Double })), // Double-sided arrows
      ]).enter()
      .append('marker')
      .attr('id', d => `${stringToHtmlId(d.color)}-${d.arrow}`)
      .attr('orient', 'auto')
      .attr('markerWidth', d => d.arrow === GraphLinkArrowStyle.Double ? LINK_MARKER_WIDTH * 2 : LINK_MARKER_WIDTH)
      .attr('markerHeight', d => d.arrow === GraphLinkArrowStyle.Double ? LINK_MARKER_HEIGHT * 2 : LINK_MARKER_HEIGHT)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('refX', LINK_MARKER_WIDTH - LINK_MARKER_HEIGHT / 2)
      .attr('refY', LINK_MARKER_HEIGHT - LINK_MARKER_HEIGHT / 2)
      .html(d => {
        return `
          <path
            d="${d.arrow === GraphLinkArrowStyle.Double ? getDoubleArrowPath() : getArrowPath()}"
            fill="${d.color ?? null}"
          />
        `
      })
  }

  public zoomIn (increment = 0.3): void {
    const scaleBy = 1 + increment
    smartTransition(this.g, this.config.duration / 2)
      .call(this._zoomBehavior.scaleBy, scaleBy)
  }

  public zoomOut (increment = 0.3): void {
    const scaleBy = 1 - increment
    smartTransition(this.g, this.config.duration / 2)
      .call(this._zoomBehavior.scaleBy, scaleBy)
  }

  public setZoom (zoomLevel: number): void {
    smartTransition(this.g, this.config.duration / 2)
      .call(this._zoomBehavior.scaleTo, zoomLevel)
  }

  public fitView (): void {
    this._fit(this.config.duration / 2)
  }

  /** Enable automatic fitting to container if it was disabled due to previous zoom / pan interactions */
  public resetAutofitState (): void {
    this._disableAutoFit = false
  }

  /** Get current coordinates of the nodes as an array of { id: string; x: number; y: number } objects */
  public getNodesCoordinates (): { id: string; x: number; y: number }[] {
    const { datamodel: { nodes } } = this
    return nodes.map(n => ({
      id: n._id,
      x: n.x,
      y: n.y,
    }))
  }

  /** Get node coordinates by id as { id: string; x: number; y: number } */
  public getNodeCoordinatesById (id: string): { id: string; x: number; y: number } | undefined {
    const { datamodel: { nodes } } = this
    const node = nodes.find(n => n._id === id)

    if (!node) {
      console.warn(`Unovis | Graph: Node ${id} not found`)
      return undefined
    } else {
      return {
        id: node._id,
        x: node.x,
        y: node.y,
      }
    }
  }
}
