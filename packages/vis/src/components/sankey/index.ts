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

// Utils
import { getValue, isNumber, groupBy, sortBy, flatten } from 'utils/data'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition } from 'types/sankey'

// Config
import { SankeyConfig, SankeyConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { removeLinks, createLinks, updateLinks } from './modules/link'
import { removeNodes, createNodes, updateNodes, onNodeMouseOver, onNodeMouseOut } from './modules/node'
import { requiredLabelSpace } from './modules/label'

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
  events = {
    [Sankey.selectors.gNode]: {
      mouseover: this._onNodeMouseOver.bind(this),
      mouseout: this._onNodeMouseOut.bind(this),
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
      return { top: labelFontSize / 2, bottom: labelFontSize / 2, left: labelWidth, right: labelWidth }
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
    const { config, bleed, datamodel, datamodel: { links }, _extendedHeight, _extendedWidth } = this

    const nodes = this.sizing !== Sizing.FIT ? this._sortNodes() : datamodel.nodes

    links.forEach(link => {
      // For d3 sankey function each link must be an object with the `value` property
      link.value = getValue(link, d => getValue(d, config.linkValue))
    })

    const sankeyHeight = this._getSankeyHeight()
    if (this.sizing !== Sizing.FIT) {
      this._sankey.linkSort((link2, link1) => {
        if (link2.value > link1.value) return -1
      })
      this._sankey.nodeSort(null)
    } else {
      this._sankey
        .nodeSort((node2, node1) => {
          if (node1.targetLinks.length === 1 && node2.targetLinks.length === 1 && node1.sourceLinks.length === 0 && node2.sourceLinks.length === 0) {
            const targetLinkSourceId1 = node1.targetLinks[0].source.index
            const targetLinkSourceId2 = node2.targetLinks[0].source.index
            if (targetLinkSourceId1 > targetLinkSourceId2) return -1
          }

          if (node1.targetLinks.length === 0 && node2.targetLinks.length === 0 && node1.sourceLinks.length === 1 && node2.sourceLinks.length === 1) {
            const sourceLinkTargetId1 = node1.sourceLinks[0].target.index
            const sourceLinkTargetId2 = node2.sourceLinks[0].target.index
            if (sourceLinkTargetId1 > sourceLinkTargetId2) return -1
          }
        })
        .linkSort((link2, link1) => {
          if (link2.index < link1.index) return -1
        })
    }

    this._sankey
      .nodeWidth(config.nodeWidth)
      .nodePadding(config.nodePadding)
      .size([(_extendedWidth ?? config.width) - bleed.left - bleed.right, (_extendedHeight ?? sankeyHeight) - bleed.top - bleed.bottom])
      .nodeId(d => d.id)
      .iterations(32)
      .nodeAlign(config.nodeAlign)

    if (links.length > 0 && nodes.length > 1) {
      this._sankey({ nodes, links })

      if (this.sizing !== Sizing.FIT) {
        const maxDepth = max(nodes, d => d.layer)
        for (let depth = 0; depth <= maxDepth; depth += 1) {
          const layerNodes = nodes.filter(d => d.layer === depth)

          // Assuming the layer has been previously sorted
          let y = layerNodes[0]?.y0
          for (const node of layerNodes) {
            const h = node.y1 - node.y0
            node.y0 = y
            node.y1 = y + Math.max(config.nodeMinHeight, h)

            y = node.y1 + config.nodePadding
          }
        }

        const height = max(nodes, d => d.y1)
        this._extendedHeight = height + bleed.top + bleed.bottom
      }
    } else {
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
    }
  }

  private _getSankeyHeight (): number {
    const { config } = this

    const height = this.sizing === Sizing.FIT ? config.height : this._extendedHeight
    return height // clamp(height * links.length * config.heightNormalizationCoeff, height / 2, height)
  }

  private _sortNodes (): [] {
    const { datamodel } = this
    const groupByColumn = groupBy(datamodel.nodes, d => d.layer)
    Object.keys(groupByColumn).forEach(key => {
      const column = groupByColumn[key]
      let sortedColumn
      if (Number(key) === 0) {
        sortedColumn = sortBy(column, [d => -d.value])
      } else {
        sortedColumn = sortBy(column, [
          d => d.targetLinks?.[0].source._order,
          d => -d.value,
        ])
      }
      sortedColumn.forEach((c, i) => { c._order = i })
      groupByColumn[key] = sortedColumn
    })
    return flatten(Object.values(groupByColumn))
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

  _onNodeMouseOver (d, i, els): void {
    onNodeMouseOver(select(els[i]), this.config)
    this._onEvent(d, i, els)
  }

  _onNodeMouseOut (d, i, els): void {
    onNodeMouseOut(select(els[i]), this.config)
    this._onEvent(d, i, els)
  }
}
