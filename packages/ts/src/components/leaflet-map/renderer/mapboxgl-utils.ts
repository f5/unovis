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

export function mapboxglWheelEvent (map, layer, event): void {
  const { wheelDelta, deltaY } = event
  if (!layer || !layer.getMaplibreMap) return
  const mapboxmap = layer.getMaplibreMap()
  const delta = wheelDelta || deltaY * -1 // We use deltaY for Firefox because wheelDelta is not implemented there

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
  map.setZoomAround(xy, zoom + 1, { animate: false, duration: 0 })
}

export const mapboxglWheelEventThrottled = throttle(mapboxglWheelEvent, 32)
export const constraintMapViewThrottled = throttle(constraintMapView, 1000)
