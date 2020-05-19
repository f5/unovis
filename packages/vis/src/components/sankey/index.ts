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
import { CustomSizedComponent, Sizing } from 'types/component'

// Utils
import { getValue, clamp, isNumber, groupBy } from 'utils/data'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition } from 'types/sankey'

// Config
import { SankeyConfig, SankeyConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { removeLinks, createLinks, updateLinks } from './modules/link'
import { removeNodes, createNodes, updateNodes, onNodeMouseOver, onNodeMouseOut } from './modules/node'

export class Sankey<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentCore<{nodes: N[]; links?: L[]}> implements CustomSizedComponent {
  static selectors = s
  config: SankeyConfig<N, L> = new SankeyConfig()
  datamodel: GraphDataModel<N, L> = new GraphDataModel()
  private _linksGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _nodesGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _sankey = sankey()
  customWidth = undefined
  customHeight = undefined
  events = {
    [Sankey.selectors.node]: {
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
    const { config: { labelWidth, labelFontSize, labelPosition, nodeHorizontalSpacing } } = this
    if (labelPosition === LabelPosition.AUTO) {
      return { top: labelFontSize / 2, bottom: labelFontSize / 2, left: labelWidth, right: labelWidth }
    } else {
      return { top: labelFontSize / 2, bottom: labelFontSize / 2, left: 0, right: nodeHorizontalSpacing }
    }
  }

  _render (customDuration?: number): void {
    const { config, config: { componentSizing }, bleed, datamodel: { nodes, links } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    if (
      (nodes.length === 0) ||
      (nodes.length === 1 && links.length > 0) ||
      (nodes.length === 1 && !config.showSingleNode) ||
      (nodes.length > 1 && links.length === 0)
    ) {
      this._linksGroup.selectAll(`.${s.link}`).call(removeLinks, duration)
      this._nodesGroup.selectAll(`.${s.node}`).call(removeNodes, duration)
    }

    if (componentSizing === Sizing.CONTAIN) this._preCalculateComponentSize()
    this._prepareLayout()

    const sankeyHeight = this._getSankeyHeight()
    const translateY = (config.height - sankeyHeight) / 2

    // Links
    this._linksGroup.attr('transform', `translate(${bleed.left},${bleed.top + translateY})`)
    const linkSelection = this._linksGroup.selectAll(`.${s.link}`).data(links, config.id)
    const linkSelectionEnter = linkSelection.enter().append('g').attr('class', s.link)
    linkSelectionEnter.call(createLinks)
    linkSelection.merge(linkSelectionEnter).call(updateLinks, config, duration)
    linkSelection.exit().call(removeLinks, duration)

    // Nodes
    this._nodesGroup.attr('transform', `translate(${bleed.left},${bleed.top + translateY})`)
    const nodeSelection = this._nodesGroup.selectAll(`.${s.node}`).data(nodes, config.id)
    const nodeSelectionEnter = nodeSelection.enter().append('g').attr('class', s.node)
    nodeSelectionEnter.call(createNodes, this.config, bleed)
    nodeSelection.merge(nodeSelectionEnter).call(updateNodes, config, bleed, duration)
    nodeSelection.exit().call(removeNodes, duration)
  }

  private _preCalculateComponentSize (): void {
    const { config: { nodePadding, nodeWidth, nodeAlign, nodeMinHeight, nodeMaxHeight, nodeHorizontalSpacing }, datamodel: { nodes, links } } = this
    this._sankey
      .nodeId(d => d.id)
      .iterations(32)
      .nodeAlign(nodeAlign)
    this._sankey({ nodes, links })
    const extentValue = extent(nodes, d => d.value || undefined)
    const scale = scaleLinear().domain(extentValue).range([nodeMinHeight, nodeMaxHeight]).clamp(true)
    const groupedByLayer = groupBy(nodes, d => d.layer)
    const values = Object.values(groupedByLayer).map((d: any[]) => sum(d.map(n => scale(n.value) + nodePadding)))
    const height = max(values)
    this.customHeight = height
    this.customWidth = (nodeWidth + nodeHorizontalSpacing * Object.keys(groupedByLayer).length)
  }

  private _prepareLayout (): void {
    const { config, bleed, datamodel: { nodes, links }, customHeight, customWidth } = this
    links.forEach(link => {
      // For d3 sankey function each link must be an object with the `value` property
      link.value = getValue(link, d => getValue(d, config.linkValue))
    })

    const sankeyHeight = this._getSankeyHeight()
    if (config.componentSizing === Sizing.CONTAIN) {
      this._sankey.linkSort((link2, link1) => {
        if (link2.value > link1.value) return -1
      })
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
      .size([(customWidth ?? config.width) - bleed.left - bleed.right, (customHeight ?? sankeyHeight) - bleed.top - bleed.bottom])
      .nodeId(d => d.id)
      .iterations(32)
      .nodeAlign(config.nodeAlign)

    if (links.length > 0 && links.length > 1) this._sankey({ nodes, links })
    if (links.length === 0 && nodes.length === 1) {
      const node = nodes[0]
      node.width = Math.max(10, config.nodeWidth)
      node.x0 = 0
      node.x1 = 0
      node.y0 = 0
      node.y1 = sankeyHeight
    }

    // Fix node dimmensions if they are too small.
    nodes.forEach(node => {
      const dy = node.y1 - node.y0
      if (dy < 1) {
        node.y0 = node.y0 - (0.5 - dy * 0.5)
        node.y1 = node.y0 + 1
      }
    })
  }

  private _getSankeyHeight (): number {
    const { config, datamodel: { links } } = this

    return clamp(config.height * links.length * config.heightNormalizationCoeff, config.height / 2, config.height)
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
