// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { symbol } from 'd3-shape'
import { smartTransition } from 'utils/d3'
import { Symbol } from 'enums/symbols'

export function createNodes (selection) {
  selection.attr('transform', d => `translate(${d.x},${d.y})`)
  selection.append('text')
  selection.append('path')
}

export function updateNodes (selection, duration) {
  const symbolGenerator = symbol()
  selection.each((d, i, elements) => {
    const group = select(elements[i])
    const text = group.select('text')
    const path = group.select('path')
    if (d.icon) {
      text.style('display', null)
      path.style('display', 'none')
      text
        .html(d.icon)
        .style('font-size', d.size)
      smartTransition(text, duration)
        .attr('fill', d.color)
    } else {
      text.style('display', 'none')
      path.style('display', null)
      path.attr('d', () => {
        symbolGenerator
          .size(d.size * d.size)
          .type(Symbol[d.shape])
        return symbolGenerator()
      })
      smartTransition(path, duration)
        .attr('fill', d.color)
    }
  })

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d.x},${d.y})`)
}

export function removeNodes (selection) {
  selection.remove()
}
