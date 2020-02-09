// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Types
import { ClusterOutlineType, Point } from 'types/map'

// Utils
import { clamp } from 'utils/data'

// Modules
import { updateDonut } from './donut'

import * as s from '../style'

export function createNodes (selection): void {
  selection.append('path')
    .attr('class', s.node)
    .attr('id', d => `point-${d.properties.id}`)
    .style('opacity', 0)

  selection.append('text')
    .attr('class', s.innerLabel)
    .attr('id', d => `label-${d.properties.id}`)
    .attr('dy', '0.32em')

  selection.append('g')
    .attr('class', s.donutCluster)
}

export function updateNodes (selection, datamodel, config): void {
  const { clusterOutlineType, clusterOutlineWidth, statusStyle } = config
  selection
    .attr('transform', d => {
      const { x, y } = datamodel.getPointPos(d)
      return `translate(${x},${y})`
    })

  selection.each((d: Point, i: number, elements: Selection<SVGGElement, object[], SVGGElement, object[]>) => {
    const group = select(elements[i])
    const node: Selection<SVGPathElement, any, SVGGElement, any> = group.select(`.${s.node}`)
    const innerLabel = group.select(`.${s.innerLabel}`)

    if (clusterOutlineType === ClusterOutlineType.DONUT && d.properties.cluster) {
      group.select(`.${s.donutCluster}`)
        .call(updateDonut, datamodel.getDonutData(d), { radius: d.radius, arcWidth: clusterOutlineWidth, statusStyle })
    }

    node
      .classed('cluster', (d: Point) => d.properties.cluster)
      .classed('withStroke', (d: Point) => d.properties.cluster && clusterOutlineType === ClusterOutlineType.LINE)
      .classed('fromCluster', (d: Point) => d.cluster)
      .attr('d', (d: Point) => d.path)
      .style('fill', (d: Point) => {
        return d.fill || statusStyle?.[d.properties.status]?.fill
      })
      .style('stroke', (d: Point) => {
        return d.stroke || statusStyle?.[d.properties.status]?.stroke
      })
      .style('stroke-width', (d: Point) => d.strokeWidth)
      .style('opacity', 1)

    innerLabel
      .text((d: Point) => d.properties.cluster ? d.properties.point_count : null)
      .attr('font-size', (d: Point) => {
        if (!d.properties.point_count) return null
        const nodeWidth = node.node().getBBox().width
        const textLength = d.properties.point_count.toString().length
        const fontSize = 0.6 * nodeWidth / Math.pow(textLength, 0.35)
        return clamp(fontSize, fontSize, 16)
      })
      .attr('visibility', (d: Point) => d.properties.cluster ? null : 'hidden')
  })
}

export function removeNodes (selection): void {
  selection.remove()
}
