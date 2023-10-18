import type L from 'leaflet'
import { min, max } from 'd3-array'
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster'

// Utils
import { clamp, getString, getNumber } from 'utils/data'
import { getColor } from 'utils/color'
import { polygon, circlePath } from 'utils/path'
import { getHTMLTransform } from 'utils/html'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { GenericDataRecord } from 'types/data'

// Local Types
import {
  LeafletMapPoint,
  LeafletMapPointShape,
  LeafletMapPieDatum,
  LeafletMapPointStyles,
  PointExpandedClusterProperties,
  LeafletMapPointDatum,
  LeafletMapClusterDatum,
} from '../types'

// Config
import { LeafletMapConfigInterface } from '../config'

export function bBoxMerge (
  bBoxArray: ({x1: number; x2: number; y1: number; y2: number})[]):
  { x: number; y: number; width: number; height: number } {
  let box = { x1: 0, x2: 0, y1: 0, y2: 0 }
  bBoxArray.forEach(coords => {
    if (!box) {
      box = { ...coords }
    } else {
      if (box.x1 > coords.x1) box.x1 = coords.x1
      if (box.y1 > coords.y1) box.y1 = coords.y1
      if (box.x2 < coords.x2) box.x2 = coords.x2
      if (box.y2 < coords.y2) box.y2 = coords.y2
    }
  })

  return {
    x: box.x1,
    y: box.y1,
    width: box.x2 - box.x1,
    height: box.y2 - box.y1,
  }
}

export const getNextZoomLevelOnClusterClick = (level: number): number => clamp(1 + level * 1.5, level, 12)

export function projectPoint<D extends GenericDataRecord> (
  geoJSONPoint: LeafletMapPoint<D> | ClusterFeature<LeafletMapClusterDatum<D>> | PointFeature<LeafletMapPointDatum<D>>,
  leafletMap: L.Map
): { x: number; y: number } {
  const lat = geoJSONPoint.geometry.coordinates[1]
  const lon = geoJSONPoint.geometry.coordinates[0]
  const projected = leafletMap.latLngToLayerPoint([lat, lon])
  return projected
}

export function getPointRadius<D extends GenericDataRecord> (
  geoPoint: ClusterFeature<LeafletMapClusterDatum<D>> | PointFeature<LeafletMapPointDatum<D>> | PointFeature<PointExpandedClusterProperties<D>>,
  pointRadius: NumericAccessor<LeafletMapPointDatum<D>> | NumericAccessor<LeafletMapClusterDatum<D>>,
  zoomLevel: number
): number {
  const isDynamic = !pointRadius
  const radius = isDynamic
    ? 1 + 2 * Math.pow(zoomLevel, 0.80)
    // Todo: Needs a better typings handling
    : getNumber((geoPoint.properties as LeafletMapPointDatum<D>), pointRadius as NumericAccessor<LeafletMapPointDatum<D>>)

  const isCluster = (geoPoint as ClusterFeature<D>).properties.cluster
  return (isCluster && isDynamic)
    ? clamp(Math.pow((geoPoint as ClusterFeature<D>).properties.point_count, 0.35) * radius, radius * 1.1, radius * 3)
    : radius
}

export function getPointPos<D extends GenericDataRecord> (point: LeafletMapPoint<D> | ClusterFeature<LeafletMapClusterDatum<D>> | PointFeature<LeafletMapPointDatum<D>>, leafletMap: L.Map): { x: number; y: number } {
  const properties = point.properties as LeafletMapPointDatum<D>
  const isFromCluster = !!(properties).expandedClusterPoint

  if (isFromCluster) {
    const { x, y } = projectPoint(properties.expandedClusterPoint, leafletMap)
    return {
      x: x + properties.dx,
      y: y + properties.dy,
    }
  } else {
    return projectPoint(point, leafletMap)
  }
}

export function getPointDisplayOrder<D extends GenericDataRecord> (
  d: LeafletMapPoint<D>,
  pointStatus: StringAccessor<LeafletMapPointDatum<D> | LeafletMapClusterDatum<D>>,
  colorMap: LeafletMapPointStyles<D>
): number {
  const status = getString(d.properties, pointStatus)
  const statusList = Object.keys(colorMap)
  return Object.keys(statusList).indexOf(status)
}

export function toGeoJSONPoint<D extends GenericDataRecord> (d: D, i: number, pointLatitude: NumericAccessor<D>, pointLongitude: NumericAccessor<D>): PointFeature<D> {
  const lat = getNumber(d, pointLatitude) as number
  const lon = getNumber(d, pointLongitude) as number

  return {
    type: 'Feature',
    properties: {
      ...d,
      _index: i,
    },
    geometry: {
      type: 'Point',
      coordinates: [lon, lat],
    },
  }
}

export function calculateClusterIndex<D extends GenericDataRecord> (data: D[], config: LeafletMapConfigInterface<D>, maxClusterZoomLevel = 23): Supercluster<D> {
  const { colorMap, pointShape, pointLatitude, pointLongitude, clusteringDistance } = config
  return new Supercluster<D, Supercluster.AnyProps>({
    radius: clusteringDistance,
    maxZoom: maxClusterZoomLevel,
    map: (d): Supercluster.AnyProps => {
      const shape = getString(d, pointShape)

      const clusterPoint = { shape } as Supercluster.AnyProps
      for (const key of Object.keys(colorMap)) {
        clusterPoint[key] = d[key] || 0
      }

      return clusterPoint
    },
    reduce: (acc, clusterPoint): void => {
      acc.shape = acc.shape === clusterPoint.shape ? acc.shape : LeafletMapPointShape.Circle
      acc.value = (acc.value ?? 0) + (clusterPoint.value ?? 0)

      for (const key of Object.keys(colorMap)) {
        acc[key] += clusterPoint[key]
      }
    },
  }).load(data.map((d, i) => toGeoJSONPoint(d, i, pointLatitude, pointLongitude)))
}

export function getNodePathData ({ x, y }: { x: number; y: number }, radius: number, shape: LeafletMapPointShape): string {
  switch (shape) {
    case LeafletMapPointShape.Triangle:
      return polygon(radius * 2, 3)
    case LeafletMapPointShape.Square:
      return polygon(radius * 2, 4)
    case LeafletMapPointShape.Circle:
    case LeafletMapPointShape.Ring:
    default:
      return circlePath(x, y, radius)
  }
}

export function getDonutData<D extends GenericDataRecord> (
  d: LeafletMapClusterDatum<D> | LeafletMapPointDatum<D>,
  colorMap: LeafletMapPointStyles<D>
): LeafletMapPieDatum[] {
  return Object.keys(colorMap).map(key => ({
    name: key,
    value: d[key] as number,
    color: colorMap[key].color,
    className: colorMap[key].className,
  }))
}

export function geoJsonPointToScreenPoint<D extends GenericDataRecord> (
  geoPoint: ClusterFeature<LeafletMapClusterDatum<D>> | PointFeature<LeafletMapPointDatum<D>>,
  i: number,
  leafletMap: L.Map,
  config: LeafletMapConfigInterface<D>
): LeafletMapPoint<D> {
  const zoomLevel = leafletMap.getZoom()
  const isCluster = (geoPoint.properties as LeafletMapClusterDatum<D>).cluster
  const clusterIndex = (geoPoint.properties as LeafletMapClusterDatum<D>).clusterIndex
  const clusterPoints = isCluster ? clusterIndex.getLeaves((geoPoint.properties as LeafletMapClusterDatum<D>).cluster_id as number, Infinity).map(d => d.properties) : undefined
  const { x, y } = getPointPos(geoPoint, leafletMap)

  const id = isCluster ? `cluster-${geoPoint.id}` : (getString(geoPoint.properties as LeafletMapPointDatum<D>, config.pointId) ?? geoPoint.geometry.coordinates.join(''))
  // Todo: Needs a better typings handling
  const pointColor = getColor(geoPoint.properties as LeafletMapPointDatum<D>, (isCluster ? config.clusterColor : config.pointColor) as ColorAccessor<LeafletMapPointDatum<D>>)
  const radius = getPointRadius(geoPoint, isCluster ? config.clusterRadius : config.pointRadius, zoomLevel)
  const shape = isCluster ? LeafletMapPointShape.Circle : getString(geoPoint.properties as LeafletMapPointDatum<D>, config.pointShape) as LeafletMapPointShape
  const isRing = shape === LeafletMapPointShape.Ring

  const donutData = getDonutData(geoPoint.properties, config.colorMap)
  const maxValue = max(donutData, d => d.value)
  const maxValueIndex = donutData.map(d => d.value).indexOf(maxValue)
  const biggestDatum = donutData[maxValueIndex ?? 0]

  const color = isCluster ? pointColor
    : (isRing ? null : (pointColor ?? biggestDatum?.color))
  const bbox = { x1: x - radius, y1: y - radius, x2: x + radius, y2: y + radius }
  const path = getNodePathData({ x: 0, y: 0 }, radius, shape)
  const _zIndex = 0

  const screenPoint: LeafletMapPoint<D> = {
    ...geoPoint,
    id,
    bbox,
    radius,
    donutData,
    path,
    color,
    isCluster,
    clusterIndex,
    clusterPoints,
    _zIndex,
  }

  return screenPoint
}

export function shouldClusterExpand<D extends GenericDataRecord> (
  cluster: LeafletMapPoint<D>,
  zoomLevel: number,
  midLevel = 4,
  maxLevel = 8,
  maxClusterZoomLevel = 23
): boolean {
  if (!cluster) return false

  const clusterExpansionZoomLevel = cluster.clusterIndex.getClusterExpansionZoom(cluster.properties.cluster_id as number)
  return zoomLevel >= maxLevel ||
        (zoomLevel >= midLevel && (cluster.properties.point_count < 20 || clusterExpansionZoomLevel >= maxClusterZoomLevel))
}

export function findPointAndClusterByPointId<D extends GenericDataRecord> (
  points: LeafletMapPoint<D>[],
  id: string,
  pointId: StringAccessor<D>
): {
    point: PointFeature<D> | undefined;
    cluster: LeafletMapPoint<D> | undefined;
  } {
  let point
  let cluster
  points.forEach(p => {
    if (p.isCluster) {
      const leaves = p.clusterIndex.getLeaves((p.properties as LeafletMapClusterDatum<D>).cluster_id as number, Infinity) ?? []
      const foundPoint = leaves.find(d => getString(d.properties, pointId) === id)
      if (foundPoint) {
        point = foundPoint
        cluster = p
      }
    }
  })
  return { point, cluster }
}

export function getNodeRelativePosition<D extends GenericDataRecord> (d: LeafletMapPoint<D>, leafletMap: L.Map): { x: number; y: number } {
  const paneTransform = getHTMLTransform(leafletMap.getPane('mapPane'))
  const { x, y } = getPointPos(d, leafletMap)
  return { x: x + paneTransform[0], y: y + paneTransform[1] }
}

export function getClusterRadius<D extends GenericDataRecord> (cluster: { points: PointFeature<PointExpandedClusterProperties<D>>[]; cluster: LeafletMapPoint<D> }): number {
  const { points } = cluster
  const minX = min<number>(points.map(d => d.properties.dx - d.properties.r))
  const maxX = max<number>(points.map(d => d.properties.dx + d.properties.r))
  const minY = min<number>(points.map(d => d.properties.dy - d.properties.r))
  const maxY = max<number>(points.map(d => d.properties.dy + d.properties.r))
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
}

export function getClustersAndPoints<D extends GenericDataRecord> (
  clusterIndex: Supercluster<D>,
  leafletMap: L.Map,
  customBounds?: [number, number, number, number]
): (ClusterFeature<LeafletMapClusterDatum<D>> | PointFeature<D>)[] {
  const leafletBounds = leafletMap.getBounds()
  const southWest = leafletBounds.getSouthWest()
  const northEast = leafletBounds.getNorthEast()
  const bounds = customBounds || [southWest.lng, southWest.lat, northEast.lng, northEast.lat]
  const zoom = Math.round(leafletMap.getZoom())
  const points = clusterIndex.getClusters(bounds, zoom) // as ClusterFeature<LeafletMapPointDatum<D>>[]

  for (const p of points) {
    const point = p as ClusterFeature<LeafletMapClusterDatum<D>>
    const isCluster = point.properties.cluster
    if (isCluster) {
      point.properties.clusterIndex = clusterIndex
      point.properties.clusterPoints = clusterIndex.getLeaves(point.properties.cluster_id, Infinity).map(d => d.properties)
    }
  }

  return points as (ClusterFeature<LeafletMapClusterDatum<D>> | PointFeature<D>)[]
}
