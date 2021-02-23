// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'

import { ComponentCore } from 'core/component'
import { ComponentType } from 'types/component'

// Utils
import { getValue } from 'utils/data'

// Components
import { LeafletMap } from 'components/leaflet-map'

// Config
import { LeafletFlowMapConfig, LeafletFlowMapConfigInterface } from './config'

// Types
import { LatLon, Particle } from './types'

// Renderer
import { PointRenderer } from './renderer'

export class LeafletFlowMap<PointDatum, FlowDatum> extends ComponentCore<{ points: PointDatum[], flows?: FlowDatum[] }> {
  static selectors = LeafletMap.selectors
  type = ComponentType.HTML
  private leafletMap: LeafletMap<PointDatum>
  private flows: FlowDatum[] = []
  config: LeafletFlowMapConfig<PointDatum, FlowDatum> = new LeafletFlowMapConfig()

  private renderer: PointRenderer
  particles: Particle[] = []

  constructor (container: HTMLDivElement, config?: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>, data?: { points: PointDatum[], flows?: FlowDatum[] }) {
    super(ComponentType.HTML)

    this.leafletMap = new LeafletMap<PointDatum>(container, config, data.points)
    const canvasContainer = this.leafletMap.getLeafletInstance().getPanes().overlayPane as HTMLDivElement
    this.renderer = new PointRenderer(canvasContainer, container.offsetWidth, container.offsetHeight)

    if (config) this.setConfig(config)
    if (data) this.setData(data)
    this.animate()
  }

  setConfig (config: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>): void {
    config.clusterRadius = 0
    super.setConfig(config)
    this.leafletMap.setConfig(config)
  }

  setData (data: { points: PointDatum[], flows?: FlowDatum[] }): void {
    super.setData(data)
    this.flows = data.flows
    this.initParticles()
    this.leafletMap.setData(data.points)
  }

  render (): void {
    super.render()
  }

  initParticles (): void {
    this.clearParticles()
    for (const flow of this.flows) {
      const source = {
        lat: getValue(flow, this.config.sourceLatitude),
        lon: getValue(flow, this.config.sourceLongitude),
      }

      const target = {
        lat: getValue(flow, this.config.targetLatitude),
        lon: getValue(flow, this.config.targetLongitude),
      }

      // Add source particle, showing the origin of the flow
      const sourcePointRadius = getValue(flow, this.config.sourcePointRadius)
      const sourcePointColor = getValue(flow, this.config.sourcePointColor)
      this.addParticle(source, source, source, 0, sourcePointRadius, sourcePointColor)

      // Add flow particles
      const dist = Math.sqrt((target.lat - source.lat) ** 2 + (target.lon - source.lon) ** 2)
      const numParticles = Math.round(dist * getValue(flow, this.config.flowParticleDensity))
      const velocity = getValue(flow, this.config.flowParticleSpeed)
      const r = getValue(flow, this.config.flowParticleRadius)
      const color = getValue(flow, this.config.flowParticleColor)
      for (let i = 0; i < numParticles; i += 1) {
        const location = {
          lat: source.lat + (target.lat - source.lat) * i / numParticles,
          lon: source.lon + (target.lon - source.lon) * i / numParticles,
        }
        this.addParticle(source, target, location, velocity, r, color)
      }
    }

    this.renderer.update(this.particles)
  }

  private addParticle (source: LatLon, target: LatLon, location = source, velocity = 0.05, r = 0.75, color?: string): void {
    const x = 0
    const y = 0
    this.particles.push({ x, y, source, target, location, velocity, r, color })
  }

  private clearParticles (): void {
    this.particles = []
  }

  private animate (): void {
    const map = this.leafletMap.getLeafletInstance()

    requestAnimationFrame(() => {
      for (const p of this.particles) {
        const fullDist = Math.sqrt((p.target.lat - p.source.lat) ** 2 + (p.target.lon - p.source.lon) ** 2)
        const remainedDist = Math.sqrt((p.target.lat - p.location.lat) ** 2 + (p.target.lon - p.location.lon) ** 2)
        const angle = Math.atan2(p.target.lat - p.source.lat, p.target.lon - p.source.lon)
        p.location.lat += p.velocity * Math.sin(angle)
        p.location.lon += p.velocity * Math.cos(angle)

        if (
          (((p.target.lat > p.source.lat) && (p.location.lat > p.target.lat)) || ((p.target.lon > p.source.lon) && (p.location.lon > p.target.lon))) ||
          (((p.target.lat < p.source.lat) && (p.location.lat < p.target.lat)) || ((p.target.lon < p.source.lon) && (p.location.lon < p.target.lon)))
        ) {
          p.location.lat = p.source.lat
          p.location.lon = p.source.lon
        }

        const pos = map.latLngToLayerPoint(new L.LatLng(p.location.lat, p.location.lon))
        const orthogonalArcShift = -50 * Math.cos(Math.PI / 2 * (fullDist / 2 - remainedDist) / (fullDist / 2)) || 0
        p.x = pos.x
        p.y = pos.y + orthogonalArcShift
      }

      this.renderer.updatePointsPosition(this.particles)
      this.renderer.draw()
      this.animate()
    })
  }

  public destroy (): void {
    this.renderer.destroy()
    super.destroy()
  }

  // Leaflet Map useful methods
  public selectPointById (id: string, centerPoint = false): void { this.leafletMap.selectPointById(id, centerPoint) }
  public getSelectedPointId (): string | number | undefined { return this.leafletMap.getSelectedPointId() }
  public unselectPoint (): void { this.leafletMap.unselectPoint() }
  public zoomToPointById (id: string, selectNode = false, customZoomLevel?: number): void { this.leafletMap.zoomToPointById(id, selectNode, customZoomLevel) }
  public zoomIn (increment = 1): void { this.leafletMap.zoomIn(increment) }
  public zoomOut (increment = 1): void { this.leafletMap.zoomIn(increment) }
  public setZoom (zoomLevel: number): void { this.leafletMap.setZoom(zoomLevel) }
  public fitView (): void { this.leafletMap.fitView() }
}
