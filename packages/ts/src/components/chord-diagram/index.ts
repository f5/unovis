import { Selection } from 'd3-selection'
import { nest } from 'd3-collection'
import { hierarchy, partition } from 'd3-hierarchy'
import { arc, line } from 'd3-shape'
import { scalePow, ScalePower } from 'd3-scale'
import { max } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Utils
import { getNumber, isNumber, groupBy, getString, getValue } from 'utils/data'
import { estimateStringPixelLength } from 'utils/text'

// Types
import { GraphNodeCore } from 'types/graph'
import { Spacing } from 'types/spacing'
import { Curve } from 'types/curve'

// Local Types
import {
  ChordInputNode,
  ChordInputLink,
  ChordDiagramData,
  ChordHierarchy,
  ChordNode,
  ChordRibbon,
  ChordLabelAlignment,
  ChordLeafNode,
  ChordRibbonPoint,
} from './types'

// Config
import { ChordDiagramConfig, ChordDiagramConfigInterface } from './config'

// Modules
import { createNode, updateNode, removeNode } from './modules/node'
import { createLabel, updateLabel, removeLabel, LABEL_PADDING } from './modules/label'
import { createLink, updateLink, removeLink } from './modules/link'

// Styles
import * as s from './style'


export class ChordDiagram<
  N extends ChordInputNode,
  L extends ChordInputLink,
> extends ComponentCore<
  ChordDiagramData<N, L>,
  ChordDiagramConfig<N, L>,
  ChordDiagramConfigInterface<N, L>
  > {
  static selectors = s
  config: ChordDiagramConfig<N, L> = new ChordDiagramConfig()
  datamodel: GraphDataModel<N, L> = new GraphDataModel()

  nodeGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  linkGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  labelGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  arcGen = arc<ChordNode<N>>()
  radiusScale: ScalePower<number, number> = scalePow()
  private _nodes: ChordNode<N>[] = []
  private _links: ChordRibbon<N>[] = []
  private _rootNode: ChordNode<N>

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

  constructor (config?: ChordDiagramConfigInterface<N, L>) {
    super()
    if (config) this.config.init(config)
    this.linkGroup = this.g.append('g').attr('class', s.links)
    this.nodeGroup = this.g.append('g').attr('class', s.nodes)
    this.labelGroup = this.g.append('g').attr('class', s.labels)
  }

  get bleed (): Spacing {
    const { config } = this
    let top = 0; let bottom = 0; let right = 0; let left = 0
    const padding = 4 + LABEL_PADDING * 2
    this._nodes.forEach(n => {
      const nodeLabelAlignment = getValue(n.data, config.nodeLabelAlignment)
      if (n.height === 0 && nodeLabelAlignment === ChordLabelAlignment.Perpendicular) {
        const labelWidth = estimateStringPixelLength(getString(n.data, config.nodeLabel) ?? '', 16)
        const [x, y] = this.arcGen.centroid(n)

        if (x < 0) left = Math.max(left, labelWidth)
        else right = Math.max(right, labelWidth)

        if (y < 0) top = Math.max(top, labelWidth)
        else bottom = Math.max(bottom, labelWidth)
      }
    })
    left += padding
    right += padding
    bottom += padding
    top += padding
    return { top, bottom, left, right }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, config: { radiusScaleExponent }, radiusScale } = this
    const nodes = this._getHierarchyNodes()
    const duration = isNumber(customDuration) ? customDuration : config.duration

    this.arcGen
      .startAngle(d => Number.isNaN(d.x0) ? 0 : d.x0)
      .endAngle(d => Number.isNaN(d.x1) ? 0 : d.x1)
      .cornerRadius(d => getNumber(d, config.cornerRadius))
      .innerRadius(d => this.radiusScale(d.y1) - getNumber(d, config.nodeWidth))
      .outerRadius(d => this.radiusScale(d.y1))

    const linkLineGen = line().curve(Curve.catmullRom.alpha(0.25))

    const hierarchyData = hierarchy<ChordHierarchy<GraphNodeCore<N, L>> | GraphNodeCore<N, L>>(
      nodes,
      d => (d as ChordHierarchy<GraphNodeCore<N, L>>).values
    )
      .sum((d) => (d as GraphNodeCore<N, L>)._state?.value)

    const partitionData = partition<N | ChordHierarchy<GraphNodeCore<N, L>>>().size([config.angleRange[1], 1])(hierarchyData) as ChordNode<N>
    this._calculateRadialPosition(partitionData)

    const size = Math.min(this._width, this._height)
    const radius = size / 2 - max([this.bleed.top, this.bleed.bottom, this.bleed.left, this.bleed.right])
    const labelWidth = size - radius - config.nodeWidth

    radiusScale
      .exponent(radiusScaleExponent)
      .range([0, radius])

    const partitionDataWithRoot = partitionData.descendants()
    this._rootNode = partitionDataWithRoot.find(d => d.depth === 0)
    this._nodes = partitionDataWithRoot.filter(d => d.depth !== 0) // Filter out the root node
    this._links = this._getRibbons(partitionData)

    // Create Node and Link state objects
    this._nodes.forEach((node, i) => {
      node.uid = `${this.uid}-n${i}`
      node._state = {}
    })
    this._links.forEach(link => { link._state = {} })

    // Center the view
    this.g.attr('transform', `translate(${this._width / 2},${this._height / 2})`)

    // Links
    const linksSelection = this.linkGroup
      .selectAll<SVGPathElement, ChordRibbon<N>>(`.${s.link}`)
      .data(this._links, d => String(d.data._id))

    const linksEnter = linksSelection.enter().append('path')
      .attr('class', s.link)
      .call(createLink, linkLineGen)

    const linksMerged = linksSelection.merge(linksEnter)
    linksMerged.call(updateLink, config, linkLineGen, duration)

    linksSelection.exit()
      .call(removeLink, duration)

    // Nodes
    const nodesSelection = this.nodeGroup
      .selectAll<SVGPathElement, ChordNode<N>>(`.${s.node}`)
      .data(this._nodes, d => String(d.uid))

    const nodesEnter = nodesSelection.enter().append('path')
      .attr('class', s.node)
      .call(createNode, config)

    const nodesMerged = nodesSelection.merge(nodesEnter)
    nodesMerged.call(updateNode, config, this.arcGen, duration)

    nodesSelection.exit()
      .call(removeNode, duration)

    // Labels
    const labels = this.labelGroup
      .selectAll<SVGGElement, ChordNode<N>>(`.${s.gLabel}`)
      .data(this._nodes, d => String(d.uid))

    const labelEnter = labels.enter().append('g')
      .attr('class', s.gLabel)
      .call(createLabel, config, radiusScale)

    const labelsMerged = labels.merge(labelEnter)
    labelsMerged.call(updateLabel, config, labelWidth, radiusScale, duration)

    labels.exit()
      .attr('class', s.labelExit)
      .call(removeLabel, duration)
  }

  private _getHierarchyNodes (): ChordHierarchy<GraphNodeCore<N, L>> {
    const { config, datamodel: { nodes, links } } = this
    nodes.forEach(n => { delete n._state.value })
    links.forEach(l => {
      delete l._state.points
      l.source._state.value = (l.source._state.value || 0) + getNumber(l, config.linkValue)
      l.target._state.value = (l.target._state.value || 0) + getNumber(l, config.linkValue)
    })

    // TODO: Replace with d3-group
    const nestGen = nest<N>()
    config.nodeLevels.forEach(levelAccessor => {
      nestGen.key(d => d[levelAccessor])
    })

    return { key: 'root', values: nestGen.entries(nodes) }
  }

  private _getRibbons (partitionData: ChordNode<N>): ChordRibbon<N>[] {
    const { config, datamodel: { links } } = this
    const findNode = (
      nodes: ChordLeafNode<N>[],
      id: string
    ): ChordLeafNode<N> => nodes.find(n => n.data._id === id)
    const leafNodes = partitionData.leaves() as ChordLeafNode<N>[]

    type LinksArrayType = typeof links
    const groupedBySource: Record<string, LinksArrayType> = groupBy(links, d => d.source._id)
    const groupedByTarget: Record<string, LinksArrayType> = groupBy(links, d => d.target._id)

    const getNodesInRibbon = (
      source: ChordLeafNode<N>,
      target: ChordLeafNode<N>,
      partitionHeight: number,
      nodes: ChordLeafNode<N>[] = []
    ): ChordNode<N>[] => {
      nodes[source.height] = source
      nodes[partitionHeight * 2 - target.height] = target
      if (source.parent && target.parent) getNodesInRibbon(source.parent, target.parent, partitionHeight, nodes)
      return nodes
    }

    const calculatePoints = (
      links: LinksArrayType,
      type: 'in' | 'out',
      depth: number
    ): void => {
      links.forEach(link => {
        if (!link._state.points) link._state.points = []
        const sourceLeaf = findNode(leafNodes, link.source._id)
        const targetLeaf = findNode(leafNodes, link.target._id)
        const nodesInRibbon = getNodesInRibbon(
          type === 'out' ? sourceLeaf : targetLeaf,
          type === 'out' ? targetLeaf : sourceLeaf,
          partitionData.height)
        const currNode = nodesInRibbon[depth]
        const len = currNode.x1 - currNode.x0
        const x0 = currNode._prevX1 ?? currNode.x0
        const x1 = x0 + len * getNumber(link, config.linkValue) / currNode.value
        currNode._prevX1 = x1

        const pointIdx = type === 'out' ? depth : partitionData.height * 2 - 1 - depth
        link._state.points[pointIdx] = this._convertRadialToCartesian(
          Math.min(x0, x1),
          Math.max(x0, x1),
          currNode.y1,
          config.nodeWidth
        )
      })
    }

    leafNodes.forEach(leafNode => {
      const outLinks = groupedBySource[leafNode.data._id] || []
      const inLinks = groupedByTarget[leafNode.data._id] || []
      for (let depth = 0; depth < partitionData.height; depth += 1) {
        calculatePoints(outLinks, 'out', depth)
        calculatePoints(inLinks, 'in', depth)
      }
    })

    const ribbons = links.map(l => {
      const sourceNode = findNode(leafNodes, l.source._id)
      const targetNode = findNode(leafNodes, l.target._id)

      return {
        source: sourceNode,
        target: targetNode,
        data: l,
        points: l._state.points,
        _state: {},
      }
    })

    return ribbons
  }

  private _convertRadialToCartesian (x0: number, x1: number, y: number, nodeWidth: number): ChordRibbonPoint {
    const r = Math.max(this.radiusScale(y) - nodeWidth, 0)
    const a0 = x0 - Math.PI / 2
    const a1 = x1 - Math.PI / 2

    return {
      a0,
      a1,
      r,
      x0: r * Math.cos(a0),
      x1: r * Math.cos(a1),
      y0: r * Math.sin(a0),
      y1: r * Math.sin(a1),
    }
  }

  private _calculateRadialPosition (
    hierarchyNode: ChordNode<N>,
    scalingCoeff = 0.95,
    nodePadding = 0.02
  ): void {
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

  private _onNodeMouseOver (d: ChordNode<N>): void {
    let ribbons: ChordRibbon<N>[]
    if (d.children) {
      const leaves = d.leaves() as ChordLeafNode<N>[]
      ribbons = this._links.filter(l =>
        leaves.find(leaf => l.source.data.id === leaf.data.id || l.target.data.id === leaf.data.id)
      )
    } else {
      const leaf = d as ChordLeafNode<N>
      ribbons = this._links.filter(l => l.source.data.id === leaf.data.id || l.target.data.id === leaf.data.id)
    }
    this._highlightOnHover(ribbons)
  }

  private _onNodeMouseOut (): void {
    this._highlightOnHover()
  }

  private _onLinkMouseOver (d: ChordRibbon<N>): void {
    this._highlightOnHover([d])
  }

  private _onLinkMouseOut (): void {
    this._highlightOnHover()
  }

  private _highlightOnHover (links?: ChordRibbon<N>[]): void {
    if (links) {
      links.forEach(l => {
        l._state.hovered = true
        const sourcePath = (l.source as ChordNode<N>).path(this._rootNode)
        const targetPath = (l.target as ChordNode<N>).path(this._rootNode)
        sourcePath.forEach(n => { if (n.depth) n._state.hovered = true })
        targetPath.forEach(n => { if (n.depth) n._state.hovered = true })
      })
    } else {
      this._nodes.forEach(n => { delete n._state.hovered })
      this._links.forEach(l => { delete l._state.hovered })
    }

    this.nodeGroup.selectAll<SVGPathElement, ChordNode<N>>(`.${s.node}`)
      .classed(s.hoveredNode, d => d._state.hovered)
    this.linkGroup.selectAll<SVGPathElement, ChordRibbon<N>>(`.${s.link}`)
      .classed(s.hoveredLink, d => d._state.hovered)

    this.g.classed(s.transparent, !!links)
  }
}
