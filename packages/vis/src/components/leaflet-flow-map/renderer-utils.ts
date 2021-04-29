// Copyright (c) Volterra, Inc. All rights reserved.
import { Color } from 'three/src/math/Color'

export const DEFAULT_POINT_RADIUS = 1
export const DEFAULT_POINT_COLOR = 'rgba(255, 113, 111, 1.000)'

export function getRadius (r: number | undefined, devicePixelRatio: number): number {
  return (r ?? DEFAULT_POINT_RADIUS) * devicePixelRatio
}

export function getColor (color: string | undefined): Color {
  const c = new Color()
  c.set(color ?? DEFAULT_POINT_COLOR)
  return c
}
