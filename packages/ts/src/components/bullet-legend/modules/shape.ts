import { Selection, select } from 'd3-selection'
import { symbol } from 'd3-shape'

// Types
import { ColorAccessor } from '@/types/accessor'
import { Symbol, SymbolType } from '@/types/symbol'

// Utils
import { getColor } from '@/utils/color'
import { ensureArray, getString } from '@/utils/data'
import { getCSSVariableValueInPixels } from '@/utils/misc'
import { toPx } from '@/utils/to-px'

// Constants
import { PATTERN_SIZE_PX } from '@/styles/patterns'

// Local types
import { BulletLegendConfigInterface } from '../config'
import { BulletShape, BulletLegendItemInterface } from '../types'

// Size with respect to the viewBox. We use this to compute path data which is independent of the
// the configured size.
const BULLET_SIZE = PATTERN_SIZE_PX * 3

// Different shapes need different scaling to fit the full size
const shapeScale: Record<SymbolType, number> = {
  [BulletShape.Circle]: Math.PI / 4,
  [BulletShape.Cross]: 5 / 9,
  [BulletShape.Diamond]: Math.sqrt(3) / 6,
  [BulletShape.Square]: 1,
  [BulletShape.Star]: 0.3,
  [BulletShape.Triangle]: Math.sqrt(3) / 4,
  [BulletShape.Wye]: 5 / 11,
}

export function getBulletsTotalWidth (bulletSize: number, numBullets: number, spacing: number): number {
  if (numBullets < 1) return 0
  return bulletSize * numBullets + spacing * (numBullets - 1)
}

export function createBullets (
  container: Selection<HTMLSpanElement, BulletLegendItemInterface, HTMLElement, unknown>
): void {
  container.each((d, i, els) => {
    select(els[i]).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .append('path')
  })
}

export function updateBullets (
  container: Selection<SVGElement, BulletLegendItemInterface, HTMLElement, unknown>,
  config: BulletLegendConfigInterface,
  colorAccessor: ColorAccessor<BulletLegendItemInterface>
): void {
  container.each((d, i, els) => {
    const shape = getString(d, config.bulletShape, i) as BulletShape
    const colors = ensureArray(d.color ?? getColor(d, colorAccessor, i))
    const numBullets = colors.length
    const bulletWidth = BULLET_SIZE
    const defaultBulletSize = toPx(config.bulletSize) || getCSSVariableValueInPixels('var(--vis-legend-bullet-size)', els[i])
    const spacing = config.bulletSpacing * (BULLET_SIZE / defaultBulletSize) // Scale spacing relative to bullet size
    const width = getBulletsTotalWidth(bulletWidth, numBullets, spacing)
    const height = shape === BulletShape.Line ? BULLET_SIZE / 2.5 : BULLET_SIZE

    const selection = select(els[i]).select('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)

    // Remove existing paths
    selection.selectAll('path').remove()

    const opacity = d.inactive ? 'var(--vis-legend-bullet-inactive-opacity)' : 1

    // Create a path for each color
    colors.forEach((color, colorIndex) => {
      const bulletPath = selection.append('path')

      if (shape === BulletShape.Line) {
        const x1 = colorIndex * (bulletWidth + spacing)
        const x2 = x1 + bulletWidth
        bulletPath
          .attr('d', `M${x1},${height / 2} L${x2},${height / 2}`)
          .attr('transform', null)
          .style('opacity', opacity)
          .style('stroke', color)
          .style('stroke-width', '3px')
          .style('fill', null)
          .style('fill-opacity', null)
          .style('marker-start', 'none')
          .style('marker-end', 'none')
      } else {
        const symbolGen = symbol()
          .type(Symbol[shape])
          .size(bulletWidth * height * shapeScale[shape])

        const scale = (bulletWidth - 2) / bulletWidth
        let dy = height / 2
        switch (shape) {
          case BulletShape.Triangle:
            dy += height / 8
            break
          case BulletShape.Star:
            dy += height / 16
            break
          case BulletShape.Wye:
            dy -= height / 16
            break
        }

        const dx = colorIndex * (bulletWidth + spacing) + bulletWidth / 2
        bulletPath
          .attr('d', symbolGen)
          .attr('transform', `translate(${dx}, ${Math.round(dy)}) scale(${scale})`)
          .style('stroke', color)
          .style('stroke-width', '1px')
          .style('opacity', null)
          .style('fill', color)
          .style('fill-opacity', opacity)
      }
    })
  })
}
