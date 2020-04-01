// Copyright (c) Volterra, Inc. All rights reserved.
import { hierarchy, partition, HierarchyRectangularNode } from 'd3-hierarchy'
import { arc } from 'd3-shape'
import { interpolate } from 'd3-interpolate'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { getValue, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { Spacing } from 'types/misc'

// Config
import { RadialDendrogramConfig, RadialDendrogramConfigInterface } from './config'

// Styles
import * as s from './style'

export class RadialDendrogram<HirerarchyData> extends ComponentCore<HirerarchyData> {
  static selectors = s
  config: RadialDendrogramConfig<HirerarchyData> = new RadialDendrogramConfig()
  arcGen = arc<HierarchyRectangularNode<HirerarchyData>>()

  events = {
    [RadialDendrogram.selectors.node]: {},
  }

  constructor (config?: RadialDendrogramConfigInterface<HirerarchyData>) {
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

    const radius = Math.min(config.width, config.height) / 2
    const dendogram = partition<HirerarchyData>().size([config.angleRange[1], radius])
    const dendogramData = dendogram(hierarchyData).descendants().filter(d => d.depth !== 0)

    this.g.attr('transform', `translate(${config.width / 2},${config.height / 2})`)
    const nodes = this.g
      .selectAll(`.${s.node}`)
      .data(dendogramData)

    const nodesEnter = nodes.enter().append('path')
      .attr('class', s.node)
      .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
      .style('stroke', d => getColor(d.data, config.nodeColor, d.depth))
      .style('opacity', 0)
      .each((d, i, els) => {
        const arcNode = els[i]
        const angleCenter = (d.x0 + d.x1) / 2
        const angleHalfWidth = (d.x1 - d.x0) / 2
        arcNode._animState = {
          x0: angleCenter - angleHalfWidth * 0.8,
          x1: angleCenter + angleHalfWidth * 0.8,
          y0: d.y0,
          y1: d.y1,
        }
      })

    const nodesMerged = nodesEnter.merge(nodes)
      .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
      .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
      .style('stroke', d => getColor(d.data, config.nodeColor, d.depth))

    if (duration) {
      smartTransition(nodesMerged, duration)
        .style('opacity', 1)
        .attrTween('d', (d, i, els) => {
          const arcNode = els[i]
          const nextAnimState = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }
          const datum = interpolate(arcNode._animState, nextAnimState)

          return (t: number): string => {
            arcNode._animState = datum(t)
            return this.arcGen(arcNode._animState)
          }
        })
    } else {
      nodesMerged.attr('d', d => this.arcGen(d))
    }

    smartTransition(nodes.exit(), duration)
      .style('opacity', 0)
      .remove()
  }
}
