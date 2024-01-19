import { Selection, select } from 'd3-selection'
import { symbol } from 'd3-shape'

// Types
import { ColorAccessor } from 'types/accessor'
import { Symbol } from 'types/symbol'

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

export function updateBullets (
  container: Selection<SVGElement, BulletLegendItemInterface, HTMLDivElement, unknown>,
  config: BulletLegendConfigInterface,
  colorAccessor: ColorAccessor<BulletLegendItemInterface>
): void {
  container.each((d, i, els) => {
    const shape = getString(d, config.bulletShape, i) as BulletShape
    const color = getColor(d, colorAccessor, i)
    const width = BULLET_SIZE
    const height = shape === BulletShape.Line ? BULLET_SIZE / 2.5 : BULLET_SIZE

    const selection = select(els[i])
      .attr('viewBox', `0 0 ${width} ${height}`)
      .select<SVGPathElement>('path')
      .attr('stroke', color)

    if (shape === BulletShape.Line) {
      selection
        .attr('d', `M0,${height / 2} L${width / 2},${height / 2} L${width},${height / 2}`)
        .attr('transform', null)
        .style('opacity', d.inactive ? 0.4 : 1)
        .style('stroke-width', '3px')
        .style('fill', null)
        .style('fill-opacity', null)
        .style('marker-start', 'none')
        .style('marker-end', 'none')
    } else {
      const symbolGen = symbol().type(Symbol[shape])

      selection.attr('d', symbolGen)
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .style('stroke-width', '1px')
        .style('opacity', null)
        .style('fill', color)
        .style('fill-opacity', d.inactive ? 0.4 : 1)

      const box = selection.node().getBBox()
      const scaledSize = Math.min(width / box.width, height / box.height)
      const scale = Math.floor(scaledSize * 2) / 2

      selection.transition().duration(0).attr('d', symbolGen.size(scale * scale * 64))
    }
  })
}
