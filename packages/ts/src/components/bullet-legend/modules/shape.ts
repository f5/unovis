import { Selection } from 'd3-selection'

// Types
import { ColorAccessor } from 'types/accessor'

// Utils
import { getColor } from 'utils/color'
import { circlePath } from 'utils/path'

// Local types
import { BulletLegendConfigInterface } from '../config'
import { BulletShape, BulletLegendItemInterface } from '../types'

// Size with respect to the viewBox. We use this to compute path data which is independent of the
// the configured size.
const BULLET_SIZE = 20

function getWidth (shape: BulletShape): number {
  switch (shape) {
    case BulletShape.Line:
      return BULLET_SIZE * 2.5
    default:
      return BULLET_SIZE
  }
}

function getPath (shape: BulletShape, width: number, height: number): string {
  switch (shape) {
    case BulletShape.Line:
      return `M0,${height / 2} L${width / 2},${height / 2} L${width},${height / 2}`
    case BulletShape.Square:
      return `M0,0 L${width},0 L${width},${height} L0,${height}Z`
    case BulletShape.Circle:
      return circlePath(height / 2, height / 2, height / 2 - 1)
  }
}

export function createBullets (
  container: Selection<HTMLSpanElement, BulletLegendItemInterface, HTMLDivElement, unknown>,
  config: BulletLegendConfigInterface
): void {
  container.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .append('path')
    .attr('d', getPath(config.bulletShape, getWidth(config.bulletShape), BULLET_SIZE))
}

export function updateBullets (
  container: Selection<HTMLSpanElement, BulletLegendItemInterface, HTMLDivElement, unknown>,
  config: BulletLegendConfigInterface,
  colorAccessor: ColorAccessor<BulletLegendItemInterface>
): void {
  const height = BULLET_SIZE
  const width = getWidth(config.bulletShape)

  const getOpacity = (d: BulletLegendItemInterface): number => d.inactive ? 0.4 : 1

  const selection = container.select('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .select('path')
    .attr('d', getPath(config.bulletShape, width, height))
    .attr('stroke', (d, i) => getColor(d, colorAccessor, i))
    .style('stroke-width', '1px')
    .style('fill', (d, i) => getColor(d, colorAccessor, i))
    .style('fill-opacity', getOpacity)

  if (config.bulletShape === BulletShape.Line) {
    selection
      .style('stroke-width', `${height / 5}px`)
      .style('opacity', getOpacity)
      .style('fill', null)
      .style('fill-opacity', null)
      .style('marker-start', 'none')
      .style('marker-end', 'none')
  }
}
