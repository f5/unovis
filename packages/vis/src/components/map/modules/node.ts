// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import L from 'leaflet'

// Types
import { ClusterOutlineType, Point } from 'types/map'

// Utils
import { clamp } from 'utils/data'
import { getPointPos, getDonutData } from './utils'

// Modules
import { updateDonut } from './donut'

// Types
import { MapConfigInterface } from '../config'

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

export function updateNodes<T> (selection, config: MapConfigInterface<T>, leafetMap: L.Map): void {
  const { clusterOutlineType, clusterOutlineWidth, statusMap } = config
  selection
    .attr('transform', d => {
      const { x, y } = getPointPos(d, leafetMap)
      return `translate(${x},${y})`
    })

  selection.each((d: Point, i: number, elements: Selection<SVGGElement, object[], SVGGElement, object[]>) => {
    const group = select(elements[i])
    const node: Selection<SVGPathElement, any, SVGGElement, any> = group.select(`.${s.node}`)
    const innerLabel = group.select(`.${s.innerLabel}`)

    if (clusterOutlineType === ClusterOutlineType.DONUT && d.properties.cluster) {
      group.select(`.${s.donutCluster}`)
        .call(updateDonut, getDonutData(d, config.statusMap), { radius: d.radius, arcWidth: clusterOutlineWidth, statusMap })
    }

    const statusStyle = statusMap?.[d.properties.status]
    node
      .classed('cluster', d.properties.cluster)
      .classed('withStroke', d.properties.cluster && clusterOutlineType === ClusterOutlineType.LINE)
      .classed('fromCluster', d.cluster)
      .classed(statusStyle?.className, !!statusStyle?.className)
      .attr('d', d.path)
      .style('fill', d.fill || statusMap?.[d.properties.status]?.color)
      .style('stroke', d.stroke || statusMap?.[d.properties.status]?.color)
      .style('stroke-width', d.strokeWidth)
      .style('opacity', 1)

    innerLabel
      .text(d.properties.cluster ? d.properties.point_count : null)
      .attr('font-size', (d: Point) => {
        if (!d.properties.point_count) return null
        const nodeWidth = node.node().getBBox().width
        const textLength = d.properties.point_count.toString().length
        const fontSize = 0.6 * nodeWidth / Math.pow(textLength, 0.35)
        return clamp(fontSize, fontSize, 16)
      })
      .attr('visibility', d.properties.cluster ? null : 'hidden')
  })
}

export function removeNodes (selection): void {
  selection.remove()
}
