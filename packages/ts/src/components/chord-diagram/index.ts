import { Selection } from 'd3-selection'
import { nest } from 'd3-collection'
import { hierarchy, partition } from 'd3-hierarchy'
import { arc, area, CurveCatmullRomFactory, CurveFactory } from 'd3-shape'
import { scalePow, ScalePower } from 'd3-scale'
import { max } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { GraphDataModel } from 'data-models/graph'

// Utils
import { getNumber, isNumber, groupBy } from 'utils/data'

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
import { createLabel, updateLabel, removeLabel } from './modules/label'
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
  linkAreaGen = area<ChordRibbonPoint>()
  private _nodes: ChordNode<N>[] = []
  private _links: ChordRibbon<N>[] = []
  private _rootNode: ChordNode<N>
  private _hierarchyNodes: ChordHierarchy<GraphNodeCore<N, L>>

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
    this.linkGroup = this.g.append('g').attr('class', s.nodes)
    this.nodeGroup = this.g.append('g').attr('class', s.links)
    this.labelGroup = this.g.append('g').attr('class', s.labels)
  }

  setData (data: { nodes: N[]; links?: L[] }): void {
    this.datamodel.data = data
    this._hierarchyNodes = this._getHierarchyNodes()
  }

  setConfig (config: ChordDiagramConfigInterface<N, L>): void {
    super.setConfig(config)
    this._hierarchyNodes = this._getHierarchyNodes()
  }

  get bleed (): Spacing {
    return { top: 4, bottom: 4, left: 4, right: 4 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, config: { nodeLabelAlignment, radiusScaleExponent }, radiusScale } = this
    const nodes = this._hierarchyNodes
    const duration = isNumber(customDuration) ? customDuration : config.duration

    this.arcGen
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .cornerRadius(d => getNumber(d, config.cornerRadius))
      .innerRadius(d => this.radiusScale(d.y1) - getNumber(d, config.nodeWidth))
      .outerRadius(d => this.radiusScale(d.y1))

    const curveGen = Curve[config.curveType]
    if ('alpha' in curveGen) (curveGen as CurveCatmullRomFactory).alpha?.(0.25)
    this.linkAreaGen
      .x0(d => d.x0)
      .x1(d => d.x1)
      .y0(d => d.y0)
      .y1(d => d.y1)
      .curve(curveGen as CurveFactory)

    const hierarchyData = hierarchy(nodes, (d: ChordHierarchy<GraphNodeCore<N, L>>) => d.values)
    hierarchyData.sum((d) => {
      return (d as GraphNodeCore<N, L>)._state?.value
    })

    let radius = Math.min(this._width, this._height) / 2 - max([this.bleed.top, this.bleed.bottom, this.bleed.left, this.bleed.right])
    let labelWidth = nodeLabelAlignment === ChordLabelAlignment.Perpendicular ? radius / (hierarchyData.height + 1) - config.nodeWidth : 0
    radius = radius - labelWidth
    radiusScale
      .exponent(radiusScaleExponent)
      .range([0, radius])
    labelWidth -= labelWidth / (hierarchyData.height + 1)

    const partitionData = partition<N | ChordHierarchy<GraphNodeCore<N, L>>>().size([config.angleRange[1], 1])(hierarchyData) as ChordNode<N>
    this._calculateRadialPosition(partitionData)

    const partitionDataWithRoot = partitionData.descendants()
    this._rootNode = partitionDataWithRoot.find(d => d.depth === 0)
    this._nodes = partitionDataWithRoot.filter(d => d.depth !== 0) // Filter out the root node
    this._links = this._getRibbons(partitionData)

    // Create Node and Link state objects
    this._nodes.forEach(node => { node._state = {} })
    this._links.forEach(link => { link._state = {} })

    // Center the view
    this.g.attr('transform', `translate(${this._width / 2},${this._height / 2})`)

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

    // Todo: replace with d3 group
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
    ): ChordLeafNode<N> => nodes.find(n => n.data.id === id)
    const leafNodes = partitionData.leaves() as ChordLeafNode<N>[]

    type LinksArrayType = typeof links
    const groupedBySource: Record<string, LinksArrayType> = groupBy(links, d => d.source.id)
    const groupedByTarget: Record<string, LinksArrayType> = groupBy(links, d => d.target.id)

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
        const sourceLeaf = findNode(leafNodes, link.source.id)
        const targetLeaf = findNode(leafNodes, link.target.id)
        const nodesInRibbon = getNodesInRibbon(
          type === 'out' ? sourceLeaf : targetLeaf,
          type === 'out' ? targetLeaf : sourceLeaf,
          partitionData.height)
        const currNode = nodesInRibbon[depth]
        const len = currNode.x1 - currNode.x0
        const x0 = currNode._prevX1 ?? currNode.x0
        const x1 = x0 + len * getNumber(link, config.linkValue) / currNode.value
        currNode._prevX1 = x1

        const converted = this._convertRadialToCartesian(
          type === 'out' ? x0 : x1,
          type === 'out' ? x1 : x0,
          currNode.y1, 0)
        const pointIdx = type === 'out' ? depth : partitionData.height * 2 - 1 - depth
        link._state.points[pointIdx] = { x0: converted.x0, x1: converted.x1, y0: converted.y0, y1: converted.y1 }
      })
    }

    leafNodes.forEach(leafNode => {
      const outLinks = groupedBySource[leafNode.data.id] || []
      const inLinks = groupedByTarget[leafNode.data.id] || []
      for (let depth = 0; depth < partitionData.height; depth += 1) {
        calculatePoints(outLinks, 'out', depth)
        calculatePoints(inLinks, 'in', depth)
      }
    })

    const ribbons = links.map((l) => {
      const sourceNode = findNode(leafNodes, l.source.id)
      const targetNode = findNode(leafNodes, l.target.id)

      return {
        source: sourceNode,
        target: targetNode,
        points: l._state.points,
        _state: {},
      }
    })

    return ribbons
  }

  private _convertRadialToCartesian (x0: number, x1: number, y: number, nodeWidth: number): { x0: number; x1: number; y0: number; y1: number } {
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

    this.nodeGroup.selectAll(`.${s.node}`).classed(s.hoveredNode, (d: ChordNode<N>) => d._state.hovered)
    this.linkGroup.selectAll(`.${s.link}`).classed(s.hoveredLink, (d: ChordRibbon<N>) => d._state.hovered)
    this.g.classed(s.transparent, !!links)
  }
}
