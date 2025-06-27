import { Selection, select } from 'd3-selection'
import { symbol } from 'd3-shape'

// Types
import { ColorAccessor } from 'types/accessor'
import { Symbol, SymbolType } from 'types/symbol'

// Utils
import { getColor } from 'utils/color'
import { getString } from 'utils/data'

// Constants
import { PATTERN_SIZE_PX } from 'styles/patterns'

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
  container: Selection<HTMLSpanElement, BulletLegendItemInterface, HTMLElement, unknown>,
  config: BulletLegendConfigInterface,
  colorAccessor: ColorAccessor<BulletLegendItemInterface>
): void {
  container.each((d, i, els) => {
    const bulletContainer = select(els[i])
    const shape = getString(d, config.bulletShape, i) as BulletShape
    const opacity = d.inactive ? 'var(--vis-legend-bullet-inactive-opacity)' : 1
    const colors = d.colors ?? [getColor(d, colorAccessor, i)]

    const svgs = bulletContainer.selectAll<SVGElement, string>('svg')
      .data(colors)

    const svgsEnter = svgs.enter().append('svg')
      .attr('height', '100%')
    svgsEnter.append('path')

    const svgsMerged = svgs.merge(svgsEnter)

    if (d.colors) {
      bulletContainer.style('display', 'flex')
      svgsMerged
        .style('flex', '1')
        .attr('width', null)
    } else {
      bulletContainer.style('display', null)
      svgsMerged
        .style('flex', null)
        .attr('width', '100%')
    }
    svgsMerged.each((color, j, svgNodes) => {
      const svg = select(svgNodes[j])
      const width = BULLET_SIZE
      const height = shape === BulletShape.Line ? BULLET_SIZE / 2.5 : BULLET_SIZE

      svg.attr('viewBox', `0 0 ${width} ${height}`)

      const bulletPath = svg.select<SVGPathElement>('path')
        .attr('stroke', color)

      if (shape === BulletShape.Line) {
        bulletPath
          .attr('d', `M0,${height / 2} L${width / 2},${height / 2} L${width},${height / 2}`)
          .attr('transform', null)
          .style('opacity', opacity)
          .style('stroke-width', '3px')
          .style('fill', null)
          .style('fill-opacity', null)
          .style('marker-start', 'none')
          .style('marker-end', 'none')
      } else {
        const symbolGen = symbol()
          .type(Symbol[shape])
          .size(width * height * shapeScale[shape])

        const scale = (width - 2) / width
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

        bulletPath
          .attr('d', symbolGen)
          .attr('transform', `translate(${width / 2}, ${Math.round(dy)}) scale(${scale})`)
          .style('stroke-width', '1px')
          .style('opacity', null)
          .style('fill', color)
          .style('fill-opacity', opacity)
      }
    })

    svgs.exit().remove()
  })
}
