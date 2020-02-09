// Copyright (c) Volterra, Inc. All rights reserved.
import { range } from 'd3-array'
import { line, curveCardinal, curveCardinalClosed } from 'd3-shape'

/*
 * Generate SVG path for rectangle with rounded corners
 *
 * @param {Object} props - Configuration object
 * @param {Number} props.x - Rect top left X coordinate
 * @param {Number} props.y - Rect top left Y coordinate
 * @param {Number} props.w - Rect width
 * @param {Number} props.h - Rect height
 * @param {Bool} [props.tl=undefined] - Round top left corner
 * @param {Bool} [props.tr=undefined] - Round top right corner
 * @param {Bool} [props.bl=undefined] - Round bottom left corner
 * @param {Bool} [props.br=undefined] - Round bottom right corner
 * @param {Number} [props.r=0] - Corner Radius
 * @return {String} Path string for the `d` attribute
 */
export function roundedRectPath ({ x, y, w, h, tl, tr, bl, br, r = 0 }) {
  let path
  path = `M${x + r},${y}h${w - 2 * r}`

  let roundedR = tr ? r : 0
  let angularR = tr ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${roundedR},${roundedR}`
  path += `h${angularR}v${angularR}`
  path += `v${h - 2 * r}`

  roundedR = br ? r : 0
  angularR = br ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${-roundedR},${roundedR}`
  path += `v${angularR}h${-angularR}`
  path += `h${2 * r - w}`

  roundedR = bl ? r : 0
  angularR = bl ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${-roundedR},${-roundedR}`
  path += `h${-angularR}v${-angularR}`
  path += `v${2 * r - h}`

  roundedR = tl ? r : 0
  angularR = tl ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${roundedR},${-roundedR}`
  path += `v${-angularR}h${angularR}`

  path += 'z'
  return path
}

export function polygon (size, n = 6, endAngle = 2 * Math.PI, open = false): string {
  const r = n === 4 ? Math.sqrt(0.5) * size : size / 3.6 * 2
  const deltaAngle = n === 4 ? Math.PI / 4 : 0 // rotate to 45 grads if shape is a rectangle
  const shiftedEndAngle = endAngle - deltaAngle

  const completion = (shiftedEndAngle < 0 ? endAngle : shiftedEndAngle) / (2 * Math.PI)
  const nSegments = Math.ceil(n * completion)

  const centerAngle = 1 / n * Math.PI * 2 //          /\
  const baseAngle = (Math.PI - centerAngle) / 2 //   /__\

  const data = range(nSegments + (shiftedEndAngle >= 0 ? 1 : 0))
    .map((d, i) => {
      const isLastSegment = i === nSegments || (nSegments === 1 && shiftedEndAngle < 0)
      let mult = isLastSegment ? ((completion * n) % 1 || 1) : 1 // Handle partial shape
      if (shiftedEndAngle < 0) {
        mult += 0.5
      }
      const angle = centerAngle * (i - 1 + mult)

      let radius
      if (isLastSegment) {
        const thirdAngle = Math.PI - baseAngle - centerAngle * mult
        radius = r * Math.sin(baseAngle) / Math.sin(thirdAngle) // Law of sines
      } else {
        radius = r
      }

      return {
        x: Math.sin(angle + deltaAngle) * radius,
        y: -Math.cos(angle + deltaAngle) * radius,
      }
    })

  if (n === 4) {
    const angle = centerAngle * (-1 + 0.5)
    const thirdAngle = Math.PI * 0.5
    const radius = r * Math.sin(baseAngle) / Math.sin(thirdAngle) // Law of sines
    data.unshift({
      x: Math.sin(angle + deltaAngle) * radius,
      y: -Math.cos(angle + deltaAngle) * radius,
    })
  }

  const path = line<any>()
    /* eslint-disable-next-line dot-notation */
    .x(d => d['x'])
    /* eslint-disable-next-line dot-notation */
    .y(d => d['y'])
    .curve((open ? curveCardinal : curveCardinalClosed).tension(0.95))

  return path(data)
}

export function circlePath (cx: number, cy: number, r: number): string {
  return `
    M ${cx} ${cy}
    m ${-r}, 0
    a ${r},${r} 0 1,1 ${r * 2},0
    a ${r},${r} 0 1,1 ${-r * 2},0`
}
