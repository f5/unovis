import { select, Selection } from 'd3-selection'
import { sankey } from 'd3-sankey'
import { extent, max, sum } from 'd3-array'
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
import { getNumber, getString, groupBy, isNumber } from 'utils/data'

// Config
import { SankeyConfig, SankeyConfigInterface } from './config'

// Styles
import * as s from './style'

// Local Types
import { SankeyInputLink, SankeyInputNode, SankeyLayout, SankeyLink, SankeyNode } from './types'

// Modules
import { createLinks, removeLinks, updateLinks } from './modules/link'
import { createNodes, onNodeMouseOut, onNodeMouseOver, removeNodes, updateNodes } from './modules/node'
import { getLabelOrientation, requiredLabelSpace } from './modules/label'

export class Sankey<N extends SankeyInputNode, L extends SankeyInputLink> extends ComponentCore<{nodes: N[]; links?: L[]}> implements ExtendedSizeComponent {
  static selectors = s
  config: SankeyConfig<N, L> = new SankeyConfig()
  datamodel: GraphDataModel<N, L, SankeyNode<N, L>, SankeyLink<N, L>> = new GraphDataModel()
  private _extendedWidth = undefined
  private _extendedHeight = undefined
  private _extendedHeightIncreased = undefined
  private _linksGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _nodesGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _backgroundRect: Selection<SVGRectElement, unknown, SVGGElement, unknown>
  private _sankey = sankey()
  private _highlightTimeoutId = null
  private _highlightActive = false
  events = {
    [Sankey.selectors.nodeGroup]: {
      mouseenter: this._onNodeMouseOver.bind(this),
      mouseleave: this._onNodeMouseOut.bind(this),
    },
    [Sankey.selectors.node]: {
      mouseenter: this._onNodeRectMouseOver.bind(this),
      mouseleave: this._onNodeRectMouseOut.bind(this),
    },
    [Sankey.selectors.link]: {
      mouseenter: this._onLinkMouseOver.bind(this),
      mouseleave: this._onLinkMouseOut.bind(this),
    },
  }

  constructor (config?: SankeyConfigInterface<N, L>) {
    super()
    if (config) this.setConfig(config)
    this._backgroundRect = this.g.append('rect').attr('class', s.background)
    this._linksGroup = this.g.append('g').attr('class', s.links)
    this._nodesGroup = this.g.append('g').attr('class', s.nodes)
  }

  get bleed (): Spacing {
    const { config, datamodel: { nodes, links } } = this
    const labelSize = requiredLabelSpace(config.labelMaxWidth, config.labelFontSize)

    let left = 0
    let right = 0

    // We pre-calculate sankey layout to get information about node labels placement and calculate bleed properly
    // Potentially it can be a performance bottleneck for large layouts, but generally rendering of such layouts is much more computationally heavy
    if (nodes.length) {
      const sankeyProbeSize = 1000
      this._populateLinkAndNodeValues()
      this._sankey.size([sankeyProbeSize, sankeyProbeSize])
      this._sankey({ nodes, links })
      const maxDepth = max(nodes, d => d.depth)
      const zeroDepthNodes = nodes.filter(d => d.depth === 0)
      const maxDepthNodes = nodes.filter(d => d.depth === maxDepth)

      left = zeroDepthNodes.some(d => getLabelOrientation(d, sankeyProbeSize, config.labelPosition) === Position.Left) ? labelSize.width : 0
      right = maxDepthNodes.some(d => getLabelOrientation(d, sankeyProbeSize, config.labelPosition) === Position.Right) ? labelSize.width : 0
    }

    const top = config.labelVerticalAlign === VerticalAlign.Top ? 0
      : config.labelVerticalAlign === VerticalAlign.Bottom ? labelSize.height
        : labelSize.height / 2

    const bottom = config.labelVerticalAlign === VerticalAlign.Top ? labelSize.height
      : config.labelVerticalAlign === VerticalAlign.Bottom ? 0
        : labelSize.height / 2

    return { top, bottom, left, right }
  }

  setData (data: { nodes: N[]; links?: L[] }): void {
    super.setData(data)

    // Pre-calculate component size for Sizing.EXTEND
    if ((this.sizing !== Sizing.Fit) || !this._hasLinks()) this._preCalculateComponentSize()
  }

  setConfig (config: SankeyConfigInterface<N, L>): void {
    super.setConfig(config)

    // Pre-calculate component size for Sizing.EXTEND
    if ((this.sizing !== Sizing.Fit) || !this._hasLinks()) this._preCalculateComponentSize()

    // Using "as any" because typings are not full ("@types/d3-sankey": "^0.11.2")
    const nodeId = ((d, i) => getString(d, this.config.id, i)) as any;
    (this._sankey as any).linkSort(this.config.linkSort)
    this._sankey
      .nodeId(nodeId)
      .nodeWidth(this.config.nodeWidth)
      .nodePadding(this.config.nodePadding)
      .nodeAlign(SankeyLayout[this.config.nodeAlign])
      .nodeSort(this.config.nodeSort)
      .iterations(this.config.iterations)
  }

  _render (customDuration?: number): void {
    const { config, bleed, datamodel: { nodes, links } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    if (
      (nodes.length === 0) ||
      (nodes.length === 1 && links.length > 0) ||
      (nodes.length === 1 && !config.showSingleNode) ||
      (nodes.length > 1 && links.length === 0)
    ) {
      this._linksGroup.selectAll(`.${s.link}`).call(removeLinks, duration)
      this._nodesGroup.selectAll(`.${s.nodeGroup}`).call(removeNodes, config, duration)
    }

    // Prepare Layout
    this._prepareLayout()

    // Links
    this._linksGroup.attr('transform', `translate(${bleed.left},${bleed.top})`)
    const linkSelection = this._linksGroup.selectAll<SVGGElement, SankeyLink<N, L>>(`.${s.link}`)
      .data(links, (d, i) => config.id(d, i) ?? i)
    const linkSelectionEnter = linkSelection.enter().append('g').attr('class', s.link)
    linkSelectionEnter.call(createLinks)
    linkSelection.merge(linkSelectionEnter).call(updateLinks, config, duration)
    linkSelection.exit().call(removeLinks)

    // Nodes
    this._nodesGroup.attr('transform', `translate(${bleed.left},${bleed.top})`)

    const nodeSelection = this._nodesGroup.selectAll<SVGGElement, SankeyNode<N, L>>(`.${s.nodeGroup}`)
      .data(nodes, (d, i) => config.id(d, i) ?? i)
    const nodeSelectionEnter = nodeSelection.enter().append('g').attr('class', s.nodeGroup)
    nodeSelectionEnter.call(createNodes, this.config, this._width, bleed)
    nodeSelection.merge(nodeSelectionEnter).call(updateNodes, config, this._width, bleed, this._hasLinks(), duration)
    nodeSelection.exit()
      .attr('class', s.nodeExit)
      .call(removeNodes, config, duration)

    // Background
    this._backgroundRect
      .attr('width', this.getWidth())
      .attr('height', this.getHeight())
      .attr('opacity', 0)
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
    this._extendedWidth = (config.nodeWidth + config.nodeHorizontalSpacing) * Object.keys(groupedByColumn).length - config.nodeHorizontalSpacing + bleed.left + bleed.right
  }

  private _prepareLayout (): void {
    const { config, bleed, datamodel } = this
    const isExtendedSize = this.sizing === Sizing.Extend
    const sankeyHeight = this.sizing === Sizing.Fit ? this._height : this._extendedHeight
    const sankeyWidth = this.sizing === Sizing.Fit ? this._width : this._extendedWidth
    this._sankey
      .size([sankeyWidth - bleed.left - bleed.right, sankeyHeight - bleed.top - bleed.bottom])

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

      this._extendedHeightIncreased = undefined
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

    if (isExtendedSize) {
      const height = max(nodes, d => d.y1)
      this._extendedHeightIncreased = height + bleed.top + bleed.bottom
    }
  }

  getWidth (): number {
    return Math.max(this._extendedWidth || 0, this._width)
  }

  getHeight (): number {
    return Math.max(this._extendedHeightIncreased || 0, this._extendedHeight || 0, this._height)
  }

  getLayoutWidth (): number {
    return this.sizing === Sizing.Fit ? this._width : this._extendedWidth
  }

  getLayoutHeight (): number {
    return this.sizing === Sizing.Fit ? this._height : (this._extendedHeightIncreased || this._extendedHeight)
  }

  getColumnCenters (): number[] {
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

  recursiveSetSubtreeState (node: SankeyNode<N, L>, linksKey: 'sourceLinks' | 'targetLinks', nodeKey: 'source' | 'target', key: string, value: any): void {
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

  private _hasLinks (): boolean {
    const { datamodel } = this
    return datamodel.links.length > 0
  }

  private _onNodeMouseOver (d: SankeyNode<N, L>, event: MouseEvent): void {
    onNodeMouseOver(d, select(event.currentTarget as SVGGElement), this.config, this._width)
  }

  private _onNodeMouseOut (d: SankeyNode<N, L>, event: MouseEvent): void {
    onNodeMouseOut(d, select(event.currentTarget as SVGGElement), this.config, this._width)
  }

  private _onNodeRectMouseOver (d: SankeyNode<N, L>): void {
    const { config } = this
    if (config.highlightSubtreeOnHover) this.highlightSubtree(d)
  }

  private _onNodeRectMouseOut (d: SankeyNode<N, L>): void {
    this.disableHighlight()
  }

  private _onLinkMouseOver (d: SankeyLink<N, L>, event: MouseEvent): void {
    const { config } = this

    if (config.highlightSubtreeOnHover) this.highlightSubtree(d.target as SankeyNode<N, L>)
  }

  private _onLinkMouseOut (d: SankeyLink<N, L>, event: MouseEvent): void {
    this.disableHighlight()
  }
}
