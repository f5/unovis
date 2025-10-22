import { select, Selection, pointer } from 'd3-selection'
import { zoom, D3ZoomEvent, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom'
import { sankey, SankeyGraph } from 'd3-sankey'
import { extent, max, min, sum } from 'd3-array'
import { scaleLinear } from 'd3-scale'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Types
import { ExtendedSizeComponent, Sizing } from 'types/component'
import { Position } from 'types/position'
import { Spacing } from 'types/spacing'
import { VerticalAlign } from 'types/text'

// Utils
import { smartTransition } from 'utils/d3'
import { clamp, getNumber, getString, groupBy, isNumber } from 'utils/data'

// Config
import { SankeyDefaultConfig, SankeyConfigInterface } from './config'

// Styles
import * as s from './style'

// Local Types
import { SankeyInputLink, SankeyInputNode, SankeyLayout, SankeyLink, SankeyNode, SankeyZoomMode } from './types'

// Modules
import { createLinks, removeLinks, updateLinks } from './modules/link'
import { createNodes, NODE_SELECTION_RECT_DELTA, onNodeMouseOut, onNodeMouseOver, removeNodes, updateNodes } from './modules/node'
import {
  estimateRequiredLabelWidth,
  getLabelFontSize,
  getLabelOrientation,
  getSubLabelFontSize,
  SANKEY_LABEL_BLOCK_PADDING,
  SANKEY_LABEL_SPACING,
} from './modules/label'

export class Sankey<
  N extends SankeyInputNode,
  L extends SankeyInputLink,
> extends ComponentCore<
  {nodes: N[]; links?: L[]},
  SankeyConfigInterface<N, L>
  > implements ExtendedSizeComponent {
  static selectors = s
  protected _defaultConfig = SankeyDefaultConfig as SankeyConfigInterface<N, L>
  public config: SankeyConfigInterface<N, L> = this._defaultConfig
  datamodel: GraphDataModel<N, L, SankeyNode<N, L>, SankeyLink<N, L>> = new GraphDataModel()
  public g: Selection<SVGGElement, unknown, null, undefined>
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _gNode: SVGGElement & { __zoom: ZoomTransform }
  private _prevWidth: number | undefined = undefined
  private _extendedWidth: number | undefined = undefined
  private _extendedHeight: number | undefined = undefined
  private _extendedHeightIncreased: number | undefined = undefined
  private _extendedWidthIncreased: number | undefined = undefined
  private _linksGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _nodesGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _backgroundRect: Selection<SVGRectElement, unknown, SVGGElement, unknown>
  private _sankey = sankey<SankeyGraph<N, L>, SankeyNode<N, L>, SankeyLink<N, L>>()
  private _highlightTimeoutId: ReturnType<typeof setTimeout> | null = null
  private _highlightActive = false

  // Zoom / Pan
  private _zoomScale = [1, 1] as [number, number]
  private _pan = [0, 0] as [number, number]
  private _zoomBehavior: ZoomBehavior<SVGGElement, unknown>
  private _prevZoomTransform: { x: number; y: number; k: number } = { x: 0, y: 0, k: 1 }
  private _animationFrameId: number | null = null
  private _bleedCached: Spacing | null = null

  // Events
  events = {
    [Sankey.selectors.nodeGroup]: {
      mouseenter: this._onNodeMouseOver.bind(this),
      mouseleave: this._onNodeMouseOut.bind(this),
    },
    [Sankey.selectors.node]: {
      mouseenter: this._onNodeRectMouseOver.bind(this),
      mouseleave: this._onNodeRectMouseOut.bind(this),
      click: this._onNodeClick.bind(this),
    },
    [Sankey.selectors.link]: {
      mouseenter: this._onLinkMouseOver.bind(this),
      mouseleave: this._onLinkMouseOut.bind(this),
    },
  }

  constructor (config?: SankeyConfigInterface<N, L>) {
    super()
    if (config) this.setConfig(config)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this._gNode = this.g.node() as (SVGGElement & { __zoom: ZoomTransform })
    this._backgroundRect = this.g.append('rect').attr('class', s.background).style('pointer-events', 'all')
    this._linksGroup = this.g.append('g').attr('class', s.links)
    this._nodesGroup = this.g.append('g').attr('class', s.nodes)

    // Initialize scale values from config
    this._zoomScale = this.config.zoomScale ?? [1, 1]

    // Set up d3-zoom to handle wheel/pinch/drag smoothly
    this._zoomBehavior = zoom<SVGGElement, unknown>()
      .scaleExtent(this.config.zoomExtent)
      .on('zoom', (event: D3ZoomEvent<SVGGElement, unknown>) => this._onZoom(event))

    if (this.config.enableZoom) this.g.call(this._zoomBehavior)
  }

  get bleed (): Spacing {
    const { config, datamodel: { nodes, links } } = this
    let bleed: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }

    if (nodes.length) {
      const labelFontSize = getLabelFontSize(config, this.element as SVGElement)
      const subLabelFontSize = getSubLabelFontSize(config, this.element as SVGElement)

      // We pre-calculate sankey layout to get information about node labels placement and calculate bleed properly
      // Potentially it can be a performance bottleneck for large layouts, but generally rendering of such layouts is much more computationally heavy
      const sankeyProbeSize = 1000
      this._populateLinkAndNodeValues()
      this._sankey.size([sankeyProbeSize, sankeyProbeSize])
      this._sankey({ nodes, links })
      const requiredLabelHeight = labelFontSize * 2.5 + 2 * SANKEY_LABEL_BLOCK_PADDING // Assuming 2.5 lines per label

      const maxLayer = max(nodes, d => d.layer)
      const zeroLayerNodes = nodes.filter(d => d.layer === 0)
      const maxLayerNodes = nodes.filter(d => d.layer === maxLayer)
      const layerSpacing = this._getLayerSpacing(nodes)

      let left = 0
      const fallbackLabelMaxWidth = Math.min(this._width / 6, layerSpacing)
      const labelMaxWidth = config.labelMaxWidth || fallbackLabelMaxWidth
      const labelHorizontalPadding = 2 * SANKEY_LABEL_SPACING + 2 * SANKEY_LABEL_BLOCK_PADDING
      const hasLabelsOnTheLeft = zeroLayerNodes.some(d => getLabelOrientation(d, sankeyProbeSize, config.labelPosition) === Position.Left)

      if (hasLabelsOnTheLeft) {
        const maxLeftLabelWidth = max(zeroLayerNodes, d => estimateRequiredLabelWidth(d, config, labelFontSize, subLabelFontSize))
        left = min([labelMaxWidth, maxLeftLabelWidth]) + labelHorizontalPadding
      }

      let right = 0
      const hasLabelsOnTheRight = maxLayerNodes.some(d => getLabelOrientation(d, sankeyProbeSize, config.labelPosition) === Position.Right)
      if (hasLabelsOnTheRight) {
        const maxRightLabelWidth = max(maxLayerNodes, d => estimateRequiredLabelWidth(d, config, labelFontSize, subLabelFontSize))
        right = min([labelMaxWidth, maxRightLabelWidth]) + labelHorizontalPadding
      }

      const top = config.labelVerticalAlign === VerticalAlign.Top ? 0
        : config.labelVerticalAlign === VerticalAlign.Bottom ? requiredLabelHeight
          : requiredLabelHeight / 3

      const bottom = config.labelVerticalAlign === VerticalAlign.Top ? requiredLabelHeight
        : config.labelVerticalAlign === VerticalAlign.Bottom ? 0
          : requiredLabelHeight / 3

      const nodeSelectionRectBleed = config.selectedNodeIds ? 1 + NODE_SELECTION_RECT_DELTA : 0
      bleed = {
        top: nodeSelectionRectBleed + top,
        bottom: nodeSelectionRectBleed + bottom,
        left: left + (hasLabelsOnTheLeft ? 0 : nodeSelectionRectBleed),
        right: right + (hasLabelsOnTheRight ? 0 : nodeSelectionRectBleed),
      }
    }


    // Cache bleed for onZoom
    this._bleedCached = bleed

    return bleed
  }

  setData (data: { nodes: N[]; links?: L[] }): void {
    super.setData(data)

    // Pre-collapse nodes based on disabledField
    this._applyInitialCollapseState()

    // Pre-calculate component size for Sizing.EXTEND
    if ((this.sizing !== Sizing.Fit) || !this._hasLinks()) this._preCalculateComponentSize()
    this._bleedCached = null
  }

  setConfig (config: SankeyConfigInterface<N, L>): void {
    super.setConfig(config)

    // Update zoom scale from config
    if (this.config.zoomScale !== undefined) {
      this._zoomScale = this.config.zoomScale
    } else if (this.prevConfig.zoomScale !== undefined) {
      this._zoomScale = [1, 1]
      this._pan = [0, 0]
    }

    // Update zoom pan from config
    if (this.config.zoomPan !== undefined) {
      this._pan = this.config.zoomPan
    } else if (this.prevConfig.zoomPan !== undefined) {
      this._pan = [0, 0]
    }
    // Apply initial collapse state if disabledField is set
    this._applyInitialCollapseState()

    // Pre-calculate component size for Sizing.EXTEND
    if ((this.sizing !== Sizing.Fit) || !this._hasLinks()) this._preCalculateComponentSize()

    const nodeId = ((d: SankeyInputNode, i: number) => getString(d, this.config.id, i)) as any
    this._sankey.linkSort(this.config.linkSort)
    this._sankey
      .nodeId(nodeId)
      .nodeWidth(this.config.nodeWidth)
      .nodePadding(this.config.nodePadding)
      .nodeAlign(SankeyLayout[this.config.nodeAlign])
      .nodeSort(this.config.nodeSort)
      .iterations(this.config.iterations)

    // Update zoom behavior if already initialized
    if (this._zoomBehavior) {
      this._zoomBehavior.scaleExtent(this.config.zoomExtent)
      if (this.config.enableZoom) this.g.call(this._zoomBehavior)
      else this.g.on('.zoom', null)
    }

    this._bleedCached = null
  }

  _render (customDuration?: number): void {
    const { config, datamodel: { nodes, links } } = this
    const wasResized = this._prevWidth !== this._width
    this._prevWidth = this._width
    const bleed = wasResized || !this._bleedCached ? this.bleed : this._bleedCached
    const duration = isNumber(customDuration) ? customDuration : config.duration

    if (
      (nodes.length === 0) ||
      (nodes.length === 1 && links.length > 0) ||
      (nodes.length === 1 && !config.showSingleNode) ||
      (nodes.length > 1 && links.length === 0)
    ) {
      this._linksGroup.selectAll<SVGGElement, SankeyLink<N, L>>(`.${s.link}`).call(removeLinks, duration)
      this._nodesGroup.selectAll<SVGGElement, SankeyNode<N, L>>(`.${s.nodeGroup}`).call(removeNodes, config, duration)
    }

    // Prepare Layout
    this._prepareLayout()

    // Links
    const linkSelection = this._linksGroup.selectAll<SVGGElement, SankeyLink<N, L>>(`.${s.link}`)
      .data(links, (d, i) => config.id(d, i) ?? `${d.source.id}-${d.target.id}`)
    const linkSelectionEnter = linkSelection.enter().append('g').attr('class', s.link)
    linkSelectionEnter.call(createLinks)
    linkSelection.merge(linkSelectionEnter).call(updateLinks, config, duration)
    linkSelection.exit<SankeyLink<N, L>>().call(removeLinks)

    // Nodes
    // Sort nodes by x0 for optimize label rendering performance (see `getXDistanceToNextNode` in `modules/node.ts`)
    nodes.sort((a, b) => a.x0 - b.x0)

    const nodeSpacing = this._getLayerSpacing(nodes)
    const nodeSelection = this._nodesGroup.selectAll<SVGGElement, SankeyNode<N, L>>(`.${s.nodeGroup}`)
      .data(nodes, (d, i) => config.id(d, i) ?? i)
    const nodeSelectionEnter = nodeSelection.enter().append('g').attr('class', s.nodeGroup)
    const sankeyWidth = (this.sizing === Sizing.Fit ? this._width : this._extendedWidth) * this._zoomScale[0]
    nodeSelectionEnter.call(createNodes, this.config, sankeyWidth, bleed)
    nodeSelection.merge(nodeSelectionEnter).call(updateNodes, config, sankeyWidth, bleed, this._hasLinks(), duration, nodeSpacing)
    nodeSelection.exit<SankeyNode<N, L>>()
      .attr('class', s.nodeExit)
      .call(removeNodes, config, duration)

    // Pan
    this._applyPanTransform(duration, bleed)

    // Background
    this._backgroundRect
      .attr('width', this.getWidth())
      .attr('height', this.getHeight())
      .attr('opacity', 0)
  }

  private _applyPanTransform (duration: number, bleed: Spacing): void {
    const pan = this.config.zoomPan ?? this._pan
    const tx = bleed.left + pan[0]
    const ty = bleed.top + pan[1]
    smartTransition(this._linksGroup, duration).attr('transform', `translate(${tx},${ty})`)
    smartTransition(this._nodesGroup, duration).attr('transform', `translate(${tx},${ty})`)
  }

  private _scheduleRender (duration: number): void {
    if (this._animationFrameId != null) return

    this._animationFrameId = requestAnimationFrame(() => {
      this._render(duration)
      this._animationFrameId = null
    })
  }

  public setZoomScale (horizontalScale?: number, verticalScale?: number, duration: number = this.config.duration): void {
    // If zoomScale is controlled by config, do nothing
    if (this.config.zoomScale !== undefined) return

    const [min, max] = this.config.zoomExtent
    if (isNumber(horizontalScale)) this._zoomScale[0] = Math.min(max, Math.max(min, horizontalScale))
    if (isNumber(verticalScale)) this._zoomScale[1] = Math.min(max, Math.max(min, verticalScale))

    // Sync D3's zoom transform to match our scale
    // Use the geometric mean as a reasonable approximation for D3's single scale
    const effectiveScale = Math.sqrt(
      (this._zoomScale[0] ?? 1) * (this._zoomScale[1] ?? 1)
    )
    const currentTransform = zoomIdentity.scale(effectiveScale)
    this._gNode.__zoom = currentTransform
    this._prevZoomTransform.k = effectiveScale

    this._render(duration)
  }

  public getZoomScale (): [number, number] {
    // If zoomPan is controlled by config, do nothing
    if (this.config.zoomPan !== undefined) return

    return [this._zoomScale[0] || 1, this._zoomScale[1] || 1]
  }

  public setPan (x: number, y: number, duration = this.config.duration): void {
    this._pan = [x ?? 0, y ?? 0]
    this._prevZoomTransform.x = 0
    this._prevZoomTransform.y = 0
    this._scheduleRender(duration)
  }

  public getPan (): [number, number] {
    return this._pan
  }

  public fitView (duration = this.config.duration): void {
    this._zoomScale = this.config.zoomScale ?? [1, 1]
    this._pan = this.config.zoomPan ?? [0, 0]

    // Sync D3 zoom transform with our scales
    const effectiveScale = Math.sqrt(this._zoomScale[0] * this._zoomScale[1])
    const currentTransform = zoomIdentity.scale(effectiveScale)
    this._gNode.__zoom = currentTransform
    this._prevZoomTransform.k = effectiveScale
    this._prevZoomTransform.x = 0
    this._prevZoomTransform.y = 0

    this._render(duration)
  }

  private _onZoom (event: D3ZoomEvent<SVGGElement, unknown>): void {
    const { datamodel, config } = this
    if (config.zoomScale || config.zoomPan) return

    const nodes = datamodel.nodes
    const transform = event.transform
    const sourceEvent = event.sourceEvent as WheelEvent | MouseEvent | TouchEvent | undefined
    const zoomMode = config.zoomMode || SankeyZoomMode.XY
    const bleed = this._bleedCached ?? this.bleed

    // Zoom pivots
    const minX = min(nodes, d => d.x0) ?? 0
    const minY = min(nodes, d => d.y0) ?? 0

    // Determine whether this is a zoom (wheel/pinch) or a pan (drag)
    const isZoomEvent = Math.abs(transform.k - this._prevZoomTransform.k) > 1e-6

    if (isZoomEvent) { // Zoom and Pan
      // Compute delta factor from transform.k.
      // If Cmd (metaKey) is pressed, only change horizontal scale.
      // If Alt/Option (altKey) is pressed, only change vertical scale.
      const deltaK = transform.k / this._prevZoomTransform.k
      const isHorizontalOnlyKey = Boolean(sourceEvent?.metaKey)
      const isVerticalOnlyKey = !isHorizontalOnlyKey && Boolean(sourceEvent?.altKey)
      const isHorizontalOnly = isHorizontalOnlyKey || zoomMode === SankeyZoomMode.X
      const isVerticalOnly = isVerticalOnlyKey || zoomMode === SankeyZoomMode.Y

      // Use our scale state as the source of truth (not config, not D3's k)
      const [hCurrent, vCurrent] = this._zoomScale
      const hNext = isVerticalOnly ? hCurrent : clamp(hCurrent * deltaK, config.zoomExtent[0], config.zoomExtent[1])
      const vNext = isHorizontalOnly ? vCurrent : clamp(vCurrent * deltaK, config.zoomExtent[0], config.zoomExtent[1])
      this._zoomScale = [hNext, vNext]

      // Pointer-centric compensation: keep the point under cursor fixed
      const pos = sourceEvent ? pointer(sourceEvent, this.g.node()) : [this._width / 2, this._height / 2]

      // Invert current mapping to get layout coordinates under pointer
      const panX = config.zoomPan?.[0] ?? this._pan[0]
      const panY = config.zoomPan?.[1] ?? this._pan[1]
      const layoutX = minX + (pos[0] - bleed.left - panX - minX) / hCurrent
      const layoutY = minY + (pos[1] - bleed.top - panY - minY) / vCurrent

      // Solve for new pan to keep pointer fixed after new scales
      if (!isVerticalOnly && !isFinite(config.zoomPan?.[0]) && zoomMode !== SankeyZoomMode.Y) {
        this._pan[0] = pos[0] - bleed.left - (minX + (layoutX - minX) * hNext)
      }

      if (!isHorizontalOnly && !isFinite(config.zoomPan?.[1]) && zoomMode !== SankeyZoomMode.X) {
        this._pan[1] = pos[1] - bleed.top - (minY + (layoutY - minY) * vNext)
      }
    } else { // Just Pan: apply translation delta directly
      const dx = transform.x - this._prevZoomTransform.x
      const dy = transform.y - this._prevZoomTransform.y
      if (zoomMode !== SankeyZoomMode.Y) this._pan[0] += dx
      if (zoomMode !== SankeyZoomMode.X) this._pan[1] += dy
    }

    // Horizontal Pan Constraint
    const maxX = max(nodes, d => d.x1) ?? 0
    const viewportWidth = this.getWidth() - bleed.left - bleed.right
    this._pan[0] = clamp(this._pan[0], viewportWidth - maxX, minX)

    // Vertical Pan Constraint
    const maxY = max(nodes, d => d.y1) ?? 0
    const viewportHeight = this.getHeight() - bleed.top - bleed.bottom
    this._pan[1] = clamp(this._pan[1], viewportHeight - maxY, minY)

    // Update last zoom state
    this._prevZoomTransform.k = transform.k
    this._prevZoomTransform.x = transform.x
    this._prevZoomTransform.y = transform.y

    config.onZoom?.(this._zoomScale[0], this._zoomScale[1], this._pan[0], this._pan[1], config.zoomExtent, event)

    this._scheduleRender(0)
  }

  private _populateLinkAndNodeValues (): void {
    const { config, datamodel } = this

    const nodes = datamodel.nodes
    const links = datamodel.links

    // For d3-sankey each link must be an object with the `value` property
    links.forEach((link, i) => {
      link.value = getNumber(link, d => getNumber(d, config.linkValue, i))
    })

    // Populating node.fixedValue for d3-sankey
    nodes.forEach((node, i) => {
      node.fixedValue = getNumber(node, config.nodeFixedValue, i)
    })
  }

  private _preCalculateComponentSize (): void {
    const { bleed, config, datamodel } = this
    const nodes = datamodel.nodes


    if (nodes.length) {
      this._populateLinkAndNodeValues()
      this._sankey(datamodel)
    }

    const scaleExtent = extent(nodes, d => d.value || undefined)
    const scaleRange = [config.nodeMinHeight, config.nodeMaxHeight]
    const scale = scaleLinear().domain(scaleExtent).range(scaleRange).clamp(true)
    nodes.forEach(n => { n._state.precalculatedHeight = scale(n.value) || config.nodeMinHeight })

    const groupedByColumn: { [key: string]: SankeyNode<N, L>[] } = groupBy(nodes, d => d.layer)
    const values = Object.values(groupedByColumn)
      .map((group) =>
        sum(group.map(n => n._state.precalculatedHeight + config.nodePadding)) - config.nodePadding
      )

    const height = max(values) || config.nodeMinHeight
    this._extendedHeight = height + bleed.top + bleed.bottom
    this._extendedWidth = Math.max(0, (config.nodeWidth + config.nodeHorizontalSpacing) * Object.keys(groupedByColumn).length - config.nodeHorizontalSpacing + bleed.left + bleed.right)
  }

  private _prepareLayout (): void {
    const { config, datamodel } = this
    const bleed = this._bleedCached ?? this.bleed
    const isExtendedSize = this.sizing === Sizing.Extend
    const sankeyHeight = this.sizing === Sizing.Fit ? this._height : this._extendedHeight
    const sankeyWidth = this.sizing === Sizing.Fit ? this._width : this._extendedWidth
    this._sankey
      .size([
        Math.max(sankeyWidth - bleed.left - bleed.right, 0),
        Math.max(sankeyHeight - bleed.top - bleed.bottom, 0),
      ])

    const nodes = datamodel.nodes
    const links = datamodel.links

    // If there are no links we manually calculate the visualization layout
    if (!this._hasLinks()) {
      let y = 0
      const nodesTotalHeight = sum(nodes, n => n._state.precalculatedHeight || 1)
      for (const node of nodes) {
        const sankeyHeight = this.getHeight() - bleed.top - bleed.bottom
        const nodeHeight = node._state.precalculatedHeight || 1
        const h = isExtendedSize ? nodeHeight : (sankeyHeight - config.nodePadding * (nodes.length - 1)) * nodeHeight / nodesTotalHeight

        node.width = Math.max(10, config.nodeWidth)
        node.x0 = 0
        node.x1 = node.width
        node.y0 = y
        node.y1 = y + Math.max(1, h)
        node.layer = 0

        y = node.y1 + config.nodePadding
      }

      // Apply scaling for manual layout as well
      this._applyLayoutScaling()

      if (isExtendedSize) {
        const height = max(nodes, d => d.y1) || 0
        const width = max(nodes, d => d.x1) || 0
        this._extendedHeightIncreased = height + bleed.top + bleed.bottom
        this._extendedWidthIncreased = width + bleed.left + bleed.right
      } else {
        this._extendedHeightIncreased = undefined
        this._extendedWidthIncreased = undefined
      }
      return
    }

    // Calculate sankey
    this._populateLinkAndNodeValues()
    this._sankey({ nodes, links })

    // Setting minimum node height
    //   Default: 1px
    //   Extended size nodes that have no links: config.nodeMinHeight
    for (const node of nodes) {
      const singleExtendedSize = isExtendedSize && !node.sourceLinks?.length && !node.targetLinks?.length
      const h = Math.max(singleExtendedSize ? config.nodeMinHeight : 1, node.y1 - node.y0)
      const y = (node.y0 + node.y1) / 2
      node.y0 = y - h / 2
      node.y1 = y + h / 2
    }
    // Apply layout scaling (affects spacing only, not node width/height)
    this._applyLayoutScaling()

    if (isExtendedSize) {
      const height = max(nodes, d => d.y1) || 0
      const width = max(nodes, d => d.x1) || 0
      this._extendedHeightIncreased = height + bleed.top + bleed.bottom
      this._extendedWidthIncreased = width + bleed.left + bleed.right
    }
  }

  private _applyLayoutScaling (): void {
    const { datamodel } = this
    const nodes = datamodel.nodes
    const links = datamodel.links

    // Use our scale state as the single source of truth
    const [hScale, vScale] = this._zoomScale

    if ((hScale === 1 || !isFinite(hScale)) && (vScale === 1 || !isFinite(vScale))) return

    const minX = min(nodes, d => d.x0) ?? 0

    // Preserve original node positions to realign link anchors after scaling
    const prevNodePos = new Map(nodes.map(n => [n, { x0: n.x0, x1: n.x1, y0: n.y0, y1: n.y1 }]))
    const prevLinkY = new Map(links.map(l => [l, { y0: l.y0, y1: l.y1 }]))

    // Horizontal spacing: scale relative to leftmost x
    if (isFinite(hScale) && hScale !== 1) {
      for (const n of nodes) {
        const nodeWidth = n.width || (n.x1 - n.x0)
        const relX0 = n.x0 - minX
        n.x0 = minX + relX0 * hScale
        n.x1 = n.x0 + nodeWidth
      }
    }

    // Vertical spacing: scale from the topmost node of the graph
    if (isFinite(vScale) && vScale !== 1) {
      const minY = min(nodes, d => d.y0) ?? 0

      for (const n of nodes) {
        const nodeHeight = n.y1 - n.y0
        const relY0 = n.y0 - minY
        n.y0 = minY + relY0 * vScale
        n.y1 = n.y0 + nodeHeight
      }

      // Re-anchor links by maintaining their offset within the source/target nodes
      for (const l of links) {
        const prev = prevLinkY.get(l)
        const prevSrc = prevNodePos.get(l.source)
        const prevTrg = prevNodePos.get(l.target)
        const deltaSrc = l.source.y0 - prevSrc.y0
        const deltaTrg = l.target.y0 - prevTrg.y0
        l.y0 = prev.y0 + deltaSrc
        l.y1 = prev.y1 + deltaTrg
      }
    }
  }

  getWidth (): number {
    return this.sizing === Sizing.Fit ? this._width : Math.max(this._extendedWidthIncreased || 0, this._extendedWidth || 0)
  }

  getHeight (): number {
    return this.sizing === Sizing.Fit ? this._height : Math.max(this._extendedHeightIncreased || 0, this._extendedHeight || 0)
  }

  getLayoutWidth (): number {
    return this.sizing === Sizing.Fit ? this._width : (this._extendedWidthIncreased || this._extendedWidth)
  }

  getLayoutHeight (): number {
    return this.sizing === Sizing.Fit ? this._height : (this._extendedHeightIncreased || this._extendedHeight)
  }

  /** @deprecated Use getLayerXCenters instead */
  getColumnCenters (): number[] {
    return this.getLayerXCenters()
  }

  getLayerXCenters (): number[] {
    const { datamodel } = this
    const nodes = datamodel.nodes as SankeyNode<N, L>[]
    const centers = nodes.reduce((pos, node) => {
      const idx = node.layer
      if (!isFinite(pos[idx])) {
        pos[idx] = (node.x0 + node.x1) / 2
      }
      return pos
    }, [])

    return centers
  }

  getLayerYCenters (): number[] {
    const { datamodel } = this
    const nodes = datamodel.nodes as SankeyNode<N, L>[]
    const nodesByLayer = groupBy(nodes, d => d.layer)
    const layerYCenters: number[] = []

    Object.values(nodesByLayer).forEach((layerNodes, idx) => {
      const minY = Math.min(...layerNodes.map(n => n.y0))
      const maxY = Math.max(...layerNodes.map(n => n.y1))
      layerYCenters[idx] = (minY + maxY) / 2
    })

    return layerYCenters
  }

  highlightSubtree (node: SankeyNode<N, L>): void {
    const { config, datamodel } = this

    clearTimeout(this._highlightTimeoutId)
    this._highlightTimeoutId = setTimeout(() => {
      for (const n of datamodel.nodes) n._state.greyout = true
      for (const l of datamodel.links) l._state.greyout = true

      this.recursiveSetSubtreeState(node, 'sourceLinks', 'target', 'greyout', false)
      this.recursiveSetSubtreeState(node, 'targetLinks', 'source', 'greyout', false)
      this._render(config.highlightDuration)
      this._highlightActive = true
    }, config.highlightDelay)
  }

  recursiveSetSubtreeState (
    node: SankeyNode<N, L>,
    linksKey: 'sourceLinks' | 'targetLinks',
    nodeKey: 'source' | 'target',
    key: string,
    value: unknown
  ): void {
    node._state[key] = value

    for (const l of node[linksKey]) {
      l._state[key] = value
      this.recursiveSetSubtreeState(l[nodeKey] as SankeyNode<N, L>, linksKey, nodeKey, key, value)
    }
  }

  disableHighlight (): void {
    const { config, datamodel } = this

    clearTimeout(this._highlightTimeoutId)
    if (this._highlightActive) {
      this._highlightActive = false

      for (const n of datamodel.nodes) n._state.greyout = false
      for (const l of datamodel.links) l._state.greyout = false
      this._render(config.highlightDuration)
    }
  }

  /**
   * Collapses a node by hiding only the links directly connected to it.
   * All other nodes (including children and descendants) remain visible in their original positions.
   * Only the immediate incoming and outgoing links of the collapsed node are hidden.
   */
  collapseNode (node: SankeyNode<N, L>): void {
    const { config } = this

    // Clear any active highlights before collapsing
    this.disableHighlight()

    node._state = node._state || {}
    node._state.collapsed = true
    this._render(config.collapseAnimationDuration)
  }

  /**
   * Expands a previously collapsed node by showing its directly connected links.
   */
  expandNode (node: SankeyNode<N, L>): void {
    const { config } = this

    // Clear any active highlights before expanding
    this.disableHighlight()

    node._state = node._state || {}
    node._state.collapsed = false
    this._render(config.collapseAnimationDuration)
  }

  /**
   * Toggles the collapse state of a node.
   *
   * @param node The node to toggle
   */
  toggleNodeCollapse (node: SankeyNode<N, L>): void {
    if (node._state?.collapsed) {
      this.expandNode(node)
    } else {
      this.collapseNode(node)
    }
  }

  private _hasLinks (): boolean {
    const { datamodel } = this
    return datamodel.links.length > 0
  }

  private _getLayerSpacing (nodes: SankeyNode<N, L>[]): number {
    const { config } = this
    if (!nodes?.length) return 0

    const firstLayerNode = nodes.find(d => d.layer === 0)
    const nextLayerNode = nodes.find(d => d.layer === firstLayerNode.layer + 1)
    return nextLayerNode ? nextLayerNode.x0 - (firstLayerNode.x0 + config.nodeWidth) : this._width - firstLayerNode.x1
  }
  
  /**
   * Applies initial collapse state to nodes based on the disabledField configuration.
   * If disabledField is set (e.g., "disabled"), nodes with that field set to true
   * will be pre-collapsed when the component loads.
   */
  private _applyInitialCollapseState (): void {
    const { config, datamodel } = this

    if (!config.disabledField) return

    // Check each node for the disabled field and set initial collapse state
    for (const node of datamodel.nodes) {
      const inputData = node as unknown as N
      const isDisabled = inputData && typeof inputData === 'object' &&
                        config.disabledField in inputData &&
                        (inputData as any)[config.disabledField] === true

      if (isDisabled) {
        node._state = node._state || {}
        node._state.collapsed = true
      }
    }
  }

  private _onNodeMouseOver (d: SankeyNode<N, L>, event: MouseEvent): void {
    const { datamodel } = this
    const bleed = this._bleedCached ?? this.bleed
    const nodeSelection = select<SVGGElement, SankeyNode<N, L>>(event.currentTarget as SVGGElement)
    const sankeyWidth = this.sizing === Sizing.Fit ? this._width : this._extendedWidth
    onNodeMouseOver(d, datamodel.nodes, nodeSelection, this.config, sankeyWidth, this._getLayerSpacing(this.datamodel.nodes), bleed)
  }

  private _onNodeMouseOut (d: SankeyNode<N, L>, event: MouseEvent): void {
    const { datamodel } = this
    const bleed = this._bleedCached ?? this.bleed
    const nodeSelection = select<SVGGElement, SankeyNode<N, L>>(event.currentTarget as SVGGElement)
    const sankeyWidth = this.sizing === Sizing.Fit ? this._width : this._extendedWidth
    onNodeMouseOut(d, datamodel.nodes, nodeSelection, this.config, sankeyWidth, this._getLayerSpacing(this.datamodel.nodes), bleed)
  }

  private _onNodeRectMouseOver (d: SankeyNode<N, L>): void {
    const { config } = this
    if (config.highlightSubtreeOnHover) this.highlightSubtree(d)
  }

  private _onNodeRectMouseOut (): void {
    this.disableHighlight()
  }

  private _onLinkMouseOver (d: SankeyLink<N, L>): void {
    const { config } = this

    if (config.highlightSubtreeOnHover) this.highlightSubtree(d.target as SankeyNode<N, L>)
  }

  private _onLinkMouseOut (): void {
    this.disableHighlight()
  }

  private _onNodeClick (d: SankeyNode<N, L>, event: MouseEvent): void {
    const { config } = this
    if (config.enableNodeCollapse) {
      this.toggleNodeCollapse(d)
    }
  }
}
