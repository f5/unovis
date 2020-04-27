// Copyright (c) Volterra, Inc. All rights reserved.
import { min, extent } from 'd3-array'
import { select, Selection, mouse, event, BaseType } from 'd3-selection'
import { zoom, zoomTransform, zoomIdentity, ZoomTransform } from 'd3-zoom'
import { drag } from 'd3-drag'
import { interval, Timer } from 'd3-timer'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Types
import { Spacing } from 'types/misc'
import { NodeDatumCore, LinkDatumCore, LayoutType, LinkArrow, PanelConfigInterface } from 'types/graph'

// Utils
import { isNumber, clamp, getValue, find, cloneDeep, flatten, findIndex, clean, uniq } from 'utils/data'
import { stringToHtmlId } from 'utils/misc'
import { smartTransition } from 'utils/d3'

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
import { createLinks, updateLinks, removeLinks, zoomLinksThrottled, zoomLinks, animateLinkFlow, updateSelectedLink } from './modules/link'
import { LINK_MARKER_WIDTH, LINK_MARKER_HEIGHT, getDoubleArrowPath, getArrowPath, getLinkColor } from './modules/link/helper'
import { createPanels, updatePanels, removePanels } from './modules/panel'
import { setPanelForNodes, updatePanelData, getMaxPanlePadding } from './modules/panel/helper'
import { applyLayoutCircular, applyLayoutParallel, applyLayoutDagre, applyLayoutConcentric, applyLayoutForce } from './modules/layout'

export class Graph<N extends NodeDatumCore, L extends LinkDatumCore, P extends PanelConfigInterface> extends ComponentCore<{nodes: N[]; links?: L[]}> {
  static selectors = {
    background: generalSelectors.background,
    node: nodeSelectors.node,
    linkSupport: linkSelectors.linkSupport,
  }

  static nodeSelectors = nodeSelectors
  config: GraphConfig<N, L> = new GraphConfig()
  datamodel: GraphDataModel<N, L> = new GraphDataModel()
  private _selectedNode: N;
  private _selectedLink: L;

  private _panelsGroup: Selection<SVGGElement, P[], SVGGElement, P[]>
  private _linksGroup: Selection<SVGGElement, L[], SVGGElement, L[]>
  private _nodesGroup: Selection<SVGGElement, N[], SVGGElement, N[]>
  private _timer: Timer

  private _firstRender = true
  private _prevWidth: number
  private _prevHeight: number
  private _recalculateLayout = false

  private _fitLayout
  private _setPanels = false
  private _panels: P[]

  // private _panelsGroup
  private _defs
  private _backgroundRect
  private _graphContainer
  private _zoomBehavior
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
    [Graph.selectors.linkSupport]: {
      click: this._onLinkClick.bind(this),
      mouseover: this._onLinkMouseOver.bind(this),
      mouseout: this._onLinkMouseOut.bind(this),
    },
  }

  public get selectedNode (): N {
    return this._selectedNode
  }

  public get selectedLink (): L {
    return this._selectedLink
  }

  constructor (config?: GraphConfigInterface<N, L>) {
    super()
    if (config) this.config.init(config)

    this._backgroundRect = this.g.append('rect').attr('class', generalSelectors.background)
    this._graphContainer = this.g.append('g').attr('class', generalSelectors.graphContainer)

    this._zoomBehavior = zoom()
      .scaleExtent(this.config.zoomScaleExtent)
      .on('zoom', this._onZoom.bind(this))

    this._panelsGroup = this._graphContainer.append('g').attr('class', panelSelectors.panels)
    this._linksGroup = this._graphContainer.append('g').attr('class', linkSelectors.links)
    this._nodesGroup = this._graphContainer.append('g').attr('class', nodeSelectors.nodes)

    this._defs = this._graphContainer.append('defs')
  }

  setData (data: GraphDataModel<N, L>): void {
    const { config } = this

    this.datamodel.data = data
    this._recalculateLayout = true
    if (config.layoutAutofit) this._fitLayout = true
    this._setPanels = true

    this._addSVGDefs()
  }

  setConfig (config: GraphConfigInterface<N, L>): void {
    const { datamodel: { links, nodes } } = this
    this._fitLayout = this.config.layoutType !== config.layoutType

    super.setConfig(config)

    this._recalculateLayout = true
    this._setPanels = true

    const selectedNode = this.config.selectedNodeId && find(nodes, node => node.id === this.config.selectedNodeId)
    this._selectNode(selectedNode)

    const selectedLink = this.config.selectedLinkId && find(links, link => link.id === this.config.selectedLinkId)
    this._selectLink(selectedLink)
  }

  get bleed (): Spacing {
    const { datamodel: { nodes }, config: { nodeSize } } = this
    const maxPanelPadding = getMaxPanlePadding(this._panels)
    const maxNodeSize = getMaxNodeSize(nodes, nodeSize)
    const extra = 20 // Extra padding to take into account labels
    const padding = maxNodeSize * 0.5 + maxPanelPadding + extra

    return { top: padding, bottom: padding, left: padding, right: padding }
  }

  _render (customDuration?: number): void {
    const { config: { disableZoom, duration, width, height, layoutAutofit, panels }, datamodel } = this
    if (!datamodel.nodes && !datamodel.links) return
    const animDuration = isNumber(customDuration) ? customDuration : duration

    this._backgroundRect
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)

    if (this._firstRender) {
      this._prevWidth = width
      this._prevHeight = height
    }
    if ((this._prevWidth !== width || this._prevHeight !== height) && layoutAutofit) {
      // Fit layout on resize
      this._fitLayout = true
    }

    // Apply layout
    if (this._recalculateLayout) {
      this._calculateLayout()
      this._recalculateLayout = false
    }

    if (this._setPanels) {
      smartTransition(this._panelsGroup, duration)
        .style('opacity', panels?.length ? 1 : 0)

      this._panels = cloneDeep(panels)
      setPanelForNodes(this._panels, datamodel.nodes, this.config)
      this._setPanels = false
    }

    if (this._firstRender) {
      this._fit()
      this._fitLayout = false
    } else if (this._fitLayout && !this._disableAutoFit) {
      this._fit(duration)
      this._fitLayout = false
    }

    // Draw
    this._drawNodes(animDuration)
    this._drawLinks(animDuration)

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

    // Reset pointer-events
    this._graphContainer.attr('pointer-events', 'none')
    smartTransition(this._graphContainer, animDuration)
      .on('end', () => this._graphContainer.attr('pointer-events', null))

    this._firstRender = false
  }

  _drawNodes (duration: number): void {
    const { config, datamodel: { nodes } } = this

    const nodeGroups = this._nodesGroup
      .selectAll(`.${nodeSelectors.gNode}`)
      .data(nodes, (d: N) => String(d._id))

    const nodeGroupsEnter = nodeGroups.enter().append('g')
      .attr('class', nodeSelectors.gNode)
      .call(createNodes, config, duration)

    const nodeGroupsMerged = nodeGroups.merge(nodeGroupsEnter)
    nodeGroupsMerged.call(updateNodes, config, duration, this._scale, () => this._drawPanels(nodeGroupsMerged, duration))

    const nodesGroupExit: Selection<BaseType, N, SVGGElement, N[]> = nodeGroups.exit()
    nodesGroupExit.call(removeNodes, config, duration)

    if (config.disableDrag) {
      const dragBehaviour = drag<SVGElement, N>()
        .on('start', this._onDragStarted.bind(this))
        .on('drag', d => this._onDragged(d, nodeGroupsMerged))
        .on('end', this._onDragEnded.bind(this))
      nodeGroupsMerged.call(dragBehaviour)
    } else {
      nodeGroupsMerged.on('.drag', null)
    }
  }

  _drawLinks (duration: number): void {
    const { config, datamodel: { links } } = this

    const linkGroups = this._linksGroup
      .selectAll(`.${linkSelectors.gLink}`)
      .data(links, (d: L) => String(d._id))

    const linkGroupsEnter = linkGroups.enter().append('g')
      .attr('class', linkSelectors.gLink)
      .call(createLinks, config, duration)

    const linkGroupsMerged = linkGroups.merge(linkGroupsEnter)
    linkGroupsMerged.call(updateLinks, config, duration, this._scale)

    const linkGroupsExit: Selection<BaseType, L, SVGGElement, L[]> = linkGroups.exit()
    linkGroupsExit.call(removeLinks, config, duration)
  }

  _drawPanels (nodesMerged: Selection<BaseType, N, SVGGElement, N[]>, duration: number): void {
    const { config } = this
    if (!this._panels) return

    updatePanelData(nodesMerged, this._panels, config)
    const panelData = this._panels.filter(p => p._numNodes)

    const panelGroup = this._panelsGroup
      .selectAll(`.${panelSelectors.gPanel}`)
      .data(panelData, (d: P) => d.label)

    const panelGroupEnter = panelGroup.enter().append('g')
      .attr('class', panelSelectors.gPanel)
      .call(createPanels, nodesMerged)

    const panleGroupMerged = panelGroup.merge(panelGroupEnter)
    panleGroupMerged.call(updatePanels, config, duration)

    const panelGroupExit: Selection<BaseType, P, SVGGElement, P[]> = panelGroup.exit()
    panelGroupExit.call(removePanels, config, duration)
  }

  _calculateLayout (): void {
    const { config, datamodel } = this
    switch (config.layoutType) {
    case LayoutType.PARALLEL:
      applyLayoutParallel(datamodel, config)
      break
    case LayoutType.PARALLEL_HORIZONTAL:
      applyLayoutParallel(datamodel, config, 'horizontal')
      break
    case LayoutType.DAGRE:
      applyLayoutDagre(datamodel, config)
      break
    case LayoutType.FORCE:
      applyLayoutForce(datamodel, config)
      break
    case LayoutType.CONCENTRIC:
      applyLayoutConcentric(datamodel, config)
      break
    case LayoutType.CIRCULAR:
    default:
      applyLayoutCircular(datamodel, config)
      break
    }
  }

  _fit (duration = 0): void {
    const { datamodel: { nodes } } = this
    if (nodes) {
      const transform = this._getTransform(nodes)
      smartTransition(this.g, duration)
        .call(this._zoomBehavior.transform, transform)
      this._onZoom(transform)
    } else {
      console.warn('Node data is not defined. Check if the component has been initialized.')
    }
  }

  _getTransform (nodes): ZoomTransform {
    const { nodeSize, width, height, zoomScaleExtent } = this.config
    const { left, top, right, bottom } = this.bleed

    const maxNodeSize = getMaxNodeSize(nodes, nodeSize)
    const w = width - left - right
    const h = height - top - bottom
    const xExtent = extent(nodes, d => getX(d)) as number[]
    const yExtent = extent(nodes, d => getY(d)) as number[]

    const xScale = w / (xExtent[1] - xExtent[0])
    const yScale = h / (yExtent[1] - yExtent[0] + maxNodeSize)

    const clampedScale = clamp(min([xScale, yScale]), zoomScaleExtent[0], zoomScaleExtent[1])

    const xCenter = (xExtent[1] + xExtent[0]) / 2
    const yCenter = (yExtent[1] + yExtent[0] + maxNodeSize) / 2
    const translateX = width / 2 - xCenter * clampedScale
    const translateY = height / 2 - yCenter * clampedScale
    const transform = zoomIdentity
      .translate(translateX, translateY)
      .scale(clampedScale)

    return transform
  }

  _selectNode (node: N): void {
    const { datamodel: { nodes, links } } = this
    if (!node) return
    this._selectedNode = node

    // Apply Greyout
    // Grayout all nodes
    nodes.forEach(n => {
      n._state.selected = false
      n._state.greyout = true
    })

    // Grayout all links
    links.forEach(l => {
      l._state.greyout = true
      l._state.selected = false
    })

    // Highlight selected
    node._state.selected = true
    node._state.greyout = false

    const connectedLinks = links.filter(l => (l.source === node) || (l.target === node))
    connectedLinks.forEach(l => {
      const source = l.source as L
      const target = l.target as L
      source._state.greyout = false
      target._state.greyout = false
      l._state.greyout = false
    })

    this._updateSelectedElements()
  }

  _selectLink (link: L): void {
    const { datamodel: { nodes, links } } = this
    if (!link) return
    this._selectedLink = link
    const selectedLinkSource = link.source as N
    const selectedLinkTarget = link.target as N

    // Apply greyout
    nodes.forEach(n => {
      n._state.selected = false
      n._state.greyout = true
      if (selectedLinkTarget._id === n._id || selectedLinkSource._id === n._id) {
        link._state.greyout = false
      }
    })

    links.forEach(l => {
      l._state.greyout = true
      const source = l.source as N
      const target = l.target as N
      if ((source._id === selectedLinkSource._id) && (target._id === selectedLinkTarget._id)) {
        source._state.greyout = false
        target._state.greyout = false
        l._state.greyout = false
      }
    })

    links.forEach(l => {
      delete l._state.selected
    })

    link._state.selected = true

    this._updateSelectedElements()
  }

  _resetSelection (): void {
    const { datamodel: { nodes, links } } = this
    this._selectedNode = undefined
    this._selectedLink = undefined

    // Disable Greyout
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

  _updateSelectedElements (): void {
    const { config } = this

    const linkElements: Selection<SVGGElement, L, SVGGElement, L[]> = this._linksGroup.selectAll(`.${linkSelectors.gLink}`)
    linkElements.call(updateSelectedLink, config, 0, this._scale)

    const nodeElements: Selection<SVGGElement, N, SVGGElement, N[]> = this._nodesGroup.selectAll(`.${nodeSelectors.gNode}`)
    nodeElements.call(updateSelectedNodes, config)

    this._drawPanels(nodeElements, 0)
  }

  _onBackgroundClick (d, i, elements): void {
    this._resetSelection()
  }

  _onNodeClick (d, i, elements): void {
    this._selectNode(d)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onNodeMouseOut (d, i, elements): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onNodeMouseOver (d, i, elements): void {
  }

  _onLinkClick (d, i, elements): void {
    this._selectLink(d)
  }

  _onLinkMouseOver (d, i, elements): void {
    if (this._isDragging) return

    d._state.hovered = true
    this._updateSelectedElements()
  }

  _onLinkMouseOut (d, i, elements): void {
    if (this._isDragging) return

    delete d._state.hovered
    this._updateSelectedElements()
  }

  _onLinkFlowTimerFrame (elapsed = 0): void {
    const { config: { linkFlow, flowAnimDuration }, datamodel: { links } } = this
    // this._elapsed = elapsed

    const hasLinksWithFlow = links.some(d => getValue(d, linkFlow))
    if (!hasLinksWithFlow) return
    const t = (elapsed % flowAnimDuration) / flowAnimDuration
    const linkElements: Selection<SVGGElement, L, SVGGElement, L[]> = this._linksGroup.selectAll(`.${linkSelectors.gLink}`)
    const linksToAnimate = linkElements.filter(d => !d._state.greyout)
    linksToAnimate.each(d => { d._state.flowAnimTime = t })
    animateLinkFlow(linksToAnimate, this.config, this._scale)
  }

  _onZoom (t): void {
    const { config, datamodel: { nodes } } = this
    const transform = t || event.transform
    this._scale = transform.k
    this._graphContainer.attr('transform', transform)

    if (!this._initialTransform) this._initialTransform = transform

    // If the event was triggered by a mouse interaction (pan or zoom) we don't
    //   refit the layout after recalculation (eg. on contianar resize)
    if (event && event.sourceEvent) {
      const diff = Object.keys(transform).reduce((acc, prop) => {
        const val = transform[prop]
        const dVal = Math.abs(val - this._initialTransform[prop])
        return prop === 'k' ? 2 * dVal : dVal / 50
      }, 0)

      const diffTolerance = 2.5
      if (diff > diffTolerance) this._disableAutoFit = true
      else this._disableAutoFit = false
    }

    this._nodesGroup.selectAll(`.${nodeSelectors.gNode}`)
      .call(nodes.length > config.zoomThrottledUpdateNodeThreshold ? zoomNodesThrottled : zoomNodes, config, this._scale)
    this._linksGroup.selectAll(`.${linkSelectors.gLink}`)
      .call(nodes.length > config.zoomThrottledUpdateNodeThreshold ? zoomLinksThrottled : zoomLinks, config, this._scale)
  }

  _onDragStarted (d, i, elements): void {
    const { config } = this
    this._isDragging = true
    d._state.isDragged = true
    const node = select(elements[i])
    node.call(updateNodes, config, 0, this._scale)
  }

  _onDragged (d: N, selection): void {
    const { config } = this
    const transform = zoomTransform(this.g.node())
    const scale = transform.k

    // Prevent from dragging outside
    const maxY = (config.height - transform.y) / scale
    const maxX = (config.width - transform.x) / scale
    const minY = -transform.y / scale
    const minX = -transform.x / scale
    let [x, y] = mouse(this._graphContainer.node())
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

    const panelNodesToUpdate = selection.filter((node: N) => {
      return node._id === d._id || findIndex(panelNeighbourNodes, (n: N) => node._id === n._id) !== -1
    })

    panelNodesToUpdate
      .call(updateNodes, config, 0, scale, () => {
        updatePanelData(panelNodesToUpdate, this._panels, config)
        const panelToUpdate: Selection<SVGGElement, P, SVGGElement, P[]> = this._panelsGroup.selectAll(`.${panelSelectors.gPanel}`)
        panelToUpdate.call(updatePanels, config, 0)
      })
      .call(zoomNodes, config, scale)
    const nodeElements: Selection<SVGGElement, N, SVGGElement, N[]> = this._nodesGroup.selectAll(`.${nodeSelectors.gNode}`)
    const nodesToUpdate = nodeElements.filter((n: N) => {
      return n._id === d._id
    })
    nodesToUpdate.call(updateNodes, config, 0, scale)

    const linkElements: Selection<SVGGElement, L, SVGGElement, L[]> = this._linksGroup.selectAll(`.${linkSelectors.gLink}`)
    const linksToUpdate = linkElements.filter((l: L) => {
      const source = l.source as N
      const target = l.target as N
      return source._id === d._id || target._id === d._id || findIndex(panelNeighbourNodes, (n: N) => source._id === n._id) !== -1 || findIndex(panelNeighbourNodes, (n: N) => target._id === n._id) !== -1
    })
    linksToUpdate.call(updateLinks, config, 0, scale)
    const linksToAnimate = linksToUpdate.filter(d => d._state.greyout)
    if (linksToAnimate.size()) animateLinkFlow(linksToAnimate, config, this._scale)

    // if (this._timer && this._elapsed) {
    //   this._onTimerFrame(this._elapsed)
    // }
  }

  _onDragEnded (d: N, i: number, elements: Selection<SVGGElement, L, SVGGElement, L[]>): void {
    const { config } = this
    this._isDragging = false
    d._state.isDragged = false
    const node = select(elements[i])
    node.call(updateNodes, config, 0, this._scale)
  }

  _addSVGDefs (): void {
    const { datamodel: { links } } = this

    // Clean up old defs
    this._defs.selectAll('*').remove()

    // Get all variations of link colors to create markers
    const linkColors = uniq(clean(
      links.map(d => getLinkColor(d, this.config))
    ))

    this._defs.selectAll('marker')
      .data([
        ...linkColors.map(d => ({ color: d, arrow: LinkArrow.SINGLE })), // Single-sided arrows
        ...linkColors.map(d => ({ color: d, arrow: LinkArrow.DOUBLE })), // Double-sided arrows
      ]).enter()
      .append('marker')
      .attr('id', d => `${stringToHtmlId(d.color)}-${d.arrow}`)
      .attr('orient', 'auto')
      .attr('markerWidth', d => d.arrow === LinkArrow.DOUBLE ? LINK_MARKER_WIDTH * 2 : LINK_MARKER_WIDTH)
      .attr('markerHeight', d => d.arrow === LinkArrow.DOUBLE ? LINK_MARKER_HEIGHT * 2 : LINK_MARKER_HEIGHT)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('refX', LINK_MARKER_WIDTH - LINK_MARKER_HEIGHT / 2)
      .attr('refY', LINK_MARKER_HEIGHT - LINK_MARKER_HEIGHT / 2)
      .html(d => {
        return `
          <path
            d="${d.arrow === LinkArrow.DOUBLE ? getDoubleArrowPath() : getArrowPath()}"
            fill="${d.color ?? null}"
          />
        `
      })
  }
}
