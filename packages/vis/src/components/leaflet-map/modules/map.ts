import { select, Selection } from 'd3-selection'
import L from 'leaflet'
import { GeoJSONSource, Map } from 'maplibre-gl'
import { feature } from 'topojson-client'

// Config
import { LeafletMapConfig } from '../config'

// Local Types

// Utils
import { constraintMapView, mapboxglWheelEventThrottled } from '../renderer/mapboxgl-utils'

// Styles
import * as s from '../style'

export const initialMapCenter: L.LatLngExpression = [36, 14]
export const initialMapZoom = 1.9

export function updateTopoJson<T> (maplibreMap: Map, config: LeafletMapConfig<T>): void {
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

export async function setupMap<T> (mapContainer: HTMLElement, config: LeafletMapConfig<T>): Promise<{
  leaflet: L.Map;
  layer: L.Layer;
  svgOverlay: Selection<SVGElement, any, HTMLElement, any>;
  svgGroup: Selection<SVGGElement, any, SVGElement, any>;
}> {
  const { style, topoJSONLayer } = config
  const { getMapboxglLayer } = await import('../renderer/mapboxgl-layer')

  if (!style) {
    console.error('Unovis | Leaflet Map: Please provide style settings in the map configuration object')
    return
  }

  const leaflet = L.map(mapContainer, {
    scrollWheelZoom: false, // We define custom scroll event for MapboxGL to enabling smooth zooming
    zoomControl: false,
    zoomDelta: 0.5,
    zoomSnap: 0,
    attributionControl: true,
    center: initialMapCenter,
    zoom: initialMapZoom,
    minZoom: Math.sqrt(mapContainer.offsetWidth) / 17,
    maxZoom: 23,
    maxBounds: L.latLngBounds(L.latLng(-75, -290), L.latLng(85, 290)),
    maxBoundsViscosity: 1,
  })

  for (const attr of config.attribution) {
    leaflet.attributionControl.addAttribution(attr)
  }

  const layer = getMapboxglLayer(config)
  layer.addTo(leaflet)

  // leaflet-mapbox-gl has a layer positioning issue on far zoom levels which leads to having wrong
  //   map points projection. We constraint the view to prevent that.
  constraintMapView(leaflet)
  select(mapContainer).on('wheel', (event: WheelEvent) => {
    event.preventDefault()
    mapboxglWheelEventThrottled(leaflet, layer, event)
  })


  if (topoJSONLayer?.sources) {
    const maplibreMap = layer.getMaplibreMap()
    const canvas = maplibreMap.getCanvas()
    const canvasSelection = select(canvas).classed(s.mapboxglCanvas, true)
    const tilePaneSelection = select(leaflet.getPanes().tilePane)

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

  const svgOverlay = select(leaflet.getPanes().overlayPane).append('svg')
  const svgGroup = svgOverlay.append('g')

  return {
    leaflet,
    layer,
    svgOverlay,
    svgGroup,
  }
}
