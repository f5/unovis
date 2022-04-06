// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'
import { min, max } from 'd3-array'
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster'

// Utils
import { clamp, getString, getNumber } from 'utils/data'
import { getColor } from 'utils/color'
import { polygon, circlePath } from 'utils/path'
import { getHTMLTransform } from 'utils/html'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import {
  LeafletMapPoint,
  LeafletMapPointShape,
  LeafletMapPieDatum,
  LeafletMapPointStyles,
  PointExpandedClusterProperties,
  LeafletMapPointDatum,
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

export function projectPoint (geoJSONPoint, leafletMap: L.Map): { x: number; y: number } {
  const lat = geoJSONPoint.geometry.coordinates[1]
  const lon = geoJSONPoint.geometry.coordinates[0]
  const projected = leafletMap.latLngToLayerPoint(new L.LatLng(lat, lon))
  return projected
}

export function getPointRadius<D> (
  geoPoint: ClusterFeature<D> | PointFeature<D>,
  pointRadius: NumericAccessor<D>,
  zoomLevel: number
): number {
  const isDynamic = !pointRadius
  const radius = isDynamic ? 1 + 2 * Math.pow(zoomLevel, 0.80) : getNumber(geoPoint.properties, pointRadius)

  const isCluster = (geoPoint as ClusterFeature<D>).properties.cluster
  return (isCluster && isDynamic)
    ? clamp(Math.pow((geoPoint as ClusterFeature<D>).properties.point_count, 0.35) * radius, radius * 1.1, radius * 3)
    : radius
}

export function getPointPos<D> (point: LeafletMapPoint<D> | ClusterFeature<PointExpandedClusterProperties<D>>, leafletMap: L.Map): { x: number; y: number } {
  const isFromCluster = !!point.properties.expandedClusterPoint

  if (isFromCluster) {
    const { x, y } = projectPoint(point.properties.expandedClusterPoint, leafletMap)
    return {
      x: x + point.properties.dx,
      y: y + point.properties.dy,
    }
  } else {
    return projectPoint(point, leafletMap)
  }
}

export function getPointDisplayOrder<D> (d: LeafletMapPoint<D>, pointStatus: StringAccessor<D>, valuesMap: LeafletMapPointStyles<D>): number {
  const status = getString(d.properties, pointStatus)
  const statusList = Object.keys(valuesMap)
  return Object.keys(statusList).indexOf(status)
}

export function toGeoJSONPoint<D> (d: D, pointLatitude: NumericAccessor<D>, pointLongitude: NumericAccessor<D>): PointFeature<D> {
  const lat = getNumber(d, pointLatitude) as number
  const lon = getNumber(d, pointLongitude) as number

  return {
    type: 'Feature',
    properties: {
      ...d,
    },
    geometry: {
      type: 'Point',
      coordinates: [lon, lat],
    },
  }
}

export function calculateClusterIndex<D> (data: D[], config: LeafletMapConfigInterface<D>, maxClusterZoomLevel = 23): Supercluster<D> {
  const { valuesMap, pointShape, pointLatitude, pointLongitude, clusterRadius } = config
  return new Supercluster<D>({
    radius: clusterRadius,
    maxZoom: maxClusterZoomLevel,
    map: (d): Record<string, unknown> => {
      const shape = getString(d, pointShape)

      const clusterPoint = { shape }
      for (const key of Object.keys(valuesMap)) {
        clusterPoint[key] = d[key] || 0
      }

      return clusterPoint
    },
    reduce: (acc, clusterPoint): void => {
      acc.shape = acc.shape === clusterPoint.shape ? acc.shape : LeafletMapPointShape.Circle
      acc.value = (acc.value ?? 0) + (clusterPoint.value ?? 0)

      for (const key of Object.keys(valuesMap)) {
        acc[key] += clusterPoint[key]
      }
    },
  }).load(data.map(d => toGeoJSONPoint(d, pointLatitude, pointLongitude)))
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

export function getDonutData<D> (d: LeafletMapPointDatum<D>, valuesMap: LeafletMapPointStyles<D>): LeafletMapPieDatum[] {
  return Object.keys(valuesMap).map(key => ({
    name: key,
    value: d[key],
    color: valuesMap[key].color,
    className: valuesMap[key].className,
  }))
}

export function geoJSONPointToScreenPoint<D> (
  geoPoint: ClusterFeature<LeafletMapPointDatum<D>>, // Todo: Add | PointFeature<PointExpandedClusterProperties<D>>,
  leafletMap: L.Map,
  pointRadius: NumericAccessor<D>,
  pointColor: ColorAccessor<D>,
  pointShape: StringAccessor<D>,
  pointId: StringAccessor<D>,
  valuesMap: LeafletMapPointStyles<D>
): LeafletMapPoint<D> {
  const zoomLevel = leafletMap.getZoom()
  const { x, y } = getPointPos(geoPoint, leafletMap)
  const color = getColor(geoPoint.properties, pointColor)
  const radius = getPointRadius(geoPoint, pointRadius, zoomLevel)
  const isCluster = geoPoint.properties.cluster
  const shape = isCluster ? LeafletMapPointShape.Circle : getString(geoPoint.properties, pointShape) as LeafletMapPointShape
  const isRing = shape === LeafletMapPointShape.Ring

  const donutData = getDonutData(geoPoint.properties, valuesMap)
  const maxValue = max(donutData, d => d.value)
  const maxValueIndex = donutData.map(d => d.value).indexOf(maxValue)
  const biggestDatum = donutData[maxValueIndex ?? 0]
  const clusterIndex = geoPoint.properties.clusterIndex

  const screenPoint: LeafletMapPoint<D> = {
    ...geoPoint,
    id: isCluster ? `cluster-${geoPoint.id}` : (getString(geoPoint.properties, pointId) ?? ''),
    bbox: {
      x1: x - radius,
      y1: y - radius,
      x2: x + radius,
      y2: y + radius,
    },
    radius,
    donutData,
    path: getNodePathData({ x: 0, y: 0 }, radius, shape),
    color: (isCluster || isRing) ? null : (color ?? biggestDatum?.color),
    isCluster,
    clusterIndex,
    clusterPoints: isCluster ? clusterIndex.getLeaves(geoPoint.properties.cluster_id as number, Infinity).map(d => d.properties) : undefined,
    _zIndex: 0,
  }

  return screenPoint
}

export function shouldClusterExpand<D> (cluster: LeafletMapPoint<D>, zoomLevel: number, midLevel = 4, maxLevel = 11, maxClusterZoomLevel = 23): boolean {
  if (!cluster) return false

  const clusterExpansionZoomLevel: number = cluster.clusterIndex.getClusterExpansionZoom(cluster.id as number)
  return clusterExpansionZoomLevel >= maxClusterZoomLevel ||
    zoomLevel >= maxLevel ||
    (zoomLevel >= midLevel && cluster && cluster.properties.point_count < 20)
}

export function findNodeAndClusterInPointsById<D> (points: LeafletMapPoint<D>[], id: string, pointId: StringAccessor<D>): { node: null | LeafletMapPoint<D>; cluster: null | LeafletMapPoint<D> } {
  let node = null
  let cluster = null
  points.forEach(point => {
    if (point.isCluster) {
      const leaves = point.clusterPoints ?? []
      const foundNode = leaves.find(d => getString(d, pointId) === id)
      if (foundNode) {
        node = foundNode
        cluster = point
      }
    }
  })
  return { node, cluster }
}

export function getNodeRelativePosition<D> (d: LeafletMapPoint<D>, leafletMap: L.Map): { x: number; y: number } {
  const paneTransform = getHTMLTransform(leafletMap.getPane('mapPane'))
  const { x, y } = getPointPos(d, leafletMap)
  return { x: x + paneTransform[0], y: y + paneTransform[1] }
}

export function getClusterRadius<D> (cluster: { points: PointFeature<PointExpandedClusterProperties<D>>[]; cluster: LeafletMapPoint<D> }): number {
  const { points } = cluster
  const minX = min<number>(points.map(d => d.properties.dx - d.properties.r))
  const maxX = max<number>(points.map(d => d.properties.dx + d.properties.r))
  const minY = min<number>(points.map(d => d.properties.dy - d.properties.r))
  const maxY = max<number>(points.map(d => d.properties.dy + d.properties.r))
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
}

export function getClustersAndPoints<D> (
  clusterIndex: Supercluster<D>,
  leafletMap: L.Map,
  customBounds?: [number, number, number, number]
): ClusterFeature<D>[] {
  const leafletBounds = leafletMap.getBounds()
  const southWest = leafletBounds.getSouthWest()
  const northEast = leafletBounds.getNorthEast()
  const bounds = customBounds || [southWest.lng, southWest.lat, northEast.lng, northEast.lat]
  const zoom = Math.round(leafletMap.getZoom())
  const points = clusterIndex.getClusters(bounds, zoom) as ClusterFeature<LeafletMapPointDatum<D>>[]

  points.forEach(p => { p.properties.clusterIndex = p.properties.cluster ? clusterIndex : null })
  return points
}
