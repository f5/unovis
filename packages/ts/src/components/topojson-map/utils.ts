import { max, min } from 'd3-array'
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster'
import { polygon, circlePath } from 'utils/path'
import { Selection } from 'd3-selection'

// Utils
import { getNumber, getString, clamp } from 'utils/data'
import { getColor } from 'utils/color'
import { estimateStringPixelLength } from 'utils/text'
import { rectIntersect } from 'utils/misc'

// Types
import { NumericAccessor, ColorAccessor } from 'types/accessor'
import { Rect } from 'types/misc'
import { GenericDataRecord } from 'types/data'

// Styles
import * as s from './style'

// Local Types
import {
  TopoJSONMapPieDatum,
  TopoJSONMapPointStyles,
  TopoJSONMapPointShape,
  TopoJSONMapPoint,
  TopoJSONMapPointDatum,
  TopoJSONMapClusterDatum,
} from './types'

// Config
import { TopoJSONMapConfigInterface } from './config'

export function getLonLat<Datum> (d: Datum, pointLongitude: NumericAccessor<Datum>, pointLatitude: NumericAccessor<Datum>): [number, number] {
  const lat = getNumber(d, pointLatitude)
  const lon = getNumber(d, pointLongitude)
  return [lon, lat]
}

export function arc (source?: number[], target?: number[], curvature?: number): string {
  if (!target || !source) return 'M0,0,l0,0z'
  const d = 3
  const angleOffset = curvature || 0
  const s = { x: source[0], y: source[1] }
  const t = { x: target[0], y: target[1] }
  const ds = { x: (t.x - s.x) / d, y: (t.y - s.y) / d }
  const dt = { x: (s.x - t.x) / d, y: (s.y - t.y) / d }
  let angle = 0.16667 * Math.PI * (1 + angleOffset)
  if (s.x < t.x) angle = -angle
  const cs = Math.cos(angle)
  const ss = Math.sin(angle)
  const ct = Math.cos(-angle)
  const st = Math.sin(-angle)
  const dds = { x: (cs * ds.x) - (ss * ds.y), y: (ss * ds.x) + (cs * ds.y) }
  const ddt = { x: (ct * dt.x) - (st * dt.y), y: (st * dt.x) + (ct * dt.y) }
  return `M${s.x},${s.y} C${s.x + dds.x},${s.y + dds.y} ${t.x + ddt.x},${t.y + ddt.y} ${t.x},${t.y}`
}

export function getPointPathData ({ x, y }: { x: number; y: number }, radius: number, shape: TopoJSONMapPointShape): string {
  switch (shape) {
    case TopoJSONMapPointShape.Triangle:
      return polygon(radius * 2, 3)
    case TopoJSONMapPointShape.Square:
      return polygon(radius * 2, 4)
    case TopoJSONMapPointShape.Circle:
    case TopoJSONMapPointShape.Ring:
    default:
      return circlePath(x, y, radius)
  }
}

// Extend SVGTextElement to track label visibility for area labels
interface LabelSVGTextElement extends SVGTextElement {
  _labelVisible?: boolean;
}

export function collideAreaLabels (
  selection: Selection<SVGTextElement, any, SVGGElement, unknown>
): void {
  if (selection.size() === 0) return

  const labelNodes = selection.nodes() as LabelSVGTextElement[]
  const labelData = selection.data()

  // Reset all labels to visible
  labelNodes.forEach((node) => {
    node._labelVisible = true
  })

  // Get actual font size
  let actualFontSize = 12
  if (labelNodes.length > 0) {
    const computedStyle = getComputedStyle(labelNodes[0])
    const fontSize = computedStyle.fontSize
    if (fontSize) actualFontSize = parseFloat(fontSize)
  }

  const getBBox = (labelData: any): Rect => {
    const [x, y] = labelData.centroid
    const labelText = labelData.labelText || ''
    const width = estimateStringPixelLength(labelText, actualFontSize, 0.6)
    const height = actualFontSize

    return {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
    }
  }

  labelNodes.forEach((node1, i) => {
    const data1 = labelData[i]
    if (!node1._labelVisible) return

    const label1BoundingRect = getBBox(data1)

    for (let j = 0; j < labelNodes.length; j++) {
      if (i === j) continue

      const node2 = labelNodes[j]
      const data2 = labelData[j]

      if (!node2._labelVisible) continue

      const label2BoundingRect = getBBox(data2)
      const intersect = rectIntersect(label1BoundingRect, label2BoundingRect, 0.25)

      if (intersect) {
        if (data1.area >= data2.area) {
          node2._labelVisible = false
        } else {
          node1._labelVisible = false
          break
        }
      }
    }
  })

  selection.style('opacity', (d, i) => labelNodes[i]._labelVisible ? 1 : 0)
}

/** Get bounding rect of an SVG element in screen coordinates */
function getScreenBBox (el: SVGGraphicsElement): Rect {
  const bbox = el.getBBox()
  const ctm = (el as SVGElement & { getScreenCTM?: () => SVGMatrix | null }).getScreenCTM?.()
  if (!ctm || !el.ownerSVGElement) {
    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
  }
  const pt = el.ownerSVGElement.createSVGPoint()
  const corners = [
    [bbox.x, bbox.y],
    [bbox.x + bbox.width, bbox.y],
    [bbox.x, bbox.y + bbox.height],
    [bbox.x + bbox.width, bbox.y + bbox.height],
  ]
  const transformed = corners.map(([x, y]) => {
    pt.x = x
    pt.y = y
    return pt.matrixTransform(ctm)
  })
  const xs = transformed.map(p => p.x)
  const ys = transformed.map(p => p.y)
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  }
}

// Extend SVGTextElement for point bottom label collision
interface PointBottomLabelSVGTextElement extends SVGTextElement {
  _labelVisible?: boolean;
}

export function collidePointBottomLabels<PointDatum> (
  selection: Selection<SVGTextElement, TopoJSONMapPoint<PointDatum>, SVGGElement, unknown>
): void {
  if (selection.size() === 0) return

  const labelNodes = selection.nodes() as PointBottomLabelSVGTextElement[]
  const labelData = selection.data()

  labelNodes.forEach((node, i) => {
    const d = labelData[i]
    node._labelVisible = !(d as any).expandedClusterPoint
  })

  labelNodes.forEach((node1, i) => {
    if (!node1._labelVisible) return

    const data1 = labelData[i]
    let rect1: Rect
    try {
      rect1 = getScreenBBox(node1)
    } catch {
      return
    }

    for (let j = 0; j < labelNodes.length; j++) {
      if (i === j) continue

      const node2 = labelNodes[j]
      if (!node2._labelVisible) continue

      const data2 = labelData[j]
      let rect2: Rect
      try {
        rect2 = getScreenBBox(node2)
      } catch {
        continue
      }

      const intersect = rectIntersect(rect1, rect2, 2)

      if (intersect) {
        if (data1.radius >= data2.radius) {
          node2._labelVisible = false
        } else {
          node1._labelVisible = false
          break
        }
      }
    }
  })

  selection.attr('visibility', (d, i) => labelNodes[i]._labelVisible ? null : 'hidden')
  selection.style('opacity', (d, i) => labelNodes[i]._labelVisible ? 1 : 0)
}

export function getDonutData<PointDatum> (
  d: PointDatum,
  colorMap: TopoJSONMapPointStyles<PointDatum> | undefined
): TopoJSONMapPieDatum[] {
  if (!colorMap || Object.keys(colorMap).length === 0) {
    return []
  }

  return Object.keys(colorMap)
    .map(key => {
      const keyTyped = key as keyof PointDatum
      const config = colorMap[keyTyped]
      const value = Number((d as any)[key]) || 0
      return {
        name: key,
        value,
        color: config?.color || '#000',
        className: config?.className,
      }
    })
}

export function toGeoJSONPoint<D extends GenericDataRecord> (
  d: D,
  i: number,
  pointLatitude: NumericAccessor<D>,
  pointLongitude: NumericAccessor<D>
): PointFeature<D> {
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

export function calculateClusterIndex<D extends GenericDataRecord> (
  data: D[],
  config: TopoJSONMapConfigInterface<any, D, any>,
  maxClusterZoomLevel = 24
): Supercluster<D> {
  const { colorMap, pointShape, latitude, longitude, clusteringDistance } = config
  return new Supercluster<D, Supercluster.AnyProps>({
    radius: clusteringDistance,
    maxZoom: maxClusterZoomLevel,
    minZoom: 0,
    map: (d): Supercluster.AnyProps => {
      const shape = getString(d, pointShape)

      const clusterPoint = { shape } as Supercluster.AnyProps
      for (const key of Object.keys(colorMap || {})) {
        clusterPoint[key] = d[key] || 0
      }

      return clusterPoint
    },
    reduce: (acc, clusterPoint): void => {
      acc.shape = acc.shape === clusterPoint.shape ? acc.shape : TopoJSONMapPointShape.Circle
      acc.value = (acc.value ?? 0) + (clusterPoint.value ?? 0)

      for (const key of Object.keys(colorMap || {})) {
        acc[key] += clusterPoint[key]
      }
    },
  }).load(data.map((d, i) => toGeoJSONPoint(d, i, latitude, longitude)))
}

export function getPointRadius<D extends GenericDataRecord> (
  geoPoint: ClusterFeature<TopoJSONMapClusterDatum<D>> | PointFeature<TopoJSONMapPointDatum<D>>,
  pointRadius: NumericAccessor<D>,
  zoomLevel: number
): number {
  const isDynamic = !pointRadius
  const radius = isDynamic
    ? 1 + 2 * Math.pow(zoomLevel, 0.80)
    : getNumber(geoPoint.properties as D, pointRadius)

  const isCluster = (geoPoint as ClusterFeature<TopoJSONMapClusterDatum<D>>).properties.cluster
  return (isCluster && isDynamic)
    ? Math.max(
      Math.pow((geoPoint as any).properties.point_count || (geoPoint as ClusterFeature<TopoJSONMapClusterDatum<D>>).properties.pointCount || 1, 0.35) * radius,
      radius * 1.1
    )
    : radius
}

export function geoJsonPointToScreenPoint<D extends GenericDataRecord> (
  geoPoint: ClusterFeature<TopoJSONMapClusterDatum<D>> | PointFeature<TopoJSONMapPointDatum<D>>,
  i: number,
  projection: (coordinates: [number, number]) => [number, number],
  config: TopoJSONMapConfigInterface<any, D, any>,
  zoomLevel: number
): TopoJSONMapPoint<D> {
  const isCluster = (geoPoint.properties as TopoJSONMapClusterDatum<D>).cluster
  const pos = projection(geoPoint.geometry.coordinates as [number, number])
  const x = pos[0]
  const y = pos[1]

  const id = isCluster
    ? `cluster-${geoPoint.id}`
    : (
      (geoPoint.id !== undefined ? String(geoPoint.id) : undefined) ??
      getString(geoPoint.properties as D, config.pointId) ??
      geoPoint.geometry.coordinates.join('')
    )

  const pointColor = getColor(
    geoPoint.properties as D,
    (isCluster ? config.clusterColor : config.pointColor) as ColorAccessor<D>
  )

  const radius = getPointRadius(geoPoint, isCluster ? config.clusterRadius : config.pointRadius, zoomLevel)
  const shape = isCluster
    ? TopoJSONMapPointShape.Circle
    : (getString(geoPoint.properties as D, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle)
  const isRing = shape === TopoJSONMapPointShape.Ring

  const donutData = getDonutData(geoPoint.properties, config.colorMap)
  const maxValue = max(donutData, d => d.value)
  const maxValueIndex = donutData.map(d => d.value).indexOf(maxValue || 0)
  const biggestDatum = donutData[maxValueIndex ?? 0]

  const color = isCluster
    ? pointColor
    : (isRing ? pointColor : (pointColor ?? biggestDatum?.color))

  const bbox = { x1: x - radius, y1: y - radius, x2: x + radius, y2: y + radius }
  const path = getPointPathData({ x: 0, y: 0 }, radius, shape)
  const _zIndex = 0

  const screenPoint: TopoJSONMapPoint<D> = {
    ...geoPoint,
    id,
    bbox,
    radius,
    donutData,
    path,
    color,
    isCluster,
    clusterIndex: isCluster ? (geoPoint.properties as TopoJSONMapClusterDatum<D>).clusterIndex : undefined,
    _zIndex,
  }

  return screenPoint
}

export function getClustersAndPoints<D extends GenericDataRecord> (
  clusterIndex: Supercluster<D>,
  bounds: [number, number, number, number],
  zoom: number
): (ClusterFeature<TopoJSONMapClusterDatum<D>> | PointFeature<D>)[] {
  const points = clusterIndex.getClusters(bounds, zoom)

  for (const p of points) {
    const point = p as ClusterFeature<TopoJSONMapClusterDatum<D>>
    const isCluster = point.properties.cluster
    if (isCluster) {
      // Supercluster uses snake_case internally, so we need to map to camelCase
      const superclusterProps = point.properties as any
      point.properties.clusterId = superclusterProps.cluster_id
      point.properties.pointCount = superclusterProps.point_count
      point.properties.pointCountAbbreviated = superclusterProps.point_count_abbreviated
      point.properties.clusterIndex = clusterIndex
      point.properties.clusterPoints = clusterIndex.getLeaves(superclusterProps.cluster_id as number, Infinity).map(d => d.properties)
    }
  }

  return points as (ClusterFeature<TopoJSONMapClusterDatum<D>> | PointFeature<D>)[]
}

export const getNextZoomLevelOnClusterClick = (level: number, maxZoom = 12): number =>
  clamp(1 + level * 1.5, level, maxZoom)

export function shouldClusterExpand<D extends GenericDataRecord> (
  cluster: TopoJSONMapPoint<D>,
  zoomLevel: number,
  midLevel = 4,
  maxLevel = 8,
  maxClusterZoomLevel = 23
): boolean {
  if (!cluster || !cluster.isCluster) return false

  const clusterProps = cluster.properties as TopoJSONMapClusterDatum<D>
  if (!clusterProps.clusterId || !cluster.clusterIndex) return false

  const clusterExpansionZoomLevel = cluster.clusterIndex.getClusterExpansionZoom(clusterProps.clusterId as number)
  return zoomLevel >= maxLevel ||
        (zoomLevel >= midLevel && (clusterProps.pointCount < 20 || clusterExpansionZoomLevel >= maxClusterZoomLevel))
}

export function getClusterRadius<D extends GenericDataRecord> (expandedCluster: { points: any[]; cluster: TopoJSONMapPoint<D> }): number {
  const { points } = expandedCluster
  const minX = min<number>(points.map((d: any) => d.dx - d.packedRadius))
  const maxX = max<number>(points.map((d: any) => d.dx + d.packedRadius))
  const minY = min<number>(points.map((d: any) => d.dy - d.packedRadius))
  const maxY = max<number>(points.map((d: any) => d.dy + d.packedRadius))
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5
}
