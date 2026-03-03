import { Selection } from 'd3-selection'

export interface BackgroundContext {
  bleed: { left?: number; top?: number };
  onClick: () => void;
}

export function renderBackground (
  backgroundRect: Selection<SVGRectElement, unknown, null, undefined>,
  bgContext: BackgroundContext
): void {
  backgroundRect
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('transform', `translate(${-(bgContext.bleed.left ?? 0)}, ${-(bgContext.bleed.top ?? 0)})`)
    .style('cursor', 'default')
    .on('click', () => {
      bgContext.onClick()
    })
}

