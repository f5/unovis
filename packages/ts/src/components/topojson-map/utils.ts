import { getNumber } from 'utils/data'
import { polygon, circlePath } from 'utils/path'

// Config
import { NumericAccessor } from 'types/accessor'

// Local Types
import { TopoJSONMapPieDatum, TopoJSONMapPointShape, TopoJSONMapPointStyles } from './types'

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
    .filter(item => item.value > 0)
}
