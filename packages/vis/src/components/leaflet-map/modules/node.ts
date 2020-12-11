// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { color } from 'd3-color'
import L from 'leaflet'

// Types
import { Point } from 'types/map'

// Utils
import { clamp, getValue } from 'utils/data'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'
import { hexToBrightness } from 'utils/color'
import { getPointPos } from './utils'

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

  selection.append('g')
    .attr('class', s.donutCluster)

  selection.append('text')
    .attr('class', s.innerLabel)
    .attr('id', d => `label-${d.properties.id}`)
    .attr('dy', '0.32em')

  selection.append('text')
    .attr('class', s.bottomLabel)
    .attr('dy', '0.32em')
}

export function updateNodes<D> (selection, config: LeafletMapConfigInterface<D>, leafetMap: L.Map): void {
  const { clusterOutlineWidth } = config
  selection
    .attr('transform', d => {
      const { x, y } = getPointPos(d, leafetMap)
      return `translate(${x},${y})`
    })

  selection.each((d: Point<D>, i: number, elements: Selection<SVGGElement, Record<string, unknown>[], SVGGElement, Record<string, unknown>[]>) => {
    const group = select(elements[i])
    const node: Selection<SVGPathElement, any, SVGGElement, any> = group.select(`.${s.pointPath}`)
    const innerLabel = group.select(`.${s.innerLabel}`)
    const bottomLabel = group.select(`.${s.bottomLabel}`)
    const isCluster = d.properties.cluster
    const innerLabelText = getValue(d.properties, config.pointLabel)
    const bottomLabelText = getValue(d.properties, config.pointBottomLabel)
    const fromExpandedCluster = !!d.properties.expandedClusterPoint

    const donutData = d.donutData

    group.select(`.${s.donutCluster}`)
      .call(updateDonut, donutData, d.radius, isCluster ? clusterOutlineWidth : 0)

    node
      .classed('cluster', isCluster)
      .classed('fromCluster', fromExpandedCluster)
      .attr('d', d.path)
      .style('fill', d.fill)
      .style('stroke', d.fill) // being used for hover
      .style('opacity', 1)

    innerLabel
      .text(innerLabelText || null)
      .attr('font-size', (d: Point<D>) => {
        const pointDiameter = 2 * d.radius
        const textLength = innerLabelText.length
        const fontSize = 0.5 * pointDiameter / Math.pow(textLength, 0.4)
        return clamp(fontSize, fontSize, 16)
      })
      .attr('visibility', innerLabelText ? null : 'hidden')
      .style('fill', () => {
        if (!d.fill) return null
        const hex = color(isStringCSSVariable(d.fill) ? getCSSVariableValue(d.fill, this.element) : d.fill)?.hex()
        if (!hex) return null

        const brightness = hexToBrightness(hex)
        return brightness > 0.5 ? 'var(--vis-map-point-label-text-color-dark)' : 'var(--vis-map-point-label-text-color-light)'
      })

    bottomLabel
      .text(bottomLabelText)
      .attr('font-size', 10)
      .attr('transform', `translate(${0},${d.radius + 10})`)
      .attr('visibility', fromExpandedCluster ? 'hidden' : null)
  })
}

export function removeNodes (selection): void {
  selection.remove()
}
