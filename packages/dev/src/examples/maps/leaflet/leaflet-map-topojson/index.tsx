import React, { useCallback } from 'react'
import { VisLeafletMap } from '@unovis/react'
import { MapLibreArcticLight } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'TopoJSON Overlay'
export const subTitle = 'WorldMapTopoJSON on top of a Leaflet map'


export const component = (): React.ReactNode => {
  const data = [
    { id: 'Seattle', latitude: 47.6062, longitude: -122.3321 },
    { id: 'Billerica', latitude: 42.5584, longitude: -71.2689 },
    { id: 'Boulder', latitude: 40.0150, longitude: -105.2705 },
    { id: 'San Jose', latitude: 37.7749, longitude: -122.4194 },
    { id: 'Spokane', latitude: 47.6588, longitude: -117.4260 },
    { id: 'Guadalajara', latitude: 20.6597, longitude: -103.3496 },
    { id: 'Chertsey', latitude: 51.3883, longitude: -0.5071 },
    { id: 'Warsaw', latitude: 52.2297, longitude: 21.0122 },
    { id: 'Tel Aviv', latitude: 32.0853, longitude: 34.7818 },
    { id: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
    { id: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
    { id: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
    { id: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
  ]
  type MapPointDataRecord = typeof data[0]
  const pointId = (d: MapPointDataRecord): string => d.id
  const pointLatitude = (d: MapPointDataRecord): number => d.latitude
  const pointLongitude = (d: MapPointDataRecord): number => d.longitude
  const pointLabel = (d: MapPointDataRecord): string => d.id
  const mapSources = {
    sources: {
      openmaptiles: {
        type: 'vector',
        url: `${UNOVIS_MAP_TILE_SERVER_URL}/data/v3.json`,
      },
    },
    glyphs: `${UNOVIS_MAP_TILE_SERVER_URL}/fonts/{fontstack}/{range}.pbf`,
  }

  const topoJSONLayer = {
    sources: {
      type: 'Topology',
      arcs: WorldMapTopoJSON.arcs,
      transform: WorldMapTopoJSON.transform,
      objects: {
        countries: {
          type: 'GeometryCollection',
          geometries: WorldMapTopoJSON.objects.countries.geometries.reduce((acc, c) => {
            if (['US', 'MX', 'GB', 'CN', 'AU', 'IN', 'JP', 'IL', 'PL', 'SG'].includes(c.id as string)) {
              acc.push({ ...c, properties: { color: '#98df8a' } })
            }
            return acc
          }, []),
        },
      },
    },
    featureName: 'countries',
    strokeProperty: 'color',
  }

  return (<>
    <VisLeafletMap<MapPointDataRecord>
      height={550}
      data={data}
      style={{ ...MapLibreArcticLight, ...mapSources }}
      pointId={useCallback(pointId, [])}
      pointLatitude={useCallback(pointLatitude, [])}
      pointLongitude={useCallback(pointLongitude, [])}
      pointColor='#e21d38'
      pointBottomLabel={pointLabel}
      clusteringDistance={20}
      topoJSONLayer={topoJSONLayer}
    />
  </>)
}
