// Copyright (c) Volterra, Inc. All rights reserved.
import { hierarchy, partition, HierarchyRectangularNode } from 'd3-hierarchy'
import { arc } from 'd3-shape'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { getValue, isNumber } from 'utils/data'

// Types
import { Spacing } from 'types/misc'
import { Hierarchy } from 'types/radial-dendrogram'

// Config
import { RadialDendrogramConfig, RadialDendrogramConfigInterface } from './config'

// Modules
import { createNode, updateNode, removeNode } from './modules/node'
import { createLabel, updateLabel, removeLabel } from './modules/label'

// Styles
import * as s from './style'

export class RadialDendrogram<H extends Hierarchy> extends ComponentCore<H> {
  static selectors = s
  config: RadialDendrogramConfig<H> = new RadialDendrogramConfig()
  arcGen = arc<HierarchyRectangularNode<H>>()

  events = {
    [RadialDendrogram.selectors.node]: {},
  }

  constructor (config?: RadialDendrogramConfigInterface<H>) {
    super()
    if (config) this.config.init(config)
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    this.arcGen
      .startAngle(d => config.angleRange[0] + d.x0)
      .endAngle(d => config.angleRange[0] + d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, getValue(d, config.padAngle)))
      .cornerRadius(d => getValue(d, config.cornerRadius))
      .innerRadius(d => d.y1 - getValue(d, config.nodeWidth))
      .outerRadius(d => d.y1)

    const hierarchyData = hierarchy(data, d => config.children(d))
    hierarchyData.sum(d => getValue(d, config.value))

    const radius = Math.min(config.width, config.height) / 2 - config.nodeWidth
    const dendogram = partition<H>().size([config.angleRange[1], radius])
    const dendogramData = dendogram(hierarchyData).descendants().filter(d => d.depth !== 0)

    this.g.attr('transform', `translate(${config.width / 2},${config.height / 2})`)

    // Nodes
    const nodes = this.g
      .selectAll(`.${s.node}`)
      .data(dendogramData)

    const nodesEnter = nodes.enter().append('path')
      .attr('class', s.node)
      .call(createNode, config)

    const nodesMerged = nodesEnter.merge(nodes)
    nodesMerged.call(updateNode, config, this.arcGen, duration)

    nodes.exit()
      .call(removeNode, duration)

    // Labels
    const ladelWidth = radius / (hierarchyData.height + 1) - config.nodeWidth
    const labels = this.g
      .selectAll(`.${s.gLabel}`)
      .data(dendogramData)

    const labelEnter = labels.enter().append('g')
      .attr('class', s.gLabel)
      .call(createLabel)

    const labelsMerged = labelEnter.merge(labels)
    labelsMerged.call(updateLabel, ladelWidth, duration)

    labels.exit()
      .call(removeLabel, duration)
  }
}
