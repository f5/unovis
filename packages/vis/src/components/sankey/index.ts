// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { sankey } from 'd3-sankey'
import { sum, max, extent } from 'd3-array'
import { scaleLinear } from 'd3-scale'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Types
import { Spacing } from 'types/misc'
import { ExtendedSizeComponent, Sizing } from 'types/component'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition } from 'types/sankey'

// Utils
import { getValue, isNumber, groupBy } from 'utils/data'

// Config
import { SankeyConfig, SankeyConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { removeLinks, createLinks, updateLinks } from './modules/link'
import { removeNodes, createNodes, updateNodes, onNodeMouseOver, onNodeMouseOut } from './modules/node'
import { requiredLabelSpace, NODE_LABEL_SPACING } from './modules/label'

export class Sankey<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentCore<{nodes: N[]; links?: L[]}> implements ExtendedSizeComponent {
  static selectors = s
  config: SankeyConfig<N, L> = new SankeyConfig()
  datamodel: GraphDataModel<N, L> = new GraphDataModel()
  private _extendedWidth = undefined
  private _extendedHeight = undefined
  private _extendedSizeMinHeight = 200
  private _linksGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _nodesGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _sankey = sankey()
  private _highlightTimeoutId = null
  events = {
    [Sankey.selectors.gNode]: {
      mouseover: this._onNodeMouseOver.bind(this),
      mouseout: this._onNodeMouseOut.bind(this),
    },
    [Sankey.selectors.link]: {
      mouseover: this._onLinkMouseOver.bind(this),
      mouseout: this._onLinkMouseOut.bind(this),
    },
  }

  constructor (config?: SankeyConfigInterface<N, L>) {
    super()
    if (config) this.config.init(config)
    this._linksGroup = this.g.append('g').attr('class', s.links)
    this._nodesGroup = this.g.append('g').attr('class', s.nodes)
  }

  get bleed (): Spacing {
    const { config: { labelWidth, labelFontSize, labelPosition, nodeHorizontalSpacing, nodeWidth } } = this

    switch (labelPosition) {
    case (LabelPosition.AUTO): {
      return { top: labelFontSize / 2, bottom: labelFontSize / 2, left: labelWidth + 2 * NODE_LABEL_SPACING, right: labelWidth + 2 * NODE_LABEL_SPACING }
    }
    case (LabelPosition.RIGHT): {
      const requiredSpace = requiredLabelSpace(nodeWidth, nodeHorizontalSpacing, labelFontSize)
      return { top: requiredSpace.y / 2, bottom: requiredSpace.y / 2, left: 0, right: requiredSpace.x }
    }
    }
  }

  setData (data: GraphDataModel<N, L>): void {
    super.setData(data)

    // Pre-calculate component size for Sizing.EXTEND
    if (this.sizing !== Sizing.FIT) this._preCalculateComponentSize()
  }

  setConfig (config: SankeyConfigInterface<N, L>): void {
    super.setConfig(config)

    // Pre-calculate component size for Sizing.EXTEND
    if (this.sizing !== Sizing.FIT) this._preCalculateComponentSize()
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
      this._nodesGroup.selectAll(`.${s.gNode}`).call(removeNodes, config, duration)
    }

    // Prepare Layout
    this._prepareLayout()

    // Links
    this._linksGroup.attr('transform', `translate(${bleed.left},${bleed.top})`)
    const linkSelection = this._linksGroup.selectAll(`.${s.link}`).data(links, config.id)
    const linkSelectionEnter = linkSelection.enter().append('g').attr('class', s.link)
    linkSelectionEnter.call(createLinks)
    linkSelection.merge(linkSelectionEnter).call(updateLinks, config, duration)
    linkSelection.exit().call(removeLinks, duration)

    // Nodes
    this._nodesGroup.attr('transform', `translate(${bleed.left},${bleed.top})`)

    const nodeSelection = this._nodesGroup.selectAll(`.${s.gNode}`).data(nodes, config.id)
    const nodeSelectionEnter = nodeSelection.enter().append('g').attr('class', s.gNode)
    nodeSelectionEnter.call(createNodes, this.config, bleed)
    nodeSelection.merge(nodeSelectionEnter).call(updateNodes, config, bleed, duration)
    nodeSelection.exit()
      .attr('class', s.nodeExit)
      .call(removeNodes, config, duration)
  }

  private _preCalculateComponentSize (): void {
    const { bleed, config: { nodePadding, nodeWidth, nodeAlign, nodeMinHeight, nodeMaxHeight, nodeHorizontalSpacing }, datamodel: { nodes, links } } = this
    this._sankey
      .nodeId(d => d.id)
      .iterations(32)
      .nodeAlign(nodeAlign)

    if (nodes.length) this._sankey({ nodes, links })
    const extentValue = extent(nodes, d => d.value || undefined)
    const scale = scaleLinear().domain(extentValue).range([nodeMinHeight, nodeMaxHeight]).clamp(true)
    const groupByColumn = groupBy(nodes, d => d.layer)
    const values = Object.values(groupByColumn).map((d: any[]) => sum(d.map(n => scale(n.value) + nodePadding)))
    const height = max(values)
    this._extendedHeight = height || this._extendedSizeMinHeight
    this._extendedWidth = (nodeWidth + nodeHorizontalSpacing) * Object.keys(groupByColumn).length - nodeHorizontalSpacing + bleed.left + bleed.right
  }

  private _prepareLayout (): void {
    const { config, bleed, datamodel, _extendedHeight, _extendedWidth } = this
    const sankeyHeight = this._getSankeyHeight()

    const nodes = datamodel.nodes// this._sortNodes()
    const links = datamodel.links

    const hasLinks = links.length > 0

    // If there're no links we manually calculate the visualization layout
    if (!hasLinks) {
      const nodeHeight = sankeyHeight / nodes.length - config.nodePadding * (nodes.length - 1)
      let y = 0
      for (const node of nodes) {
        node.width = Math.max(10, config.nodeWidth)
        node.x0 = 0
        node.x1 = node.width
        node.y0 = y
        node.y1 = y + nodeHeight
        node.layer = 0

        y = node.y1 + config.nodePadding
      }

      return
    }

    // For d3 sankey function each link must be an object with the `value` property
    links.forEach(link => {
      link.value = getValue(link, d => getValue(d, config.linkValue))
    })

    this._sankey
      .nodeWidth(config.nodeWidth)
      .nodePadding(config.nodePadding)
      .size([(_extendedWidth ?? config.width) - bleed.left - bleed.right, (_extendedHeight ?? sankeyHeight) - bleed.top - bleed.bottom])
      .nodeId(d => d.id)
      .iterations(32)
      .nodeAlign(config.nodeAlign)
      .nodeSort(config.nodeSort)
      .linkSort(config.linkSort)

    this._sankey({ nodes, links })

    // Setting minimum node height
    //   Default: 1px
    //   Extended size nodes that have no links: config.nodeMinHeight
    for (const node of nodes) {
      const singleExtendedSize = this.sizing === Sizing.EXTEND && !node.sourceLinks?.length && !node.targetLinks?.length
      const h = Math.max(singleExtendedSize ? config.nodeMinHeight : 1, node.y1 - node.y0)
      const y = (node.y0 + node.y1) / 2
      node.y0 = y - h / 2
      node.y1 = y + h / 2
    }

    if (this.sizing === Sizing.EXTEND) {
      const height = max(nodes, d => d.y1)
      this._extendedHeight = height + bleed.top + bleed.bottom
    }
  }

  private _getSankeyHeight (): number {
    const { config } = this

    const height = this.sizing === Sizing.FIT ? config.height : this._extendedHeight
    return height // clamp(height * links.length * config.heightNormalizationCoeff, height / 2, height)
  }

  getWidth (): number {
    return this._extendedWidth ?? this.config.width
  }

  getHeight (): number {
    return this._extendedHeight ?? this.config.height
  }

  getColumnCenters (): number[] {
    const { datamodel } = this

    const centers = datamodel.nodes.reduce((pos, node) => {
      const idx = node.layer
      if (!isFinite(pos[idx])) {
        pos[idx] = (node.x0 + node.x1) / 2
      }
      return pos
    }, [])

    return centers
  }

  highlightSubtree (node: SankeyNodeDatumInterface): void {
    const { config, datamodel } = this

    clearTimeout(this._highlightTimeoutId)
    this._highlightTimeoutId = setTimeout(() => {
      for (const n of datamodel.nodes) n._state.greyout = true
      for (const l of datamodel.links) l._state.greyout = true

      this.recursiveSetSubtreeState(node, 'sourceLinks', 'target', 'greyout', false)
      this.recursiveSetSubtreeState(node, 'targetLinks', 'source', 'greyout', false)
      this._render(config.highlightDuration)
    }, config.highlightDelay)
  }

  recursiveSetSubtreeState (node: SankeyNodeDatumInterface, linksKey: 'sourceLinks' | 'targetLinks', nodeKey: 'source' | 'target', key: string, value: any): void {
    node._state[key] = value

    for (const l of node[linksKey]) {
      l._state[key] = value
      this.recursiveSetSubtreeState(l[nodeKey] as SankeyNodeDatumInterface, linksKey, nodeKey, key, value)
    }
  }

  disableHighlight (): void {
    const { config, datamodel } = this

    clearTimeout(this._highlightTimeoutId)
    for (const n of datamodel.nodes) n._state.greyout = false
    for (const l of datamodel.links) l._state.greyout = false
    this._render(config.highlightDuration)
  }

  private _onNodeMouseOver (d: SankeyNodeDatumInterface, i, els): void {
    const { config } = this

    if (config.highlightSubtreeOnHover) this.highlightSubtree(d)
    onNodeMouseOver(d, select(els[i]), this.config)
  }

  private _onNodeMouseOut (d: SankeyNodeDatumInterface, i, els): void {
    const { config } = this

    if (config.highlightSubtreeOnHover) this.disableHighlight()
    onNodeMouseOut(d, select(els[i]), this.config)
  }

  private _onLinkMouseOver (d: SankeyLinkDatumInterface, i, els): void {
    const { config } = this

    if (config.highlightSubtreeOnHover) this.highlightSubtree(d.target as SankeyNodeDatumInterface)
  }

  private _onLinkMouseOut (d: SankeyLinkDatumInterface, i, els): void {
    const { config } = this

    if (config.highlightSubtreeOnHover) this.disableHighlight()
  }
}
