import { Selection } from 'd3-selection'

export function renderBackground (
  backgroundRect: Selection<SVGRectElement, unknown, null, undefined>,
  bleedLeft: number | undefined,
  bleedTop: number | undefined,
  onClick: () => void
): void {
  backgroundRect
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('transform', `translate(${-(bleedLeft ?? 0)}, ${-(bleedTop ?? 0)})`)
    .style('cursor', 'default')
    .on('click', () => {
      onClick()
    })
}

