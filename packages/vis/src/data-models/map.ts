// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { min, max } from 'd3-array'
import { packSiblings } from 'd3-hierarchy'
import Supercluster, { PointFeature } from 'supercluster'
import L from 'leaflet'

// Core
import { CoreDataModel } from 'data-models/core'

// Utils
import { clamp, getValue, isNil, find } from 'utils/data'
import { polygon, circlePath } from 'utils/path'
import { getHTMLTransform } from 'utils/html'

// Types
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'
import { Point, PointStatus, PointShape, pieDataValue } from 'types/map'

export class MapDataModel<PointDatum> extends CoreDataModel<PointDatum[]> {
  longitude: NumericAccessor<PointDatum>;
  latitude: NumericAccessor<PointDatum>;
  status: StringAccessor<PointDatum>;
  shape: StringAccessor<PointDatum>;
  id: StringAccessor<PointDatum>;
  color: ColorAccessor<PointDatum>;
  pointRadius: NumericAccessor<PointDatum>;
  pointStrokeWidth: NumericAccessor<PointDatum>;
  private MAX_CLUSTER_ZOOM_LEVEL = 20
  private _data: []
  private _leafletMap: L.Map
  private _clusterIndex: Supercluster
  private _expandedCluster = null

  set data (data) {
    this._data = data
    this._clusterIndex = this._calulateClusterIndex()
  }

  set leafletMap (map: L.Map) {
    this._leafletMap = map
  }

  get points (): Point[] {
    return this._calculatePoints()
  }

  get expandedCluster () {
    return this._expandedCluster
  }

  getPointsInCurrentBounds (): Point[] {
    const allDataBounds = this.getDataLatLngBounds()
    const bounds = [allDataBounds[0][1], allDataBounds[1][0], allDataBounds[1][1], allDataBounds[0][0]]
    return this._calculatePoints(bounds)
  }

  expandCluster (cluster): void {
    const padding = 1
    const points = cluster.index.getLeaves(cluster.properties.cluster_id, Infinity)

    points.forEach(p => {
      p.r = this._getNodeRadius(p) + padding
      p.cluster = cluster
    })

    packSiblings(points)
    this.resetExpandedCluster()
    this._expandedCluster = {
      cluster,
      points,
    }
  }

  resetExpandedCluster (): void {
    if (this._expandedCluster && this._expandedCluster.points) {
      this._expandedCluster.points.forEach(d => { delete d.cluster })
    }
    this._expandedCluster = null
  }

  getClusterRadius (): number {
    const { points } = this._expandedCluster
    const minX = +min(points.map(d => d.x - d.r))
    const maxX = +max(points.map(d => d.x + d.r))
    const minY = +min(points.map(d => d.y - d.r))
    const maxY = +max(points.map(d => d.y + d.r))
    return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
  }

  _calculatePoints (customBounds?): Point[] {
    const { _data, _clusterIndex, _expandedCluster } = this
    if (!_data || !_clusterIndex) return

    let clusters = this.getClusterPoints(customBounds)
    if (_expandedCluster) {
      // Remove expanded cluster from the data
      clusters = clusters.filter(c => c.properties.cluster_id !== _expandedCluster.cluster.properties.cluster_id)
      // Add Points from expanded cluster
      clusters = clusters.concat(_expandedCluster.points)
    }
    const pointData = clusters
      .map((d: Point) => this._geoJSONPointToScreenPoint(d))
      .sort((a, b) => this._getPointDisplayOrder(a) - this._getPointDisplayOrder(b))

    return pointData
  }

  getClusterPoints (customBounds?) {
    const { _clusterIndex, _leafletMap } = this
    const leafletBounds = _leafletMap.getBounds()
    const southWest = leafletBounds.getSouthWest()
    const northEast = leafletBounds.getNorthEast()
    const bounds = customBounds || [southWest.lng, southWest.lat, northEast.lng, northEast.lat]
    const zoom = Math.round(_leafletMap.getZoom())
    const points = _clusterIndex.getClusters(bounds, zoom)

    // Some of the points are clusters, some are not
    return points.map(d => {
      const p: any = {
        ...d,
      }
      if (p.properties.cluster) {
        p.index = _clusterIndex
        p.properties.id = `cluster--${getValue(d, this.id)}`
      }

      return p
    })
  }

  getPointPos (d) {
    const fromCluster = d.cluster

    if (fromCluster) {
      const { x, y } = this._projectPoint(d.cluster)
      return {
        x: x + d.x,
        y: y + d.y,
      }
    } else {
      return this._projectPoint(d)
    }
  }

  getNodeRelativePosition (d): { x: number; y: number } {
    const paneTransform = getHTMLTransform(this._leafletMap.getPane('mapPane'))
    const { x, y } = this.getPointPos(d)
    return { x: x + paneTransform[0], y: y + paneTransform[1] }
  }

  getDonutData (d: Point): pieDataValue[] {
    return Object.values(PointStatus).map(status => ({
      value: d.properties.sum[status],
      status,
    }))
  }

  getDataLatLngBounds (paddingDegrees = 1): number[][] {
    if (!this._data.length) return

    const northWest = {
      lat: max(this._data, d => getValue(d, this.latitude)),
      lng: min(this._data, d => getValue(d, this.longitude)),
    }

    const sourthEast = {
      lat: min(this._data, d => getValue(d, this.latitude)),
      lng: max(this._data, d => getValue(d, this.longitude)),
    }

    return [
      [northWest.lat + paddingDegrees || 90, northWest.lng - paddingDegrees || -180],
      [sourthEast.lat - paddingDegrees || -70, sourthEast.lng + paddingDegrees || 180],
    ]
  }

  shouldClusterExpand (cluster, level, midLevel = 4, maxLevel = 11): boolean {
    const clusterExpansionZoomLevel = cluster.index.getClusterExpansionZoom(cluster.id)
    return clusterExpansionZoomLevel >= this.MAX_CLUSTER_ZOOM_LEVEL ||
      level >= maxLevel ||
      (level >= midLevel && cluster && cluster.properties.point_count < 20)
  }

  findNodeAndClusterInPointsById (points: Point[], id): { node: null | Point; cluster: null | Point } {
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

  _geoJSONPointToScreenPoint (d: Point): Point {
    const { x, y } = this.getPointPos(d)
    const color = getValue(d.properties, this.color)
    const radius = this._getNodeRadius(d)
    const shape = getValue(d.properties, this.shape)
    const isCluster = d.properties.cluster

    return {
      ...d,
      id: getValue(d.properties, this.id),
      bbox: {
        x1: x - radius,
        y1: y - radius,
        x2: x + radius,
        y2: y + radius,
      },
      radius,
      path: this.getNodePathData({ x: 0, y: 0 }, radius, shape),
      fill: color || null,
      stroke: color || null,
      strokeWidth: getValue(d.properties, this.pointStrokeWidth),
      index: isCluster ? d.index : null,
    }
  }

  getNodePathData ({ x, y }, radius, shape): string {
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

  _getPointDisplayOrder (d) {
    const status = getValue(d.properties, this.status)
    switch (status) {
    case PointStatus.ALERT: return 7
    case PointStatus.PENDING: return 6
    case PointStatus.APPROVING: return 5
    case PointStatus.WARNING: return 4
    case PointStatus.INACTIVE: return 3
    case PointStatus.HEALTHY: return 2
    case PointStatus.RE: return 1
    default: return 0
    }
  }

  _projectPoint (geoJSONPoint) {
    const { _leafletMap } = this
    const lat = geoJSONPoint.geometry.coordinates[1]
    const lon = geoJSONPoint.geometry.coordinates[0]
    const projected = _leafletMap.latLngToLayerPoint(new L.LatLng(lat, lon))
    return projected
  }

  _getNodeRadius (d) {
    const { _leafletMap } = this
    const zoomLevel = _leafletMap.getZoom()
    const isCluster = d.properties.cluster
    const isDynamic = isNil(this.pointRadius)

    const radiusFactor = d.status === PointStatus.HEALTHY ? 1 : 1.5
    const radius = isDynamic ? radiusFactor * (1 + Math.pow(zoomLevel, 0.80)) : getValue(d, this.pointRadius)

    return isCluster
      ? clamp(Math.pow(d.properties.point_count, 0.35) * radius, radius * 1.1, radius * 3)
      : radius
  }

  _calulateClusterIndex (): Supercluster {
    if (!this._data) return
    return new Supercluster({
      radius: 45,
      maxZoom: this.MAX_CLUSTER_ZOOM_LEVEL,
      map: (d): {} => {
        const status = getValue(d, this.status)
        const shape = getValue(d, this.shape)
        const result = { shape, sum: {} }
        Object.values(PointStatus).forEach(d => {
          result.sum[d] = status === d ? 1 : 0
        })
        return result
      },
      reduce: (accumulated, props): void => {
        accumulated.shape = accumulated.shape === props.shape ? accumulated.shape : PointShape.CIRCLE
        Object.values(PointStatus).forEach(status => {
          accumulated.sum[status] += props.sum[status]
        })
      },
    }).load(this._data.map(d => this._toGeoJSONPoint(d)))
  }

  _toGeoJSONPoint (point: Point): PointFeature<any> {
    const lat = getValue(point, this.latitude)
    const lon = getValue(point, this.longitude)
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
}
