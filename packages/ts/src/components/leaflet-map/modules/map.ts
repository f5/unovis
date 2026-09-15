import type L from 'leaflet'
import { select, Selection } from 'd3-selection'
import type { GeoJSONSource, Map } from 'maplibre-gl'
import { feature } from 'topojson-client'

// Types
import { GenericDataRecord } from 'types/data'

// Config
import { LeafletMapConfigInterface } from '../config'

// Local Types

// Utils
import { constraintMapView, mapboxglWheelEvent } from '../renderer/mapboxgl-utils'

// Styles
import * as s from '../style'
import { LeafletMapRenderer } from '../types'

export const initialMapCenter: L.LatLngExpression = [36, 14]
export const initialMapZoom = 1.9

let maplibreWorkerUrl: string
// maplibre-gl reads the worker URL every time it (re)creates its worker pool (e.g. when a new map is
//   initialized after all previous ones were destroyed), so the Blob URL is created once and never revoked
async function getMaplibreWorkerUrl (maplibre: typeof import('maplibre-gl')): Promise<string> {
  if (!maplibreWorkerUrl) {
    const { default: workerSource, version: workerVersion } = await import('virtual:maplibre-worker-source')
    // The worker is bundled when Unovis is built, while the main-thread maplibre-gl is resolved in the consumer's
    //   install. Their internal message protocol isn't guaranteed to be stable across versions, so make a skew visible
    if (maplibre.getVersion() !== workerVersion) {
      console.warn(`Unovis | LeafletMap: maplibre-gl ${maplibre.getVersion()} is loaded, but the bundled MapLibre worker was built from ${workerVersion}. ` +
        'If tiles don\'t render, align the versions or provide a matching worker with `setWorkerUrl()` before the map is initialized')
    }
    maplibreWorkerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }))
  }
  return maplibreWorkerUrl
}

export function updateTopoJson<T extends GenericDataRecord> (maplibreMap: Map, config: LeafletMapConfigInterface<T>): void {
  const { topoJSONLayer } = config

  if (topoJSONLayer.sources) {
    const featureObject = topoJSONLayer.sources?.objects?.[topoJSONLayer.featureName]
    if (featureObject) {
      const mapSource = maplibreMap.getSource(topoJSONLayer.featureName) as GeoJSONSource
      const featureCollection = feature(topoJSONLayer.sources, featureObject)
      if (mapSource) {
        mapSource.setData(featureCollection)
      } else {
        maplibreMap.addSource(topoJSONLayer.featureName, { type: 'geojson', data: featureCollection })
      }
    }
  }

  const fillLayer = maplibreMap.getLayer(`${topoJSONLayer.featureName}-area`)
  if (topoJSONLayer.fillProperty) {
    if (!fillLayer) {
      maplibreMap.addLayer({
        id: `${topoJSONLayer.featureName}-area`,
        type: 'fill',
        source: topoJSONLayer.featureName,
        paint: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'fill-antialias': false,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'fill-opacity': topoJSONLayer.fillOpacity,
        },
      })
    }
    maplibreMap.setPaintProperty(`${topoJSONLayer.featureName}-area`, 'fill-color', [
      'case',
      ['!', ['has', topoJSONLayer.fillProperty]],
      'rgba(255, 255, 255, 0)',
      ['get', topoJSONLayer.fillProperty],
    ])
  } else if (fillLayer) maplibreMap.removeLayer(`${topoJSONLayer.featureName}-area`)

  const strokeLayer = maplibreMap.getLayer(`${topoJSONLayer.featureName}-stroke`)
  if (topoJSONLayer.strokeProperty) {
    if (!strokeLayer) {
      maplibreMap.addLayer({
        id: `${topoJSONLayer.featureName}-stroke`,
        type: 'line',
        source: topoJSONLayer.featureName,
        paint: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'line-opacity': topoJSONLayer.strokeOpacity,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'line-width': topoJSONLayer.strokeWidth,
        },
      })
    }
    maplibreMap.setPaintProperty(`${topoJSONLayer.featureName}-stroke`, 'line-color', [
      'case',
      ['!', ['has', topoJSONLayer.strokeProperty]],
      'rgba(255, 255, 255, 0)',
      ['get', topoJSONLayer.strokeProperty],
    ])
  } else if (strokeLayer) { maplibreMap.removeLayer(`${topoJSONLayer.featureName}-stroke`) }
}

export async function setupMap<T extends GenericDataRecord> (mapContainer: HTMLElement, config: LeafletMapConfigInterface<T>): Promise<{
  leaflet: L.Map;
  layer: L.Layer;
  svgOverlay: Selection<SVGSVGElement, unknown, null, undefined>;
  svgGroup: Selection<SVGGElement, unknown, SVGElement, undefined>;
}> {
  const { style, renderer, topoJSONLayer } = config
  const leaflet = await import('leaflet')
  const L = leaflet.default

  if (!style) {
    console.error('Unovis | Leaflet Map: Please provide style settings in the map configuration object')
    return
  }

  const leafletMap = L.map(mapContainer, {
    scrollWheelZoom: renderer === LeafletMapRenderer.Raster, // We define custom scroll event for MapboxGL to enabling smooth zooming
    zoomControl: false,
    zoomDelta: renderer === LeafletMapRenderer.Raster ? 1 : 0.5,
    zoomSnap: renderer === LeafletMapRenderer.Raster ? 1 : 0,
    attributionControl: true,
    center: initialMapCenter,
    zoom: initialMapZoom,
    minZoom: Math.sqrt(mapContainer.offsetWidth) / 17,
    maxZoom: 23,
    maxBounds: L.latLngBounds(
      [-75, -290],
      [85, 290]
    ),
    maxBoundsViscosity: 1,
  })

  for (const attr of config.attribution) {
    leafletMap.attributionControl.addAttribution(attr)
  }

  let layer: L.Layer | (L.Layer & { getMaplibreMap(): Map })
  let maplibreMap: Map = null

  switch (renderer) {
    case LeafletMapRenderer.MapLibre:
      // eslint-disable-next-line no-case-declarations
      const maplibre = await import('maplibre-gl')
      // maplibre-gl locates its worker via `import.meta.url`, which bundlers can't reliably follow for a
      //   dependency (webpack ignores it; Vite emits `.mjs` files that stock servers won't run as a module
      //   worker), silently breaking tile parsing so only the style background renders. Unless the consumer
      //   has set a worker URL themselves, start the worker from a Blob of our prebuilt self-contained bundle.
      if (!maplibre.getWorkerUrl()) {
        maplibre.setWorkerUrl(await getMaplibreWorkerUrl(maplibre))
      }
      // eslint-disable-next-line no-case-declarations
      const { getMaplibreGLLayer } = await import('../renderer/mapboxgl-layer')
      layer = getMaplibreGLLayer(config, L, maplibre)
      layer.addTo(leafletMap)
      maplibreMap = (layer as ReturnType<typeof getMaplibreGLLayer>).getMaplibreMap?.()

      select(mapContainer).on('wheel', (event: WheelEvent) => {
        event.preventDefault()
        mapboxglWheelEvent(leafletMap, layer as (L.Layer & { getMaplibreMap(): Map }), event)
      })
      break
    case LeafletMapRenderer.Raster:
      layer = L.tileLayer(style as string)
      layer.addTo(leafletMap)
      break
  }
  // leaflet-mapbox-gl has a layer positioning issue on far zoom levels which leads to having wrong
  //   map points projection. We constrain the view to prevent that.
  constraintMapView(leafletMap)

  if (maplibreMap && topoJSONLayer?.sources) {
    const canvas = maplibreMap.getCanvas()
    const canvasSelection = select(canvas).classed(s.mapboxglCanvas, true)
    const tilePaneSelection = select(leafletMap.getPanes().tilePane)

    maplibreMap.on('mousemove', (event) => {
      const layerName = `${topoJSONLayer.featureName}-area`
      const layer = maplibreMap.getLayer(layerName)
      if (!layer) return

      const features = maplibreMap.queryRenderedFeatures(event.point, { layers: [layerName] })
      tilePaneSelection.datum(features[0])
      canvasSelection.classed(s.onFeatureHover, Boolean(features[0]))
    })

    maplibreMap.on('load', () => {
      updateTopoJson(maplibreMap, config)
    })
  }

  const svgOverlay = select(leafletMap.getPanes().overlayPane).append('svg')
  const svgGroup = svgOverlay.append('g')

  return {
    leaflet: leafletMap,
    layer,
    svgOverlay,
    svgGroup,
  }
}
