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
import { MapConfigInterface } from '../config'

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

export function getNodeRadius<T> (d: Point, pointRadius: NumericAccessor<T>, zoomLevel: number): number {
  const isCluster = d.properties.cluster
  const isDynamic = isNil(pointRadius)

  const radius = isDynamic ? 1 + 2 * Math.pow(zoomLevel, 0.80) : getValue(d, pointRadius)

  return isCluster
    ? clamp(Math.pow(d.properties.point_count, 0.35) * radius, radius * 1.1, radius * 3)
    : radius
}

export function getPointPos (d, leafletMap: L.Map): { x: number; y: number } {
  const isFromCluster = d.cluster

  if (isFromCluster) {
    const { x, y } = projectPoint(d.cluster, leafletMap)
    return {
      x: x + d.x,
      y: y + d.y,
    }
  } else {
    return projectPoint(d, leafletMap)
  }
}

export function getPointDisplayOrder<T> (d, pointStatus: StringAccessor<T>, statusMap: StatusMap): number {
  const status = getValue(d.properties, pointStatus)
  const statusList = Object.keys(statusMap)
  return Object.keys(statusList).indexOf(status)
}

export function toGeoJSONPoint<T> (point: Point, pointLatitude: NumericAccessor<T>, pointLongitude: NumericAccessor<T>): PointFeature<any> {
  const lat = getValue(point, pointLatitude) as number
  const lon = getValue(point, pointLongitude) as number
  return {
    type: 'Feature',
    properties: {
      ...point,
    },
    geometry: {
      type: 'Point',
      coordinates: [lon, lat],
    },
  }
}

export function calulateClusterIndex<T> (data, config: MapConfigInterface<T>, maxClusterZoomLevel = 20): Supercluster {
  const { statusMap, pointShape, pointStatus, pointLatitude, pointLongitude } = config
  return new Supercluster({
    radius: 45,
    maxZoom: maxClusterZoomLevel,
    map: (d): {} => {
      const status = getValue(d, pointStatus)
      const shape = getValue(d, pointShape)
      const result = { shape, sum: {} }
      Object.keys(statusMap).forEach(d => {
        result.sum[d] = status === d ? 1 : 0
      })
      return result
    },
    reduce: (accumulated, props): void => {
      accumulated.shape = accumulated.shape === props.shape ? accumulated.shape : PointShape.CIRCLE
      Object.keys(statusMap).forEach(status => {
        accumulated.sum[status] += props.sum[status]
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

export function geoJSONPointToScreenPoint<T> (d: Point, leafletMap: L.Map, pointRadius: NumericAccessor<T>, pointStrokeWidth: NumericAccessor<T>, pointColor: ColorAccessor<T>, pointShape: StringAccessor<T>, pointId: StringAccessor<T>): Point {
  const zoomLevel = leafletMap.getZoom()
  const { x, y } = getPointPos(d, leafletMap)
  const color = getValue(d.properties, pointColor)
  const radius = getNodeRadius<T>(d, pointRadius, zoomLevel)
  const shape = getValue(d.properties, pointShape)
  const isCluster = d.properties.cluster

  return {
    ...d,
    id: getValue(d.properties, pointId),
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
    strokeWidth: getValue(d.properties, pointStrokeWidth),
    index: isCluster ? d.index : null,
  }
}

export function shouldClusterExpand (cluster, zoomLevel: number, midLevel = 4, maxLevel = 11, maxClusterZoomLevel = 20): boolean {
  const clusterExpansionZoomLevel = cluster.index.getClusterExpansionZoom(cluster.id)
  return clusterExpansionZoomLevel >= maxClusterZoomLevel ||
    zoomLevel >= maxLevel ||
    (zoomLevel >= midLevel && cluster && cluster.properties.point_count < 20)
}

export function findNodeAndClusterInPointsById (points: Point[], id): { node: null | Point; cluster: null | Point } {
  let node = null
  let cluster = null
  points.forEach(point => {
    if (point.properties.cluster) {
      const leaves = point.index.getLeaves(point.id, Infinity)
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
    value: d.properties.sum[status],
    status,
  }))
}

export function getNodeRelativePosition (d, leafletMap: L.Map): { x: number; y: number } {
  const paneTransform = getHTMLTransform(leafletMap.getPane('mapPane'))
  const { x, y } = getPointPos(d, leafletMap)
  return { x: x + paneTransform[0], y: y + paneTransform[1] }
}

export function getClusterRadius (cluster): number {
  const { points } = cluster
  const minX = min<number>(points.map(d => d.x - d.r))
  const maxX = max<number>(points.map(d => d.x + d.r))
  const minY = min<number>(points.map(d => d.y - d.r))
  const maxY = max<number>(points.map(d => d.y + d.r))
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
}

export function getClusterPoints<T> (clusterIndex: Supercluster, leafletMap: L.Map, pointId: StringAccessor<T>, customBounds?) {
  const leafletBounds = leafletMap.getBounds()
  const southWest = leafletBounds.getSouthWest()
  const northEast = leafletBounds.getNorthEast()
  const bounds = customBounds || [southWest.lng, southWest.lat, northEast.lng, northEast.lat]
  const zoom = Math.round(leafletMap.getZoom())
  const points = clusterIndex.getClusters(bounds, zoom)

  // Some of the points are clusters, some are not
  return points.map(d => {
    const p: any = {
      ...d,
    }
    if (p.properties.cluster) {
      p.index = clusterIndex
      p.properties.id = `cluster--${getValue(d, pointId)}`
    }

    return p
  })
}
