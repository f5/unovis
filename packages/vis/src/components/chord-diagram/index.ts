// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, BaseType } from 'd3-selection'
import { hierarchy, HierarchyRectangularNode, partition } from 'd3-hierarchy'
import { arc, area, CurveCatmullRomFactory, CurveFactory } from 'd3-shape'
import { scalePow } from 'd3-scale'
import { sum, max } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { getValue, isNumber, groupBy } from 'utils/data'

// Types
import { Spacing } from 'types/misc'
import { Hierarchy, Link, LabelType } from 'types/radial-dendrogram'
import { Curve } from 'types/curves'

// Config
import { ChordDiagramConfig, ChordDiagramConfigInterface } from './config'

// Modules
import { createNode, updateNode, removeNode } from './modules/node'
import { createLabel, updateLabel, removeLabel } from './modules/label'
import { createLink, updateLink, removeLink } from './modules/link'

// Styles
import * as s from './style'

interface HNode<T> extends HierarchyRectangularNode<T> {
  _state?: { hovered?: boolean };
}

interface HLink<T> extends Link<T> {
  _state?: { hovered?: boolean };
}

export class ChordDiagram<H extends Hierarchy, L extends Link<H>> extends ComponentCore<{ nodes: H; links: L[]}> {
  static selectors = s
  config: ChordDiagramConfig<H> = new ChordDiagramConfig()
  nodeGroup: Selection<SVGGElement, HierarchyRectangularNode<H>[], SVGGElement, HierarchyRectangularNode<H>[]>
  linkGroup: Selection<SVGGElement, Link<H>[], SVGGElement, Link<H>[]>
  labelGroup: Selection<SVGGElement, HierarchyRectangularNode<H>[], SVGGElement, HierarchyRectangularNode<H>[]>
  arcGen = arc<HierarchyRectangularNode<H>>()
  radiusScale = scalePow()
  linkAreaGen = area<HierarchyRectangularNode<H>>()
  private _nodes: HNode<H>[] = []
  private _links: L[] = []
  private _rootNode: HNode<H>

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

  get bleed (): Spacing {
    return { top: 4, bottom: 4, left: 4, right: 4 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, config: { nodeLabelType, radiusScaleExponent }, radiusScale, datamodel: { data } } = this
    const { nodes } = data
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

    hierarchyData.sum(d => getValue(d, config.value))

    let radius = Math.min(config.width, config.height) / 2 - max([this.bleed.top, this.bleed.bottom, this.bleed.left, this.bleed.right])
    let ladelWidth = nodeLabelType === LabelType.PERPENDICULAR ? radius / (hierarchyData.height + 1) - config.nodeWidth : 0
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

    const linksMerged: Selection<BaseType, Link<H>, SVGGElement, Link<H>[]> = linksSelection.merge(linksEnter)
    linksMerged.call(updateLink, this.linkAreaGen, duration)

    const linksRemove: Selection<BaseType, Link<H>, SVGGElement, Link<H>[]> = linksSelection.exit()
    linksRemove.call(removeLink, duration)

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
      .call(removeLabel, duration)
  }

  _getRibbons (dendogram: HierarchyRectangularNode<H>): L[] {
    const { config, datamodel: { data } } = this
    const findNode = (nodes, id): HierarchyRectangularNode<H> => nodes.find(n => n.data.id === id)
    const leafNodes = dendogram.leaves()

    const getParentCoord = (parentNode, node, fromCoef, toCoef) => {
      const parentLength = parentNode.x1 - parentNode.x0
      const parentValue = parentNode.value
      let startValue = 0
      let endValue = parentValue
      for (let i = 0; i < parentNode.children.length; i += 1) {
        const child = parentNode.children[i]
        const childValue = child.value
        const nextChild = parentNode.children[i + 1]

        if (child.data.id === node.data.id) {
          if (nextChild) {
            endValue = startValue + childValue
          }
          break
        }
        startValue += childValue
      }
      const x0 = parentNode.x0 + (startValue / parentValue) * parentLength
      const x1 = parentNode.x0 + (endValue / parentValue) * parentLength
      const delta = x1 - x0

      const convertedCoord = this._convertRadialToCartesian(
        x0 + delta * fromCoef,
        x0 + delta * toCoef,
        parentNode.y1,
        getValue(parentNode, config.nodeWidth)
      )
      return convertedCoord
    }

    const getLeafCoord = (links, l, node, type = 'source') => {
      const totalValue = sum(links, (d: any) => d.value)
      const len = node.x1 - node.x0
      let x0 = node.x0
      let x1 = node.x1
      let fromCoef = 0
      let toCoef = 0
      for (let i = 0; i < links.length; i += 1) {
        const link = links[i]
        const value = link.value
        const nextLink = links[i + 1]
        if (link[type === 'source' ? 'target' : 'source'] === l[type === 'source' ? 'target' : 'source']) {
          if (nextLink) {
            toCoef = fromCoef + value
            x1 = x0 + (value / totalValue) * len
          } else {
            toCoef = fromCoef + value
          }
          break
        }
        fromCoef += value
        x0 += (value / totalValue) * len
      }
      const convertedCoord = this._convertRadialToCartesian(
        type === 'source' ? x0 : x1,
        type === 'source' ? x1 : x0,
        node.y1,
        getValue(node, config.nodeWidth)
      )

      return { convertedCoord, childCoef: toCoef / totalValue, parentCoef: fromCoef / totalValue }
    }

    const groupedBySource = groupBy(data.links, d => d.source)
    const groupedByTarget = groupBy(data.links, d => d.target)

    const ribbons = data.links.map(l => {
      const sourceNode = findNode(leafNodes, l.source)
      const targetNode = findNode(leafNodes, l.target)

      const allSourceLinks = [...groupedBySource[l.source], ...(groupedByTarget[l.source] ?? [])]
      const allTargetLinks = [...(groupedBySource[l.target] ?? []), ...groupedByTarget[l.target]]

      const sourceInfo = getLeafCoord(allSourceLinks, l, sourceNode, 'source')
      const sourceCoord = sourceInfo.convertedCoord
      const sourceParentCoord = getParentCoord(sourceNode.parent, sourceNode, sourceInfo.parentCoef, sourceInfo.childCoef)

      const targetInfo = getLeafCoord(allTargetLinks, l, targetNode, 'target')
      const targetCoord = targetInfo.convertedCoord
      const targetParentCoord = getParentCoord(targetNode.parent, targetNode, targetInfo.childCoef, targetInfo.parentCoef)

      // sourceNode._xPrev += l.value / sourceNode.value
      const points = [
        // { x0: sourceNode._xPrev, x1: sourceNode.sourceNode._xPrev * l.value / sourceNode.value, y0: sourceNode.y0, y1: sourceNode.y1 },

        { x0: sourceCoord.x0, x1: sourceCoord.x1, y0: sourceCoord.y0, y1: sourceCoord.y1 },
        { x0: sourceParentCoord.x0, x1: sourceParentCoord.x1, y0: sourceParentCoord.y0, y1: sourceParentCoord.y1 },
        { x0: targetParentCoord.x0, x1: targetParentCoord.x1, y0: targetParentCoord.y0, y1: targetParentCoord.y1 },
        { x0: targetCoord.x0, x1: targetCoord.x1, y0: targetCoord.y0, y1: targetCoord.y1 },
      ]
      return {
        source: sourceNode,
        target: targetNode,
        points,
      } as L
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
      const childrens = d.descendants()
      links = this._links.filter(l => childrens.find(d => l.source.data.id === d.data.id || l.target.data.id === d.data.id))
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

  _highlightOnHover (links?: L[]): void {
    if (links) {
      links.forEach((l: HLink<H>) => {
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
  }
}
