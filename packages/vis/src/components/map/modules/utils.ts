// Copyright (c) Volterra, Inc. All rights reserved.
// Utils
import { clamp } from 'utils/data'

export function bBoxMerge (bBoxArray) {
  let box
  bBoxArray.forEach(coords => {
    if (!box) {
      box = {
        ...coords,
      }
    } else {
      if (box.x1 > coords.x1) box.x1 = coords.x1
      if (box.y1 > coords.y1) box.y1 = coords.y1
      if (box.x2 < coords.x2) box.x2 = coords.x2
      if (box.y2 < coords.y2) box.y2 = coords.y2
    }
  })

  return {
    x: box.x1,
    y: box.y1,
    width: box.x2 - box.x1,
    height: box.y2 - box.y1,
  }
}

export const clampZoomLevel = (level: number): number => clamp((1 + level * 2), (1 + level * 2), 12)
