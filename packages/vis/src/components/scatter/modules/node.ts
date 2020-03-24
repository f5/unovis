// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { symbol } from 'd3-shape'
import { smartTransition } from 'utils/d3'
import { Symbol } from 'types/symbols'

export function createNodes (selection) {
  selection.attr('transform', d => `translate(${d._screen.x},${d._screen.y})`)
  selection.append('text')
  selection.append('path')
}

export function updateNodes (selection, duration) {
  const symbolGenerator = symbol()
  selection.each((d, i, elements) => {
    const group = select(elements[i])
    const text = group.select('text')
    const path = group.select('path')
    if (d._screen.icon) {
      text.style('display', null)
      path.style('display', 'none')
      text
        .html(d._screen.icon)
        .style('font-size', d._screen.size)
      smartTransition(text, duration)
        .attr('fill', d._screen.color)
    } else {
      text.style('display', 'none')
      path.style('display', null)
      path.attr('d', () => {
        symbolGenerator
          .size(d._screen.size * d._screen.size)
          .type(Symbol[d._screen.shape])
        return symbolGenerator()
      })
      smartTransition(path, duration)
        .attr('fill', d._screen.color)
    }
  })

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._screen.x},${d._screen.y})`)
}

export function removeNodes (selection) {
  selection.remove()
}
