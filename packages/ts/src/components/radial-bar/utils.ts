export function getArcUnitBoundingBox (startAngle: number, endAngle: number): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const angleSweep = endAngle - startAngle
  if (Math.abs(angleSweep) >= 2 * Math.PI) {
    return { xMin: -1, xMax: 1, yMin: -1, yMax: 1 }
  }

  const minAngle = Math.min(startAngle, endAngle)
  const maxAngle = Math.max(startAngle, endAngle)

  // Start with the two endpoints and the origin (covers the inner corners of partial wedges).
  let xMin = 0
  let xMax = 0
  let yMin = 0
  let yMax = 0
  const expandBounds = (x: number, y: number): void => {
    if (x < xMin) xMin = x
    if (x > xMax) xMax = x
    if (y < yMin) yMin = y
    if (y > yMax) yMax = y
  }
  expandBounds(Math.sin(startAngle), -Math.cos(startAngle))
  expandBounds(Math.sin(endAngle), -Math.cos(endAngle))

  // Expand for cardinal extrema (any 2π·k offset) that fall inside [minAngle, maxAngle].
  const isCardinalAngleInRange = (cardinalAngle: number): boolean => {
    const minWrapCount = Math.ceil((minAngle - cardinalAngle) / (2 * Math.PI))
    const maxWrapCount = Math.floor((maxAngle - cardinalAngle) / (2 * Math.PI))
    return minWrapCount <= maxWrapCount
  }
  if (isCardinalAngleInRange(Math.PI / 2)) xMax = 1
  if (isCardinalAngleInRange(-Math.PI / 2)) xMin = -1
  if (isCardinalAngleInRange(0)) yMin = -1
  if (isCardinalAngleInRange(Math.PI)) yMax = 1

  return { xMin, xMax, yMin, yMax }
}
