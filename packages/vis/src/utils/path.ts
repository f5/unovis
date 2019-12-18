// Copyright (c) Volterra, Inc. All rights reserved.

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
