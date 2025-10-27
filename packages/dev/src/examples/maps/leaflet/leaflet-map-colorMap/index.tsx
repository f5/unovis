import React, { useRef, useCallback, useState, useEffect } from 'react'
import { VisLeafletMap, VisLeafletMapRef } from '@unovis/react'
import { LeafletMap, LeafletMapClusterDatum, LeafletMapPoint, LeafletMapPointStyles, Tooltip } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'


// Data
import { MapPointDataRecord, points, totalEvents, mapStyleLight, mapStyleDark } from './data'

// Style

export const title = 'Color Map'
export const subTitle = 'Updating color map and data'
export const category = 'Leaflet Map'


export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const mapRef = useRef<VisLeafletMapRef<MapPointDataRecord>>(null)
  const [data, setData] = useState(points)
  const [colorMap, setColorMap] = useState<LeafletMapPointStyles<MapPointDataRecord>>({
    normal: { color: '#4c7afc' },
    blocked: { color: '#f8442d' },
  })

  const tooltip = new Tooltip({
    triggers: {
      [LeafletMap.selectors.point]: (d: LeafletMapPoint<MapPointDataRecord>) => {
        return !d.isCluster && !d.clusterPoints ? d.properties?.description : null
      },
    },
    attributes: {
      visLeafletMapTooltipE2eTestId: 'leaflet-map-tooltip',
    },
  })

  const pointId = (d: MapPointDataRecord): string => d.name
  const pointLatitude = (d: MapPointDataRecord): number => d.latitude
  const pointLongitude = (d: MapPointDataRecord): number => d.longitude
  const pointBottomLabel = (d: MapPointDataRecord): string => d.name
  const pointRadius = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): number =>
    10 + 4 * Math.sqrt(((d.normal || 0) + (d.blocked || 0)) / totalEvents)
  const pointLabel = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): string =>
    `${(((d.blocked || 0) + (d.normal || 0)) / 1000).toFixed(1)}K`
  const clusterBottomLabel = (d: LeafletMapClusterDatum<MapPointDataRecord>): string => `${d.point_count} sites`

  // Update color map and data to make sure the map re-renders accordingly
  useEffect(() => {
    // Will be called twice under the dev mode
    setTimeout(() => {
      points.push({ latitude: 51.53857, longitude: -0.2520208, name: 'lon-test', normal: 2758, blocked: 642 })

      setData(points)
      setColorMap({
        normal: { color: '#26BDA4' },
        blocked: { color: '#9876AA' },
      })
    }, 5000)
  }, [])


  return (<>
    <VisLeafletMap<MapPointDataRecord>
      ref={mapRef}
      data={data}
      style={mapStyleLight}
      styleDarkTheme={mapStyleDark}
      pointId={useCallback(pointId, [])}
      pointLatitude={useCallback(pointLatitude, [])}
      pointLongitude={useCallback(pointLongitude, [])}
      pointLabel={useCallback(pointLabel, [])}
      pointBottomLabel={useCallback(pointBottomLabel, [])}
      pointRadius={useCallback(pointRadius, [])}
      colorMap={colorMap}
      clusterRadius={useCallback(pointRadius, [])}
      clusterLabel={useCallback(pointLabel, [])}
      clusterBottomLabel={useCallback(clusterBottomLabel, [])}
      clusteringDistance={85}
      clusterExpandOnClick={true}
      tooltip={tooltip}
      duration={props.duration}
      flyToDuration={props.duration}
      zoomDuration={props.duration}
      events={{
        [LeafletMap.selectors.point]: {
          // mouseover: () => console.log(mapRef.current?.component?.getExpandedCluster()),
        },
      }}
      attributes={{
        [LeafletMap.selectors.point]: {
          cluster: (p: LeafletMapPoint<MapPointDataRecord>) => p.isCluster,
          visLeafletPointE2eTestId: (p: LeafletMapPoint<MapPointDataRecord>) => `leaflet-point-${p.properties?.name}`,
        },
      }}
    />
  </>)
}
