// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'
import { min, max } from 'd3-array'
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster'

// Utils
import { clamp, getValue } from 'utils/data'
import { polygon, circlePath } from 'utils/path'
import { getHTMLTransform } from 'utils/html'

// Types
import { Point, PointShape, PieDatum, ValuesMap, PointExpandedClusterProperties, PointDatum } from 'types/map'
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'

// Config
import { LeafletMapConfigInterface } from '../config'

export function bBoxMerge (bBoxArray) {
  let box
  bBoxArray.forEach(coords => {
    if (!box) {
      box = {
        ...coords,
      }
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

export const clampZoomLevel = (level: number): number => clamp((1 + level * 2), (1 + level * 2), 12)

export function projectPoint (geoJSONPoint, leafletMap: L.Map): { x: number; y: number } {
  const lat = geoJSONPoint.geometry.coordinates[1]
  const lon = geoJSONPoint.geometry.coordinates[0]
  const projected = leafletMap.latLngToLayerPoint(new L.LatLng(lat, lon))
  return projected
}

export function getPointRadius<D> (geoPoint: ClusterFeature<D>, pointRadius: NumericAccessor<D>, zoomLevel: number): number {
  const isCluster = geoPoint.properties.cluster
  const isDynamic = !pointRadius

  const radius = isDynamic ? 1 + 2 * Math.pow(zoomLevel, 0.80) : getValue(geoPoint.properties, pointRadius)

  return (isCluster && isDynamic)
    ? clamp(Math.pow(geoPoint.properties.point_count, 0.35) * radius, radius * 1.1, radius * 3)
    : radius
}

export function getPointPos<D> (point: Point<D> | ClusterFeature<PointExpandedClusterProperties<D>>, leafletMap: L.Map): { x: number; y: number } {
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

export function getPointDisplayOrder<T> (d, pointStatus: StringAccessor<T>, valuesMap: ValuesMap): number {
  const status = getValue(d.properties, pointStatus)
  const statusList = Object.keys(valuesMap)
  return Object.keys(statusList).indexOf(status)
}

export function toGeoJSONPoint<D> (d: D, pointLatitude: NumericAccessor<D>, pointLongitude: NumericAccessor<D>): PointFeature<D> {
  const lat = getValue(d, pointLatitude) as number
  const lon = getValue(d, pointLongitude) as number

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

export function calculateClusterIndex<D> (data: D[], config: LeafletMapConfigInterface<D>, maxClusterZoomLevel = 20): Supercluster<D> {
  const { valuesMap, pointShape, pointLatitude, pointLongitude, clusterRadius } = config
  return new Supercluster<D>({
    radius: clusterRadius,
    maxZoom: maxClusterZoomLevel,
    map: (d): Record<string, unknown> => {
      const shape = getValue(d, pointShape)

      const clusterPoint = { shape }
      for (const key of Object.keys(valuesMap)) {
        clusterPoint[key] = d[key]
      }

      return clusterPoint
    },
    reduce: (acc, clusterPoint): void => {
      acc.shape = acc.shape === clusterPoint.shape ? acc.shape : PointShape.CIRCLE
      acc.value = (acc.value ?? 0) + (clusterPoint.value ?? 0)

      for (const key of Object.keys(valuesMap)) {
        acc[key] += clusterPoint[key]
      }
    },
  }).load(data.map(d => toGeoJSONPoint(d, pointLatitude, pointLongitude)))
}

export function getNodePathData ({ x, y }, radius: number, shape: PointShape): string {
  switch (shape) {
  case PointShape.TRIANGLE:
    return polygon(radius * 2, 3)
  case PointShape.SQUARE:
    return polygon(radius * 2, 4)
  case PointShape.CIRCLE:
  default:
    return circlePath(x, y, radius)
  }
}

export function geoJSONPointToScreenPoint<D> (
  geoPoint: ClusterFeature<PointDatum<D>>,
  leafletMap: L.Map,
  pointRadius: NumericAccessor<D>,
  pointColor: ColorAccessor<D>,
  pointShape: StringAccessor<D>,
  pointId: StringAccessor<D>,
  valuesMap: ValuesMap
): Point<D> {
  const zoomLevel = leafletMap.getZoom()
  const { x, y } = getPointPos(geoPoint, leafletMap)
  const color = getValue(geoPoint.properties, pointColor)
  const radius = getPointRadius(geoPoint, pointRadius, zoomLevel)
  const shape = getValue(geoPoint.properties, pointShape)
  const isCluster = geoPoint.properties.cluster

  const donutData = getDonutData(geoPoint.properties, valuesMap)
  const maxValue = max(donutData, d => d.value)
  const maxValueIndex = donutData.map(d => d.value).indexOf(maxValue)
  const biggestDatum = donutData[maxValueIndex ?? 0]
  const pointFillColor = !isCluster ? (color ?? biggestDatum?.color) : null

  const screenPoint: Point<D> = {
    ...geoPoint,
    id: isCluster ? `cluster-${geoPoint.id}` : getValue(geoPoint.properties, pointId),
    bbox: {
      x1: x - radius,
      y1: y - radius,
      x2: x + radius,
      y2: y + radius,
    },
    radius,
    donutData,
    path: getNodePathData({ x: 0, y: 0 }, radius, shape),
    fill: pointFillColor,
    index: geoPoint.properties.clusterIndex,
    _zIndex: 0,
  }

  return screenPoint
}

export function shouldClusterExpand (cluster, zoomLevel: number, midLevel = 4, maxLevel = 11, maxClusterZoomLevel = 20): boolean {
  const clusterExpansionZoomLevel = cluster.index.getClusterExpansionZoom(cluster.id)
  return clusterExpansionZoomLevel >= maxClusterZoomLevel ||
    zoomLevel >= maxLevel ||
    (zoomLevel >= midLevel && cluster && cluster.properties.point_count < 20)
}

export function findNodeAndClusterInPointsById<D> (points: Point<D>[], id: string): { node: null | Point<D>; cluster: null | Point<D> } {
  let node = null
  let cluster = null
  points.forEach(point => {
    if (point.properties.cluster) {
      const leaves = point.index.getLeaves(point.properties.cluster_id, Infinity)
      const foundNode = leaves.find(d => d.properties.id === id)
      if (foundNode) {
        node = foundNode
        cluster = point
      }
    }
  })
  return { node, cluster }
}

export function getDonutData<D> (d: PointDatum<D>, valuesMap: ValuesMap): PieDatum[] {
  return Object.keys(valuesMap).map(key => ({
    name: key,
    value: d[key],
    color: valuesMap[key].color,
    className: valuesMap[key].className,
  }))
}

export function getNodeRelativePosition (d, leafletMap: L.Map): { x: number; y: number } {
  const paneTransform = getHTMLTransform(leafletMap.getPane('mapPane'))
  const { x, y } = getPointPos(d, leafletMap)
  return { x: x + paneTransform[0], y: y + paneTransform[1] }
}

export function getClusterRadius<D> (cluster: { points: PointFeature<PointExpandedClusterProperties<D>>[]; cluster: Point<D> }): number {
  const { points } = cluster
  const minX = min<number>(points.map(d => d.properties.dx - d.properties.r))
  const maxX = max<number>(points.map(d => d.properties.dx + d.properties.r))
  const minY = min<number>(points.map(d => d.properties.dy - d.properties.r))
  const maxY = max<number>(points.map(d => d.properties.dy + d.properties.r))
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
}

export function getClustersAndPoints<D> (clusterIndex: Supercluster<D>, leafletMap: L.Map, customBounds?): ClusterFeature<PointDatum<D>>[] {
  const leafletBounds = leafletMap.getBounds()
  const southWest = leafletBounds.getSouthWest()
  const northEast = leafletBounds.getNorthEast()
  const bounds = customBounds || [southWest.lng, southWest.lat, northEast.lng, northEast.lat]
  const zoom = Math.round(leafletMap.getZoom())
  const points = clusterIndex.getClusters(bounds, zoom) as ClusterFeature<PointDatum<D>>[]

  points.forEach(p => { p.properties.clusterIndex = p.properties.cluster ? clusterIndex : null })
  return points
}
