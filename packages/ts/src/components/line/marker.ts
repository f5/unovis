// Utils
import { clamp } from '@/utils/data'

// Local Types
import { LineDatum } from './types'

/** Builds a `moveto`-only path that carries a line pattern's marker, with roughly one marker per
 * `spacing` pixels of the chart's width, so the count follows the chart instead of the data.
 *
 * Returns `null` when the markers should stay on the line itself: without a spacing, or when the line
 * has fewer points than pixels — a smoothing `curveType` doesn't pass through the data points, and at
 * that density the gap between a marker and the line becomes visible. */
export function getThinnedMarkerPath (values: LineDatum[], width: number, spacing: number | undefined): string | null {
  if (!spacing || spacing <= 0) return null

  const defined = values.filter(v => v.defined)
  if (!defined.length || defined.length < width) return null

  // A point with no defined neighbour has no line segment to sit on, so its marker is the only thing
  // that shows it. Those always survive the thinning
  const points = new Set<LineDatum>(
    values.filter((v, i) => v.defined && !values[i - 1]?.defined && !values[i + 1]?.defined)
  )

  const count = clamp(Math.floor(width / spacing), 2, defined.length)
  const step = (defined.length - 1) / (count - 1)
  for (let i = 0; i < count; i += 1) points.add(defined[Math.round(i * step)])

  // `LineDatum.x` and `.y` are already in pixels, so they can go straight into the path
  return [...points]
    .sort((a, b) => a.x - b.x)
    .reduce((path, p) => `${path}M${p.x},${p.y}`, '')
}
