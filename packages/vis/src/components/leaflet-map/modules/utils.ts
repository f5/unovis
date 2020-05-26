// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'
import { min, max } from 'd3-array'
import Supercluster, { PointFeature } from 'supercluster'

// Utils
import { clamp, getValue, isNil, find } from 'utils/data'
import { polygon, circlePath } from 'utils/path'
import { getHTMLTransform } from 'utils/html'

// Types
import { Point, PointShape, PieDatum, StatusMap } from 'types/map'
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

export function getNodeRadius<Datum> (geoPoint: PointFeature<any>, pointRadius: NumericAccessor<Datum>, zoomLevel: number): number {
  const isCluster = geoPoint.properties.cluster
  const isDynamic = isNil(pointRadius)

  const radius = isDynamic ? 1 + 2 * Math.pow(zoomLevel, 0.80) : getValue(geoPoint.properties, pointRadius)

  return isCluster
    ? clamp(Math.pow(geoPoint.properties.point_count, 0.35) * radius, radius * 1.1, radius * 3)
    : radius
}

export function getPointPos (point: PointFeature<any>, leafletMap: L.Map): { x: number; y: number } {
  const isFromCluster = point.properties.expandedClusterPoint

  if (isFromCluster) {
    const { x, y } = projectPoint(point.properties.expandedClusterPoint, leafletMap)
    return {
      x: x + point.properties.x,
      y: y + point.properties.y,
    }
  } else {
    return projectPoint(point, leafletMap)
  }
}

export function getPointDisplayOrder<T> (d, pointStatus: StringAccessor<T>, statusMap: StatusMap): number {
  const status = getValue(d.properties, pointStatus)
  const statusList = Object.keys(statusMap)
  return Object.keys(statusList).indexOf(status)
}

export function toGeoJSONPoint<Datum> (d: Datum, pointLatitude: NumericAccessor<Datum>, pointLongitude: NumericAccessor<Datum>): PointFeature<Datum> {
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

export function calulateClusterIndex<Datum> (data: Datum[], config: LeafletMapConfigInterface<Datum>, maxClusterZoomLevel = 20): Supercluster {
  const { statusMap, pointShape, pointStatus, pointLatitude, pointLongitude } = config
  return new Supercluster({
    radius: 45,
    maxZoom: maxClusterZoomLevel,
    map: (d): {} => {
      const pStatus = getValue(d, pointStatus)
      const shape = getValue(d, pointShape)
      const result = { shape }
      Object.keys(statusMap).forEach(status => {
        result[`sum${status}`] = pStatus === status ? 1 : 0
      })
      return result
    },
    reduce: (accumulated, props): void => {
      accumulated.shape = accumulated.shape === props.shape ? accumulated.shape : PointShape.CIRCLE
      Object.keys(statusMap).forEach(status => {
        accumulated[`sum${status}`] += props[`sum${status}`]
      })
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

export function geoJSONPointToScreenPoint<Datum> (geoPoint: PointFeature<any>, leafletMap: L.Map, pointRadius: NumericAccessor<Datum>, pointStrokeWidth: NumericAccessor<Datum>, pointColor: ColorAccessor<Datum>, pointShape: StringAccessor<Datum>, pointId: StringAccessor<Datum>): Point {
  const zoomLevel = leafletMap.getZoom()
  const { x, y } = getPointPos(geoPoint, leafletMap)
  const color = getValue(geoPoint.properties, pointColor)
  const radius = getNodeRadius(geoPoint, pointRadius, zoomLevel)
  const shape = getValue(geoPoint.properties, pointShape)
  const isCluster = geoPoint.properties.cluster

  const screenPoint: Point = {
    ...geoPoint,
    // properties: geoPoint.properties,
    // geometry: geoPoint.geometry,
    id: isCluster ? `cluster-${geoPoint.id}` : getValue(geoPoint.properties, pointId),
    bbox: {
      x1: x - radius,
      y1: y - radius,
      x2: x + radius,
      y2: y + radius,
    },
    radius,
    path: getNodePathData({ x: 0, y: 0 }, radius, shape),
    fill: color || null,
    stroke: color || null,
    strokeWidth: getValue(geoPoint.properties, pointStrokeWidth),
    index: geoPoint.properties.clusterIndex,
    _sortId: 2,
  }

  return screenPoint
}

export function shouldClusterExpand (cluster, zoomLevel: number, midLevel = 4, maxLevel = 11, maxClusterZoomLevel = 20): boolean {
  const clusterExpansionZoomLevel = cluster.index.getClusterExpansionZoom(cluster.id)
  return clusterExpansionZoomLevel >= maxClusterZoomLevel ||
    zoomLevel >= maxLevel ||
    (zoomLevel >= midLevel && cluster && cluster.properties.point_count < 20)
}

export function findNodeAndClusterInPointsById (points: Point[], id: string): { node: null | Point; cluster: null | Point } {
  let node = null
  let cluster = null
  points.forEach(point => {
    if (point.properties.cluster) {
      const leaves = point.index.getLeaves(point.properties.cluster_id, Infinity)
      const foundNode = find(leaves, d => d.properties.id === id)
      if (foundNode) {
        node = foundNode
        cluster = point
      }
    }
  })
  return { node, cluster }
}

export function getDonutData (d: Point, statusMap: StatusMap): PieDatum[] {
  return Object.keys(statusMap).map(status => ({
    value: d.properties[`sum${status}`],
    status,
  }))
}

export function getNodeRelativePosition (d, leafletMap: L.Map): { x: number; y: number } {
  const paneTransform = getHTMLTransform(leafletMap.getPane('mapPane'))
  const { x, y } = getPointPos(d, leafletMap)
  return { x: x + paneTransform[0], y: y + paneTransform[1] }
}

export function getClusterRadius (cluster: { points: PointFeature<any>[]; cluster: Point }): number {
  const { points } = cluster
  const minX = min<number>(points.map(d => d.properties.x - d.properties.r))
  const maxX = max<number>(points.map(d => d.properties.x + d.properties.r))
  const minY = min<number>(points.map(d => d.properties.y - d.properties.r))
  const maxY = max<number>(points.map(d => d.properties.y + d.properties.r))
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
}

export function getClustersAndPoints<Datum> (clusterIndex: Supercluster, leafletMap: L.Map, customBounds?): PointFeature<any>[] {
  const leafletBounds = leafletMap.getBounds()
  const southWest = leafletBounds.getSouthWest()
  const northEast = leafletBounds.getNorthEast()
  const bounds = customBounds || [southWest.lng, southWest.lat, northEast.lng, northEast.lat]
  const zoom = Math.round(leafletMap.getZoom())
  const points = clusterIndex.getClusters(bounds, zoom)

  points.forEach(p => { p.properties.clusterIndex = p.properties.cluster ? clusterIndex : null })
  return points
}
