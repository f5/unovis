import { select } from 'd3-selection'
import { ResizeObserver } from '@juggle/resize-observer'

import { ComponentCore } from 'core/component'
import { ComponentType } from 'types/component'

// Utils
import { getNumber, throttle } from 'utils/data'
import { getDataLatLngBounds } from 'utils/map'
import { getColor } from 'utils/color'

// Components
import { LeafletMap } from 'components/leaflet-map'

// Types
import { Bounds } from 'components/leaflet-map/types'
import { GenericDataRecord } from 'types/data'

// Config
import { LeafletFlowMapConfig, LeafletFlowMapConfigInterface } from './config'

// Local Types
import { LatLon, Particle } from './types'

// Renderer
import { PointRenderer as PointRendererType } from './renderer'

export class LeafletFlowMap<
  PointDatum extends GenericDataRecord,
  FlowDatum extends GenericDataRecord,
> extends ComponentCore<
  { points: PointDatum[]; flows?: FlowDatum[] },
  LeafletFlowMapConfig<PointDatum, FlowDatum>,
  LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
  > {
  static selectors = LeafletMap.selectors
  type = ComponentType.HTML
  private leafletMap: LeafletMap<PointDatum>
  private leafletMapInstance: L.Map
  private flows: FlowDatum[] = []
  private points: PointDatum[] = []
  private hoveredSourcePoint: FlowDatum | undefined
  private onCanvasMouseMoveBound = throttle(this.onCanvasMouseMove.bind(this), 60)
  private onCanvasClickBound = this.onCanvasClick.bind(this)
  private canvasElement: HTMLCanvasElement | undefined
  config: LeafletFlowMapConfig<PointDatum, FlowDatum> = new LeafletFlowMapConfig()
  private panningOffset = { x: 0, y: 0 }

  private resizeObserver: ResizeObserver | undefined
  private renderer: PointRendererType | undefined
  particles: Particle[] = []

  constructor (container: HTMLDivElement, config?: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>, data?: { points: PointDatum[]; flows?: FlowDatum[] }) {
    super(ComponentType.HTML)

    this.leafletMap = new LeafletMap<PointDatum>(container, config, data?.points ?? [])

    const rendererImportPromise = import('./renderer')
    Promise.all([rendererImportPromise, this.leafletMap.getLeafletInstancePromise()])
      .then((imports) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const [{ PointRenderer }, leaflet] = imports

        this.leafletMapInstance = leaflet
        const canvasContainer = this.leafletMapInstance.getPanes().overlayPane as HTMLDivElement

        // Initialize renderer
        const canvas = select(canvasContainer).insert('canvas', ':first-child')
        this.canvasElement = canvas.node()
        this.renderer = new PointRenderer(canvasContainer, container.offsetWidth, container.offsetHeight, this.canvasElement)
        this.canvasElement.addEventListener('mousemove', this.onCanvasMouseMoveBound)
        this.canvasElement.addEventListener('click', this.onCanvasClickBound)

        this.leafletMap._onMapMoveEndInternal = this.onMapMove.bind(this)

        // Update renderer size on container resize
        this.resizeObserver = new ResizeObserver(() => {
          this.renderer.setSize(container.offsetWidth, container.offsetHeight)
        })
        this.resizeObserver.observe(container)

        if (config) this.setConfig(config)
        if (data) this.setData(data)
        this.animate()
      })
  }

  setConfig (config: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>): void {
    super.setConfig(config)
    this.leafletMap.setConfig({ ...config, clusteringDistance: 0 })
  }

  setData (data: { points: PointDatum[]; flows?: FlowDatum[] }): void {
    super.setData(data)
    this.flows = data.flows
    this.points = data.points
    this.initParticles()
    this.leafletMap.setData(this.points)
    this.render()
  }

  render (): void {
    super.render()
  }

  initParticles (): void {
    this.clearParticles()
    for (const flow of this.flows) {
      const source = {
        lat: getNumber(flow, this.config.sourceLatitude),
        lon: getNumber(flow, this.config.sourceLongitude),
      }

      const target = {
        lat: getNumber(flow, this.config.targetLatitude),
        lon: getNumber(flow, this.config.targetLongitude),
      }

      // Add source particle, showing the origin of the flow
      const sourcePointRadius = getNumber(flow, this.config.sourcePointRadius)
      const sourcePointColor = getColor(flow, this.config.sourcePointColor)
      this.addParticle(source, source, source, 0, sourcePointRadius, sourcePointColor)

      // Add flow particles
      const dist = Math.sqrt((target.lat - source.lat) ** 2 + (target.lon - source.lon) ** 2)
      const numParticles = Math.round(dist * getNumber(flow, this.config.flowParticleDensity))
      const velocity = getNumber(flow, this.config.flowParticleSpeed)
      const r = getNumber(flow, this.config.flowParticleRadius)
      const color = getColor(flow, this.config.flowParticleColor)
      for (let i = 0; i < numParticles; i += 1) {
        const location = {
          lat: source.lat + (target.lat - source.lat) * i / numParticles,
          lon: source.lon + (target.lon - source.lon) * i / numParticles,
        }
        this.addParticle(source, target, location, velocity, r, color)
      }
    }

    this.renderer?.update(this.particles)
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
    const map = this.leafletMapInstance

    requestAnimationFrame(() => {
      const zoomLevel = map?.getZoom()
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

        const pos = map?.latLngToLayerPoint([p.location.lat, p.location.lon])
        const orthogonalArcShift = -(zoomLevel ** 2 * fullDist / 8) * Math.cos(Math.PI / 2 * (fullDist / 2 - remainedDist) / (fullDist / 2)) || 0
        p.x = pos?.x - this.panningOffset.x
        p.y = pos?.y + orthogonalArcShift - this.panningOffset.y
      }

      this.renderer.updatePointsPosition(this.particles)
      this.renderer.draw()
      this.animate()
    })
  }

  private getPointByScreenPos (x: number, y: number): [FlowDatum, number, number] | [] {
    const map = this.leafletMapInstance

    for (const flow of this.flows) {
      const lat = getNumber(flow, this.config.sourceLatitude)
      const lon = getNumber(flow, this.config.sourceLongitude)
      const r = getNumber(flow, this.config.sourcePointRadius)
      const pos = map?.latLngToLayerPoint([lat, lon])
      const posX = pos.x - this.panningOffset.x
      const posY = pos.y - this.panningOffset.y

      if ((Math.abs(x - posX) < r) && (Math.abs(y - posY) < r)) {
        return [flow, posX, posY]
      }
    }

    return []
  }

  private onCanvasMouseMove (event: MouseEvent): void {
    const { config } = this

    this.canvasElement.style.removeProperty('cursor')
    const [hoveredPoint, x, y] = this.getPointByScreenPos(event.offsetX, event.offsetY)
    if (hoveredPoint) this.canvasElement.style.cursor = 'default'

    if (this.hoveredSourcePoint !== hoveredPoint) {
      if (hoveredPoint) config.onSourcePointMouseEnter?.(hoveredPoint, x, y, event)
      if (this.hoveredSourcePoint) config.onSourcePointMouseLeave?.(this.hoveredSourcePoint, event)
      this.hoveredSourcePoint = hoveredPoint
    }
  }

  private onCanvasClick (event: MouseEvent): void {
    const { config } = this

    const [clickedPoint, x, y] = this.getPointByScreenPos(event.offsetX, event.offsetY)
    if (clickedPoint) config.onSourcePointClick?.(clickedPoint, x, y, event)
  }

  private onMapMove (leaflet: L.Map): void {
    const shift = leaflet.containerPointToLayerPoint([0, 0])
    this.panningOffset.x = shift.x
    this.panningOffset.y = shift.y
    this.canvasElement.style.transform = `translate(${shift.x}px, ${shift.y}px)`
  }

  public destroy (): void {
    this.resizeObserver?.disconnect()
    this.renderer?.destroy()
    this.canvasElement?.removeEventListener('mousemove', this.onCanvasMouseMoveBound)
    this.canvasElement?.removeEventListener('click', this.onCanvasClickBound)
    super.destroy()
  }

  // Leaflet Map useful methods
  public selectPointById (id: string, centerPoint = false): void { this.leafletMap.selectPointById(id, centerPoint) }
  public getSelectedPointId (): string | number | undefined { return this.leafletMap.getSelectedPointId() }
  public unselectPoint (): void { this.leafletMap.unselectPoint() }
  public zoomToPointById (id: string, selectNode = false, customZoomLevel?: number): void { this.leafletMap.zoomToPointById(id, selectNode, customZoomLevel) }
  public zoomIn (increment = 1): void { this.leafletMap.zoomIn(increment) }
  public zoomOut (increment = 1): void { this.leafletMap.zoomOut(increment) }
  public setZoom (zoomLevel: number): void { this.leafletMap.setZoom(zoomLevel) }
  public fitView (): void {
    const points: { lat: number; lon: number }[] = []

    for (const point of this.points) {
      points.push({
        lat: getNumber(point, this.config.pointLatitude),
        lon: getNumber(point, this.config.pointLongitude),
      })
    }

    for (const flow of this.flows) {
      const source = {
        lat: getNumber(flow, this.config.sourceLatitude),
        lon: getNumber(flow, this.config.sourceLongitude),
      }

      const target = {
        lat: getNumber(flow, this.config.targetLatitude),
        lon: getNumber(flow, this.config.targetLongitude),
      }

      points.push(source)
      points.push(target)
    }

    const boundsArray = getDataLatLngBounds(points, d => d.lat, d => d.lon, 0)
    const bounds: Bounds = {
      northEast: { lat: boundsArray[0][0], lng: boundsArray[1][1] },
      southWest: { lat: boundsArray[1][0], lng: boundsArray[0][1] },
    }
    this.leafletMap.fitToBounds(bounds)
  }
}
