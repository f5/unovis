// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { nest } from 'd3-collection'
import { hierarchy, HierarchyRectangularNode, partition } from 'd3-hierarchy'
import { arc, area, CurveCatmullRomFactory, CurveFactory } from 'd3-shape'
import { scalePow, ScalePower } from 'd3-scale'
import { max } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Utils
import { getValue, isNumber, groupBy } from 'utils/data'

// Types
import { Spacing } from 'types/misc'
import { Hierarchy, LabelType, HNode, HLink, Ribbon } from 'components/radial-dendrogram/types'
import { Curve } from 'types/curves'

// Local Types
import { ChordInputNode, ChordInputLink } from './types'

// Config
import { ChordDiagramConfig, ChordDiagramConfigInterface } from './config'

// Modules
import { createNode, updateNode, removeNode } from './modules/node'
import { createLabel, updateLabel, removeLabel } from './modules/label'
import { createLink, updateLink, removeLink } from './modules/link'

// Styles
import * as s from './style'

export class ChordDiagram<H extends Hierarchy, N extends ChordInputNode, L extends ChordInputLink> extends ComponentCore<{ nodes: N[]; links?: L[] }> {
  static selectors = s
  config: ChordDiagramConfig<H> = new ChordDiagramConfig()
  datamodel: GraphDataModel<N, L> = new GraphDataModel()

  nodeGroup: Selection<SVGGElement, HierarchyRectangularNode<H>[], SVGGElement, HierarchyRectangularNode<H>[]>
  linkGroup: Selection<SVGGElement, Ribbon<H>[], SVGGElement, Ribbon<H>[]>
  labelGroup: Selection<SVGGElement, HierarchyRectangularNode<H>[], SVGGElement, HierarchyRectangularNode<H>[]>
  arcGen = arc<HierarchyRectangularNode<H>>()
  radiusScale: ScalePower<number, number> = scalePow()
  linkAreaGen = area<HierarchyRectangularNode<H>>()
  private _nodes: HNode<H>[] = []
  private _links: Ribbon<H>[] = []
  private _rootNode: HNode<H>
  private _hierarchyNodes

  events = {
    [ChordDiagram.selectors.node]: {
      mouseover: this._onNodeMouseOver.bind(this),
      mouseout: this._onNodeMouseOut.bind(this),
    },
    [ChordDiagram.selectors.link]: {
      mouseover: this._onLinkMouseOver.bind(this),
      mouseout: this._onLinkMouseOut.bind(this),
    },
  }

  constructor (config?: ChordDiagramConfigInterface<H>) {
    super()
    if (config) this.config.init(config)
    this.linkGroup = this.g.append('g')
    this.nodeGroup = this.g.append('g')
    this.labelGroup = this.g.append('g')
  }

  setData (data: GraphDataModel<N, L>): void {
    this.datamodel.data = data
    this._hierarchyNodes = this._getHierarchyNodes()
  }

  setConfig (config?: ChordDiagramConfigInterface<H>): void {
    super.setConfig(config)
    this._hierarchyNodes = this._getHierarchyNodes()
  }

  get bleed (): Spacing {
    return { top: 4, bottom: 4, left: 4, right: 4 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, config: { nodeLabelType, radiusScaleExponent }, radiusScale } = this
    const nodes = this._hierarchyNodes
    const duration = isNumber(customDuration) ? customDuration : config.duration

    this.arcGen
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .cornerRadius(d => getValue(d, config.cornerRadius))
      .innerRadius(d => this.radiusScale(d.y1) - getValue(d, config.nodeWidth))
      .outerRadius(d => this.radiusScale(d.y1))

    const curveGen = Curve[config.curveType]
    if ('alpha' in curveGen) (curveGen as CurveCatmullRomFactory).alpha?.(0.25)
    this.linkAreaGen
      .x0(d => d.x0)
      .x1(d => d.x1)
      .y0(d => d.y0)
      .y1(d => d.y1)
      .curve(curveGen as CurveFactory)

    const hierarchyData = hierarchy(nodes, d => config.children(d))

    hierarchyData.sum(d => d._state?.value)

    let radius = Math.min(config.width, config.height) / 2 - max([this.bleed.top, this.bleed.bottom, this.bleed.left, this.bleed.right])
    let ladelWidth = nodeLabelType === LabelType.Perpendicular ? radius / (hierarchyData.height + 1) - config.nodeWidth : 0
    radius = radius - ladelWidth
    radiusScale
      .exponent(radiusScaleExponent)
      .range([0, radius])
    ladelWidth -= ladelWidth / (hierarchyData.height + 1)

    const dendogram = partition<H>().size([config.angleRange[1], 1])(hierarchyData)
    this._calculateRadialPosition(dendogram)

    const dendogramDataWithRoot = dendogram.descendants()
    this._rootNode = dendogramDataWithRoot.find(d => d.depth === 0)
    // Filter from the root node
    const dendogramData = dendogramDataWithRoot.filter(d => d.depth !== 0)
    this._nodes = dendogramData
    this._links = this._getRibbons(dendogram)
    this._nodes.forEach((node: HNode<H>) => { node._state = {} })
    this._links.forEach((link: HLink<H>) => { link._state = {} })

    this.g.attr('transform', `translate(${config.width / 2},${config.height / 2})`)

    // Links
    const linksSelection = this.linkGroup
      .selectAll(`.${s.link}`)
      .data(this._links)

    const linksEnter = linksSelection.enter().append('path')
      .attr('class', s.link)
      .call(createLink, this.linkAreaGen)

    const linksMerged = linksSelection.merge(linksEnter)
    linksMerged.call(updateLink, this.linkAreaGen, duration)

    linksSelection.exit()
      .call(removeLink, duration)

    // Nodes
    const nodesSelection = this.nodeGroup
      .selectAll(`.${s.node}`)
      .data(this._nodes)

    const nodesEnter = nodesSelection.enter().append('path')
      .attr('class', s.node)
      .call(createNode, config)

    const nodesMerged = nodesSelection.merge(nodesEnter)
    nodesMerged.call(updateNode, config, this.arcGen, duration)

    nodesSelection.exit()
      .call(removeNode, duration)

    // Labels
    const labels = this.labelGroup
      .selectAll(`.${s.gLabel}`)
      .data(this._nodes)

    const labelEnter = labels.enter().append('g')
      .attr('class', s.gLabel)
      .call(createLabel, config, radiusScale)

    const labelsMerged = labels.merge(labelEnter)
    labelsMerged.call(updateLabel, config, ladelWidth, radiusScale, duration)

    labels.exit()
      .attr('class', s.labelExit)
      .call(removeLabel, duration)
  }

  _getHierarchyNodes (): { values: N[] } {
    const { config: { nodeLevels, value }, datamodel: { nodes, links } } = this
    nodes.forEach((n: any) => { delete n._state.value })
    links.forEach((l: any) => {
      delete l._state.points
      l.source._state.value = (l.source._state.value || 0) + getValue(l, value)
      l.target._state.value = (l.target._state.value || 0) + getValue(l, value)
    })

    const nestGen = nest<any, any>()
    nodeLevels.forEach(levelAccessor => {
      nestGen.key(d => d[levelAccessor])
    })

    return { values: nestGen.entries(nodes) }
  }

  _getRibbons (dendogram: HierarchyRectangularNode<H>): Ribbon<H>[] {
    const { datamodel: { links } } = this
    const findNode = (nodes, id): HierarchyRectangularNode<H> => nodes.find(n => n.data.id === id)
    const leafNodes = dendogram.leaves()

    const groupedBySource = groupBy(links, d => d.source.id)
    const groupedByTarget = groupBy(links, d => d.target.id)

    const getNodesInRibbon = (source, target, dendrogramHeight, nodes: HNode<H>[] = []): HNode<H>[] => {
      nodes[source.height] = source
      nodes[dendrogramHeight * 2 - target.height] = target
      if (source.parent && target.parent) getNodesInRibbon(source.parent, target.parent, dendrogramHeight, nodes)
      return nodes
    }

    const calculatePoints = (links, type, depth): void => {
      links.forEach(link => {
        if (!link._state.points) link._state.points = []
        const sourceLeaf = findNode(leafNodes, link.source.id)
        const targetLeaf = findNode(leafNodes, link.target.id)
        const nodesInRibbon = getNodesInRibbon(
          type === 'out' ? sourceLeaf : targetLeaf,
          type === 'out' ? targetLeaf : sourceLeaf,
          dendogram.height)
        const currNode: HNode<H> = nodesInRibbon[depth]
        const len = currNode.x1 - currNode.x0
        const x0 = currNode._prevX1 ?? currNode.x0
        const x1 = x0 + len * link.value / currNode.value
        currNode._prevX1 = x1

        const converted = this._convertRadialToCartesian(
          type === 'out' ? x0 : x1,
          type === 'out' ? x1 : x0,
          currNode.y1, 0)
        const pointIdx = type === 'out' ? depth : dendogram.height * 2 - 1 - depth
        link._state.points[pointIdx] = { x0: converted.x0, x1: converted.x1, y0: converted.y0, y1: converted.y1 }
      })
    }

    leafNodes.forEach(leafNode => {
      const outlinks = groupedBySource[leafNode.data.id] || []
      const inlinks = groupedByTarget[leafNode.data.id] || []
      for (let depth = 0; depth < dendogram.height; depth += 1) {
        calculatePoints(outlinks, 'out', depth)
        calculatePoints(inlinks, 'in', depth)
      }
    })

    const ribbons = links.map((l: any) => {
      const sourceNode = findNode(leafNodes, l.source.id)
      const targetNode = findNode(leafNodes, l.target.id)

      return {
        source: sourceNode,
        target: targetNode,
        points: l._state.points,
      }
    })

    return ribbons
  }

  _convertRadialToCartesian (x0: number, x1: number, y: number, nodeWidth): { x0: number; x1: number; y0: number; y1: number } {
    const r0 = this.radiusScale(y) - nodeWidth / 2
    const a0 = x0 - Math.PI / 2
    const r1 = this.radiusScale(y) - nodeWidth / 2
    const a1 = x1 - Math.PI / 2

    return {
      x0: r0 * Math.cos(a0),
      x1: r1 * Math.cos(a1),
      y0: r0 * Math.sin(a0),
      y1: r1 * Math.sin(a1),
    }
  }

  _calculateRadialPosition (hierarchyNode: HierarchyRectangularNode<H>, scalingCoeff = 0.95, nodePadding = 0.02): void {
    if (!hierarchyNode.children) return

    // Calculate x0 and x1
    const nodeLength = (hierarchyNode.x1 - hierarchyNode.x0)
    const scaledNodeLength = nodeLength * scalingCoeff
    const delta = nodeLength - scaledNodeLength
    let x0 = hierarchyNode.x0 + delta / 2
    for (const node of hierarchyNode.children) {
      const childX0 = x0
      const childX1 = x0 + (node.value / hierarchyNode.value) * scaledNodeLength - nodePadding / 2
      const childNodeLength = childX1 - childX0
      const scaledChildNodeLength = childNodeLength * scalingCoeff
      const childDelta = childNodeLength - scaledChildNodeLength
      node.x0 = childX0 + childDelta / 2
      node.x1 = node.x0 + scaledChildNodeLength
      x0 = childX1 + nodePadding / 2 + childDelta / 2
    }
    // Go deeper in the hierarchy
    for (const node of hierarchyNode.children) {
      this._calculateRadialPosition(node, scalingCoeff, nodePadding)
    }
  }

  _onNodeMouseOver (d): void {
    let links = this._links.filter(l => l.source.data.id === d.data.id || l.target.data.id === d.data.id)
    if (!links.length) {
      const children = d.descendants()
      links = this._links.filter(l => children.find(d => l.source.data.id === d.data.id || l.target.data.id === d.data.id))
    }
    this._highlightOnHover(links)
  }

  _onNodeMouseOut (): void {
    this._highlightOnHover()
  }

  _onLinkMouseOver (d): void {
    this._highlightOnHover([d])
  }

  _onLinkMouseOut (): void {
    this._highlightOnHover()
  }

  _highlightOnHover (links?: HLink<H>[]): void {
    if (links) {
      links.forEach(l => {
        l._state.hovered = true
        const sourcePath = l.source.path(this._rootNode)
        const targetPath = l.target.path(this._rootNode)
        sourcePath.forEach((n: HNode<H>) => { if (n.depth) n._state.hovered = true })
        targetPath.forEach((n: HNode<H>) => { if (n.depth) n._state.hovered = true })
      })
    } else {
      this._nodes.forEach((n: HNode<H>) => { delete n._state.hovered })
      this._links.forEach((l: HLink<H>) => { delete l._state.hovered })
    }

    this.nodeGroup.selectAll(`.${s.node}`).classed(s.hoveredNode, (d: HNode<H>) => d._state.hovered)
    this.linkGroup.selectAll(`.${s.link}`).classed(s.hoveredLink, (d: HLink<H>) => d._state.hovered)
    this.g.classed(s.transparent, !!links)
  }
}
