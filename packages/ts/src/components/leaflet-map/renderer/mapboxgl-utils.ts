import type L from 'leaflet'
import type { Map } from 'maplibre-gl'

// Utils
import { throttle } from 'utils/data'

export function constraintMapView (map: L.Map, latMin = -75, latMax = 85): void {
  const bounds = map.getBounds()
  const northEast = bounds.getNorthEast()
  const southWest = bounds.getSouthWest()

  if (northEast.lat > latMax && southWest.lat < latMin) {
    map.fitBounds([
      [latMin, 0],
      [latMax, 0],
    ])
  }
}

export function mapboxglWheelEvent (
  map: L.Map,
  layer: L.Layer & { getMaplibreMap(): Map },
  event: WheelEvent
): void {
  const { deltaY } = event
  if (!layer || !layer.getMaplibreMap) return
  const mapboxmap = layer.getMaplibreMap()
  const delta = deltaY * -1

  // Prevent Map from being zoomed-out too far away
  const bounds = map.getBounds()
  const northEast = bounds.getNorthEast()
  const southWest = bounds.getSouthWest()
  const latMin = -70
  const latMax = 80
  if (delta < 0 && northEast.lat > latMax && southWest.lat < latMin) {
    constraintMapView(map)
    return
  }

  const zoom = mapboxmap.getZoom() + delta * 0.001
  const xy = map.mouseEventToLayerPoint(event)
  map.setZoomAround(xy, zoom + 1, { animate: false })
}

export const mapboxglWheelEventThrottled = throttle(mapboxglWheelEvent, 32)
export const constraintMapViewThrottled = throttle(constraintMapView, 1000)
