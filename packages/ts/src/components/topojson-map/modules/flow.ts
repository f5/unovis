import { GeoProjection } from 'd3-geo'

// Utils
import { getNumber, getString, isNumber } from 'utils/data'
import { getColor } from 'utils/color'
import { MapGraphDataModel } from 'data-models/map-graph'
// Local types & config
import { FlowParticle, FlowUpdateContext } from '../types'
import { TopoJSONMapConfigInterface } from '../config'
import { arc } from '../utils'

import * as s from '../style'

export interface FlowInitContext<AreaDatum, PointDatum, LinkDatum> {
  config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>;
  datamodel: MapGraphDataModel<AreaDatum, PointDatum, LinkDatum>;
  _projection: GeoProjection;
  _flowParticles: FlowParticle[];
  _sourcePoints: Array<{ x: number; y: number; radius: number; color: string; flowData: LinkDatum }>;
}

export function initFlowFeatures<AreaDatum, PointDatum, LinkDatum> (ctx: FlowInitContext<AreaDatum, PointDatum, LinkDatum>): void {
  const { config, datamodel } = ctx
  // Use raw links data instead of processed links to avoid point lookup issues for flows
  const rawLinks = datamodel.data?.links || []

  // Clear existing flow data
  ctx._flowParticles = []
  ctx._sourcePoints = []

  if (!rawLinks || rawLinks.length === 0) return

  // Create source points and flow particles for each link
  rawLinks.forEach((link, i) => {
    // Try to get coordinates from flow-specific accessors first, then fall back to link endpoints
    let sourceLon: number
    let sourceLat: number
    let targetLon: number
    let targetLat: number

    if (config.sourceLongitude && config.sourceLatitude) {
      sourceLon = getNumber(link, config.sourceLongitude)
      sourceLat = getNumber(link, config.sourceLatitude)
    } else {
      // Fall back to using linkSource point coordinates
      const sourcePoint = config.linkSource?.(link)
      if (typeof sourcePoint === 'object' && sourcePoint !== null) {
        sourceLon = getNumber(sourcePoint as PointDatum, config.longitude)
        sourceLat = getNumber(sourcePoint as PointDatum, config.latitude)
      } else {
        return // Skip if can't resolve source coordinates
      }
    }

    if (config.targetLongitude && config.targetLatitude) {
      targetLon = getNumber(link, config.targetLongitude)
      targetLat = getNumber(link, config.targetLatitude)
    } else {
      // Fall back to using linkTarget point coordinates
      const targetPoint = config.linkTarget?.(link)
      if (typeof targetPoint === 'object' && targetPoint !== null) {
        targetLon = getNumber(targetPoint as PointDatum, config.longitude)
        targetLat = getNumber(targetPoint as PointDatum, config.latitude)
      } else {
        return // Skip if can't resolve target coordinates
      }
    }

    if (!isNumber(sourceLon) || !isNumber(sourceLat) || !isNumber(targetLon) || !isNumber(targetLat)) {
      return
    }

    // Create source point
    const sourcePos = ctx._projection([sourceLon, sourceLat])
    if (sourcePos) {
      const sourcePoint = {
        lat: sourceLat,
        lon: sourceLon,
        x: sourcePos[0],
        y: sourcePos[1],
        radius: getNumber(link, config.sourcePointRadius),
        color: getColor(link, config.sourcePointColor, i),
        flowData: link,
      }
      ctx._sourcePoints.push(sourcePoint)
    }

    // Use the same arc as _renderLinks for flow animation
    const sourceProj = ctx._projection([sourceLon, sourceLat])
    const targetProj = ctx._projection([targetLon, targetLat])
    if (!sourceProj || !targetProj) return

    // Generate SVG arc path string using the same arc() function
    const arcPath = arc(sourceProj, targetProj)
    // Create a temporary SVG path element for sampling
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    tempPath.setAttribute('d', arcPath)
    const pathLength = tempPath.getTotalLength()

    const dist = Math.sqrt((targetLat - sourceLat) ** 2 + (targetLon - sourceLon) ** 2)
    const numParticles = Math.max(1, Math.round(dist * getNumber(link, config.flowParticleDensity)))
    const velocity = getNumber(link, config.flowParticleSpeed)
    const radius = getNumber(link, config.flowParticleRadius)
    const color = getColor(link, config.flowParticleColor, i)

    for (let j = 0; j < numParticles; j += 1) {
      const progress = j / numParticles
      const pt = tempPath.getPointAtLength(progress * pathLength)
      const particle: FlowParticle = {
        x: pt.x,
        y: pt.y,
        velocity,
        radius,
        color,
        progress,
        arcPath,
        pathLength,
        id: `${getString(link, config.linkId, i) || i}-${j}`,
        flowData: undefined,
      }
      ctx._flowParticles.push(particle)
    }
  })
}

export function updateFlowParticles (ctx: FlowUpdateContext): void {
  if (ctx._flowParticles.length === 0) return

  const zoomLevel = ctx._currentZoomLevel || 1

  ctx._flowParticles.forEach(particle => {
    // Move particle along the arc path using progress
    particle.progress += particle.velocity * 0.01
    if (particle.progress > 1) particle.progress = 0

    // Use the stored SVG path and pathLength
    if (particle.arcPath && typeof particle.pathLength === 'number') {
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      tempPath.setAttribute('d', particle.arcPath)
      const pt = tempPath.getPointAtLength(particle.progress * particle.pathLength)
      particle.x = pt.x
      particle.y = pt.y
    }
  })

  // Update DOM elements directly without data rebinding (for performance)
  ctx._flowParticlesGroup
    .selectAll<SVGCircleElement, unknown>(`.${s.flowParticle}`)
    .attr('cx', (d, i) => ctx._flowParticles[i]?.x || 0)
    .attr('cy', (d, i) => ctx._flowParticles[i]?.y || 0)
    .attr('r', (d, i) => (ctx._flowParticles[i]?.radius || 1) / zoomLevel)
}

