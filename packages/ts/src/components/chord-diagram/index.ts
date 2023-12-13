import { max } from 'd3-array'
import { partition } from 'd3-hierarchy'
import { Selection } from 'd3-selection'
import { scalePow, ScalePower } from 'd3-scale'
import { arc } from 'd3-shape'

// Core
import { ComponentCore } from 'core/component'
import { GraphData, GraphDataModel } from 'data-models/graph'

// Utils
import { getNumber, isNumber, getString, getValue } from 'utils/data'
import { estimateStringPixelLength } from 'utils/text'

// Types
import { Spacing } from 'types/spacing'

// Local Types
import { ChordInputNode, ChordInputLink, ChordDiagramData, ChordNode, ChordRibbon, ChordLabelAlignment, ChordLeafNode } from './types'

// Config
import { ChordDiagramDefaultConfig, ChordDiagramConfigInterface } from './config'

// Modules
import { createNode, updateNode, removeNode } from './modules/node'
import { createLabel, updateLabel, removeLabel, LABEL_PADDING } from './modules/label'
import { getHierarchyNodes, getRibbons, positionChildren } from './modules/layout'
import { createLink, updateLink, removeLink } from './modules/link'

// Styles
import * as s from './style'

export class ChordDiagram<
  N extends ChordInputNode,
  L extends ChordInputLink,
> extends ComponentCore<
  ChordDiagramData<N, L>,
  ChordDiagramConfigInterface<N, L>
  > {
  static selectors = s
  protected _defaultConfig = ChordDiagramDefaultConfig as ChordDiagramConfigInterface<N, L>
  public config: ChordDiagramConfigInterface<N, L> = this._defaultConfig
  datamodel: GraphDataModel<N, L> = new GraphDataModel()

  background: Selection<SVGRectElement, unknown, SVGGElement, unknown>
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
    [ChordDiagram.selectors.label]: {
      mouseover: this._onNodeMouseOver.bind(this),
      mouseout: this._onNodeMouseOut.bind(this),
    },
  }

  private get _forceHighlight (): boolean {
    return this.config.highlightedNodeId !== undefined || this.config.highlightedLinkIds?.length > 0
  }

  constructor (config?: ChordDiagramConfigInterface<N, L>) {
    super()
    if (config) this.setConfig(config)
    this.background = this.g.append('rect').attr('class', s.background)
    this.linkGroup = this.g.append('g').attr('class', s.links)
    this.nodeGroup = this.g.append('g').attr('class', s.nodes)
    this.labelGroup = this.g.append('g').attr('class', s.labels)
  }

  get bleed (): Spacing {
    const { config } = this
    const padding = 4 + LABEL_PADDING * 2
    let top = 0; let bottom = 0; let right = 0; let left = 0
    this._nodes.forEach(n => {
      const nodeLabelAlignment = getValue(n.data, config.nodeLabelAlignment)
      if (n.height === 0 && nodeLabelAlignment === ChordLabelAlignment.Perpendicular) {
        const labelWidth = estimateStringPixelLength(getString(n.data as N, config.nodeLabel) ?? '', 16)
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

  setSize (width: number, height: number, containerWidth: number, containerHeight: number): void {
    super.setSize(width, height, containerWidth, containerHeight)

    // Setting radius for initial bleed calculation. This ensures the correct radius is set when render is called
    this.radiusScale
      .exponent(this.config.radiusScaleExponent)
      .range([0, Math.min(width, height) / 2])
  }

  setData (data: GraphData<N, L>): void {
    super.setData(data)
    this._layoutData()
  }

  _layoutData (): void {
    const { nodes, links } = this.datamodel
    const { padAngle, linkValue, nodeLevels } = this.config
    nodes.forEach(n => { delete n._state.value })
    links.forEach(l => {
      delete l._state.points
      l._state.value = getNumber(l, linkValue)
      l.source._state.value = (l.source._state.value || 0) + getNumber(l, linkValue)
      l.target._state.value = (l.target._state.value || 0) + getNumber(l, linkValue)
    })

    const root = getHierarchyNodes(nodes, d => d._state?.value, nodeLevels)

    const partitionData = partition().size([this.config.angleRange[1], 1])(root) as ChordNode<N>
    partitionData.each((n, i) => {
      positionChildren(n, padAngle)
      n.uid = `${this.uid.substr(0, 4)}-${i}`
      n.x0 = Number.isNaN(n.x0) ? 0 : n.x0
      n.x1 = Number.isNaN(n.x1) ? 0 : n.x1
      n._state = {}
    })

    const partitionDataWithRoot = partitionData.descendants()
    this._rootNode = partitionDataWithRoot.find(d => d.depth === 0)
    this._nodes = partitionDataWithRoot.filter(d => d.depth !== 0) // Filter out the root node
    this._links = getRibbons<N>(partitionData, links, padAngle)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, bleed } = this

    this._layoutData()
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const size = Math.min(this._width, this._height)
    const radius = size / 2 - max([bleed.top, bleed.bottom, bleed.left, bleed.right])

    this.radiusScale.range([0, radius - config.nodeWidth])

    this.arcGen
      .startAngle(d => d.x0 + config.padAngle / 2 - (d.value ? 0 : Math.PI / 360))
      .endAngle(d => d.x1 - config.padAngle / 2 + (d.value ? 0 : Math.PI / 360))
      .cornerRadius(d => getNumber(d.data, config.cornerRadius))
      .innerRadius(d => this.radiusScale(d.y1) - getNumber(d, config.nodeWidth))
      .outerRadius(d => this.radiusScale(d.y1))

    this.g.classed(s.transparent, this._forceHighlight)
    this.background
      .attr('width', this._width)
      .attr('height', this._height)
      .style('opacity', 0)

    // Center the view
    this.nodeGroup.attr('transform', `translate(${this._width / 2},${this._height / 2})`)
    this.labelGroup.attr('transform', `translate(${this._width / 2},${this._height / 2})`)
    this.linkGroup.attr('transform', `translate(${this._width / 2},${this._height / 2})`)

    // Links
    const linksSelection = this.linkGroup
      .selectAll<SVGPathElement, ChordRibbon<N>>(`.${s.link}`)
      .data(this._links, d => String(d.data._id))
      .classed(s.highlightedLink, l => {
        const linkId = l.data.id ?? l.data._indexGlobal
        return config.highlightedLinkIds?.includes(linkId)
      })

    const linksEnter = linksSelection.enter().append('path')
      .attr('class', s.link)
      .call(createLink, this.radiusScale)

    const linksMerged = linksSelection.merge(linksEnter)
    linksMerged.call(updateLink, config, this.radiusScale, duration)

    linksSelection.exit()
      .call(removeLink, duration)

    // Nodes
    const nodesSelection = this.nodeGroup
      .selectAll<SVGPathElement, ChordNode<N>>(`.${s.node}`)
      .data(this._nodes, d => String(d.uid))
      .classed(s.highlightedNode, d => config.highlightedNodeId === d.data._id)

    const nodesEnter = nodesSelection.enter().append('path')
      .attr('class', s.node)
      .call(createNode, config)

    const nodesMerged = nodesSelection.merge(nodesEnter)
    nodesMerged.call(updateNode, config, this.arcGen, duration, this.bleed)

    nodesSelection.exit()
      .call(removeNode, duration)

    // Labels
    const labelWidth = size - radius - config.nodeWidth
    const labels = this.labelGroup
      .selectAll<SVGGElement, ChordNode<N>>(`.${s.label}`)
      .data(this._nodes, d => String(d.uid))

    const labelEnter = labels.enter().append('g')
      .attr('class', s.label)
      .call(createLabel, config, this.radiusScale)

    const labelsMerged = labels.merge(labelEnter)
    labelsMerged.call(updateLabel, config, labelWidth, this.radiusScale, duration)

    labels.exit()
      .attr('class', s.labelExit)
      .call(removeLabel, duration)
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

    // Nodes without links should still be highlighted
    if (!ribbons.length) d._state.hovered = true
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
    if (this._forceHighlight) return
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
      .classed(s.highlightedNode, d => d._state.hovered)
    this.linkGroup.selectAll<SVGPathElement, ChordRibbon<N>>(`.${s.link}`)
      .classed(s.highlightedLink, d => d._state.hovered)

    this.g.classed(s.transparent, !!links)
  }
}
