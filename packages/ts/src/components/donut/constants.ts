export const DONUT_HALF_ANGLE_RANGES = Array.from({ length: 4 }, (_, i): [number, number] => {
  const offset = -Math.PI / 2 + i * Math.PI / 2
  return [offset, offset + Math.PI]
})

export const [
  DONUT_HALF_ANGLE_RANGE_TOP,
  DONUT_HALF_ANGLE_RANGE_RIGHT,
  DONUT_HALF_ANGLE_RANGE_BOTTOM,
  DONUT_HALF_ANGLE_RANGE_LEFT,
] = DONUT_HALF_ANGLE_RANGES
