import { select } from 'd3-selection'

export function getHTMLTransform (el: HTMLElement): number[] {
  const styleTransform = select(el).style('transform')

  // Create a regular expression to match the transform values
  const match3D = styleTransform.match(/matrix3d\((.*?)\)/)
  const match2D = styleTransform.match(/matrix\((.*?)\)/)

  // If neither regex matched, return [0, 0, 0]
  if (!match3D && !match2D) return [0, 0, 0]

  // If matrix3d matched, parse the values and return them
  if (match3D) {
    const values = match3D[1].split(',').map(d => parseFloat(d.trim()))
    return values.slice(0, 3)
  }

  // If matrix matched, parse the values and return them, with 0 as the third value
  const values = match2D[1].split(',').map(d => parseFloat(d.trim()))
  values.push(0)
  return values.slice(0, 3)
}
