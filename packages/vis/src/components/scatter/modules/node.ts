// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { symbol } from 'd3-shape'
import { color } from 'd3-color'
import { Symbol } from 'types/symbols'

// Utils
import { smartTransition } from 'utils/d3'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'
import { hexToBrightness } from 'utils/color'

export function createNodes (selection): void {
  selection.attr('transform', d => `translate(${d._screen.x},${d._screen.y})`)
  selection.append('path').style('fill', d => d._screen.color)
  selection.append('text')
    .style('text-anchor', 'middle')
    .style('dominant-baseline', 'central')
    .style('fill', d => d._screen.color)
    .style('pointer-events', 'none')

  selection.attr('transform', d => `translate(${d._screen.x},${d._screen.y}) scale(0)`)
}

export function updateNodes (selection, config, duration): void {
  const symbolGenerator = symbol()

  selection.each((d, i, elements) => {
    const group = select(elements[i])
    const text = group.select('text')
    const path = group.select('path')

    // Shape
    const pointDiameter = d._screen.size
    const pointColor = d._screen.color
    path.attr('d', () => {
      const svgPath = d._screen.shape ? symbolGenerator
        .size(pointDiameter * pointDiameter)
        .type(Symbol[d._screen.shape])() : null
      return svgPath
    })

    smartTransition(path, duration)
      .style('fill', pointColor)
      .style('stroke', pointColor)

    // Label
    const pointLabelText = d._screen.label ?? ''
    const textLength = pointLabelText.length
    const pointLabelFontSize = 0.5 * pointDiameter / Math.pow(textLength, 0.4)

    let labelColor = d._screen.labelColor
    if (!labelColor) {
      const hex = color(isStringCSSVariable(pointColor) ? getCSSVariableValue(pointColor, this.element) : pointColor)?.hex()
      const brightness = hexToBrightness(hex)
      labelColor = brightness > config.labelTextBrightnessRatio ? 'var(--vis-scatter-point-label-text-color-dark)' : 'var(--vis-scatter-point-label-text-color-light)'
    }

    text.html(pointLabelText)
      .style('font-size', pointLabelFontSize)

    smartTransition(text, duration)
      .style('fill', labelColor)

    path.style('cursor', d._screen.cursor)
  })

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._screen.x},${d._screen.y}) scale(1)`)
}

export function removeNodes (selection, duration): void {
  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._screen.x},${d._screen.y}) scale(0)`)
    .remove()
}
