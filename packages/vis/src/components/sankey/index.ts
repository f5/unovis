// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { sankey } from 'd3-sankey'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Utils
import { getValue } from 'utils/data'

// Config
import { SankeyConfig, SankeyConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { removeLinks, createLinks, updateLinks } from './modules/link'
import { removeNodes, createNodes, updateNodes, onNodeMouseOver, onNodeMouseOut } from './modules/node'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from './modules/types'

export class Sankey<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentCore<{nodes: N[]; links: L[]}> {
  static selectors = s
  config: SankeyConfig<N, L> = new SankeyConfig()
  datamodel: GraphDataModel<N, L> = new GraphDataModel()
  private _linksGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _nodesGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _sankey = sankey()
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

  _render (customDuration?: number): void {
    this._prepareLayout()
    const nodes = this.datamodel.nodes
    const links = this.datamodel.links
    if (!((links.length > 0 && nodes.length > 1) || (links.length > 0 && nodes.length > 0 && this.config.showSingleNode))) return

    // Links
    const svgLinks = this._linksGroup.selectAll(`.${s.link}`).data(links)
    svgLinks.call(removeLinks)
    const linkGrpoupEnter = svgLinks.enter().append('g').attr('class', s.link)
    linkGrpoupEnter.call(createLinks)
    svgLinks.merge(linkGrpoupEnter).call(updateLinks, this.config)

    // Nodes
    const svgNodes = this._nodesGroup.selectAll(`.${s.node}`).data(nodes)
    svgNodes.call(removeNodes)
    const svgNodesEnter = svgNodes.enter().append('g').attr('class', s.node)
    svgNodesEnter.call(createNodes, this.config)
    svgNodes.merge(svgNodesEnter).call(updateNodes, this.config, this._sankey)
  }

  _prepareLayout (): void {
    const { config } = this
    const nodes = this.datamodel.nodes
    const links = this.datamodel.links
    links.forEach(link => {
      // For d3 sankey function each link must be an object with the `value` property
      link.value = getValue(link, d => getValue(d, config.linkFlow))
    })

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
      .nodeWidth(config.nodeWidth)
      .nodePadding(config.nodePadding)
      .size([config.width, config.height])
      .nodeId(d => d.id)
      .iterations(32)

    if (links.length > 0 && links.length > 1) this._sankey({ nodes, links })
    if (links.length === 0 && nodes.length === 1) {
      const node = nodes[0]
      node.width = Math.max(10, config.nodeWidth)
      node.x0 = 0
      node.x1 = 0
      node.y0 = 0
      node.y1 = config.height
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

  _onNodeMouseOver (d, i, els): void {
    onNodeMouseOver(select(els[i]), this.config)
    this._onEvent(d, i, els)
  }

  _onNodeMouseOut (d, i, els): void {
    onNodeMouseOut(select(els[i]), this.config)
    this._onEvent(d, i, els)
  }
}
