// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { color } from 'd3-color'
import L from 'leaflet'

// Types
import { ClusterOutlineType, Point } from 'types/map'

// Utils
import { clamp, getValue } from 'utils/data'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'
import { hexToBrightness } from 'utils/color'
import { getPointPos, getDonutData } from './utils'

// Modules
import { updateDonut } from './donut'

// Types
import { LeafletMapConfigInterface } from '../config'

import * as s from '../style'

export function createNodes (selection): void {
  selection.append('path')
    .attr('class', s.pointPath)
    .attr('id', d => `point-${d.properties.id}`)
    .style('opacity', 0)

  selection.append('text')
    .attr('class', s.innerLabel)
    .attr('id', d => `label-${d.properties.id}`)
    .attr('dy', '0.32em')

  selection.append('g')
    .attr('class', s.donutCluster)
}

export function updateNodes<T> (selection, config: LeafletMapConfigInterface<T>, leafetMap: L.Map): void {
  const { clusterOutlineType, clusterOutlineWidth, statusMap } = config
  selection
    .attr('transform', d => {
      const { x, y } = getPointPos(d, leafetMap)
      return `translate(${x},${y})`
    })

  selection.each((d: Point, i: number, elements: Selection<SVGGElement, Record<string, unknown>[], SVGGElement, Record<string, unknown>[]>) => {
    const group = select(elements[i])
    const node: Selection<SVGPathElement, any, SVGGElement, any> = group.select(`.${s.pointPath}`)
    const innerLabel = group.select(`.${s.innerLabel}`)
    const isCluster = d.properties.cluster
    const innerLabelText = getValue(d, config.pointLabel)
    const pointColor = d.fill || statusMap?.[d.properties.status]?.color

    if (clusterOutlineType === ClusterOutlineType.DONUT && isCluster) {
      group.select(`.${s.donutCluster}`)
        .call(updateDonut, getDonutData(d, config.statusMap), { radius: d.radius, arcWidth: clusterOutlineWidth, statusMap })
    }

    const statusStyle = statusMap?.[d.properties.status]
    node
      .classed('cluster', isCluster)
      .classed('withStroke', isCluster && clusterOutlineType === ClusterOutlineType.LINE)
      .classed('fromCluster', !!d.properties.expandedClusterPoint)
      .classed(statusStyle?.className, !!statusStyle?.className)
      .attr('d', d.path)
      .style('fill', pointColor)
      .style('stroke', d.stroke || statusMap?.[d.properties.status]?.color)
      .style('stroke-width', d.strokeWidth)
      .style('opacity', 1)

    innerLabel
      .text(innerLabelText || null)
      .attr('font-size', (d: Point) => {
        const pointDiameter = 2 * d.radius
        const textLength = innerLabelText.length
        const fontSize = 0.5 * pointDiameter / Math.pow(textLength, 0.4)
        return clamp(fontSize, fontSize, 16)
      })
      .attr('visibility', innerLabelText ? null : 'hidden')
      .style('fill', (d, i) => {
        if (!pointColor) return null
        const hex = color(isStringCSSVariable(pointColor) ? getCSSVariableValue(pointColor, this.element) : pointColor)?.hex()
        if (!hex) return null

        const brightness = hexToBrightness(hex)
        return brightness > 0.5 ? 'var(--vis-map-point-label-text-color-dark)' : 'var(--vis-map-point-label-text-color-light)'
      })
  })
}

export function removeNodes (selection): void {
  selection.remove()
}
