import { describe, expect, it } from 'vitest'

import { HORIZONTAL_X, HORIZONTAL_Y, VERTICAL_X, VERTICAL_Y } from './constants'
import { PlotbandLabelPosition } from './types'

const INPUT = { startX: 100, startY: 50, width: 300, height: 150, offsetX: 14, offsetY: 14 }

const POSITIONS = [
  PlotbandLabelPosition.TopLeftOutside,
  PlotbandLabelPosition.TopLeftInside,
  PlotbandLabelPosition.TopOutside,
  PlotbandLabelPosition.TopInside,
  PlotbandLabelPosition.TopRightOutside,
  PlotbandLabelPosition.TopRightInside,
  PlotbandLabelPosition.RightOutside,
  PlotbandLabelPosition.RightInside,
  PlotbandLabelPosition.BottomRightOutside,
  PlotbandLabelPosition.BottomRightInside,
  PlotbandLabelPosition.BottomOutside,
  PlotbandLabelPosition.BottomInside,
  PlotbandLabelPosition.BottomLeftOutside,
  PlotbandLabelPosition.BottomLeftInside,
  PlotbandLabelPosition.LeftOutside,
  PlotbandLabelPosition.LeftInside,
]

function snapshot (map: typeof HORIZONTAL_X): Record<string, unknown> {
  return Object.fromEntries(POSITIONS.map(pos => [pos, map[pos](INPUT)]))
}

describe('Plotband label position maps', () => {
  it('HORIZONTAL_X: anchors are stable across positions', () => {
    expect(snapshot(HORIZONTAL_X)).toMatchInlineSnapshot(`
      {
        "bottom-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 136,
        },
        "bottom-left-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 114,
          "y": 136,
        },
        "bottom-left-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 86,
          "y": 136,
        },
        "bottom-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 136,
        },
        "bottom-right-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 136,
        },
        "bottom-right-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 414,
          "y": 136,
        },
        "left-inside": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 114,
          "y": 75,
        },
        "left-outside": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 86,
          "y": 75,
        },
        "right-inside": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 386,
          "y": 75,
        },
        "right-outside": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 414,
          "y": 75,
        },
        "top-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 14,
        },
        "top-left-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 114,
          "y": 14,
        },
        "top-left-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 86,
          "y": 14,
        },
        "top-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 14,
        },
        "top-right-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 14,
        },
        "top-right-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 414,
          "y": 14,
        },
      }
    `)
  })

  it('VERTICAL_X: anchors are stable across positions', () => {
    expect(snapshot(VERTICAL_X)).toMatchInlineSnapshot(`
      {
        "bottom-inside": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 250,
          "y": 136,
        },
        "bottom-left-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 114,
          "y": 136,
        },
        "bottom-left-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 86,
          "y": 136,
        },
        "bottom-outside": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 250,
          "y": 136,
        },
        "bottom-right-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 386,
          "y": 136,
        },
        "bottom-right-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 414,
          "y": 136,
        },
        "left-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 114,
          "y": 75,
        },
        "left-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 86,
          "y": 75,
        },
        "right-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 386,
          "y": 75,
        },
        "right-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 414,
          "y": 75,
        },
        "top-inside": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 250,
          "y": 14,
        },
        "top-left-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 114,
          "y": 14,
        },
        "top-left-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 86,
          "y": 14,
        },
        "top-outside": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 250,
          "y": 14,
        },
        "top-right-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 14,
        },
        "top-right-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 414,
          "y": 14,
        },
      }
    `)
  })

  it('HORIZONTAL_Y: anchors are stable across positions', () => {
    expect(snapshot(HORIZONTAL_Y)).toMatchInlineSnapshot(`
      {
        "bottom-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 186,
        },
        "bottom-left-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 186,
        },
        "bottom-left-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 214,
        },
        "bottom-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 214,
        },
        "bottom-right-inside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 286,
          "y": 186,
        },
        "bottom-right-outside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 286,
          "y": 214,
        },
        "left-inside": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 14,
          "y": 125,
        },
        "left-outside": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 14,
          "y": 125,
        },
        "right-inside": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 286,
          "y": 125,
        },
        "right-outside": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 286,
          "y": 125,
        },
        "top-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 64,
        },
        "top-left-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 64,
        },
        "top-left-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 36,
        },
        "top-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 250,
          "y": 36,
        },
        "top-right-inside": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 286,
          "y": 64,
        },
        "top-right-outside": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 286,
          "y": 36,
        },
      }
    `)
  })

  it('VERTICAL_Y: anchors are stable across positions', () => {
    expect(snapshot(VERTICAL_Y)).toMatchInlineSnapshot(`
      {
        "bottom-inside": {
          "dominantBaseline": "middle",
          "rotation": -90,
          "textAnchor": "start",
          "x": 250,
          "y": 186,
        },
        "bottom-left-inside": {
          "dominantBaseline": "text-before-edge",
          "rotation": -90,
          "textAnchor": "start",
          "x": 14,
          "y": 186,
        },
        "bottom-left-outside": {
          "dominantBaseline": "text-before-edge",
          "rotation": -90,
          "textAnchor": "end",
          "x": 14,
          "y": 214,
        },
        "bottom-outside": {
          "dominantBaseline": "middle",
          "rotation": -90,
          "textAnchor": "start",
          "x": 250,
          "y": 214,
        },
        "bottom-right-inside": {
          "dominantBaseline": "text-after-edge",
          "rotation": -90,
          "textAnchor": "start",
          "x": 286,
          "y": 186,
        },
        "bottom-right-outside": {
          "dominantBaseline": "text-before-edge",
          "rotation": -90,
          "textAnchor": "start",
          "x": 286,
          "y": 214,
        },
        "left-inside": {
          "dominantBaseline": "text-before-edge",
          "rotation": -90,
          "textAnchor": "middle",
          "x": 14,
          "y": 125,
        },
        "left-outside": {
          "dominantBaseline": "text-before-edge",
          "rotation": -90,
          "textAnchor": "middle",
          "x": 14,
          "y": 125,
        },
        "right-inside": {
          "dominantBaseline": "text-after-edge",
          "rotation": -90,
          "textAnchor": "middle",
          "x": 286,
          "y": 125,
        },
        "right-outside": {
          "dominantBaseline": "text-after-edge",
          "rotation": -90,
          "textAnchor": "middle",
          "x": 286,
          "y": 125,
        },
        "top-inside": {
          "dominantBaseline": "middle",
          "rotation": -90,
          "textAnchor": "end",
          "x": 250,
          "y": 64,
        },
        "top-left-inside": {
          "dominantBaseline": "text-before-edge",
          "rotation": -90,
          "textAnchor": "end",
          "x": 14,
          "y": 64,
        },
        "top-left-outside": {
          "dominantBaseline": "text-after-edge",
          "rotation": -90,
          "textAnchor": "start",
          "x": 14,
          "y": 36,
        },
        "top-outside": {
          "dominantBaseline": "middle",
          "rotation": -90,
          "textAnchor": "end",
          "x": 250,
          "y": 36,
        },
        "top-right-inside": {
          "dominantBaseline": "text-after-edge",
          "rotation": -90,
          "textAnchor": "end",
          "x": 286,
          "y": 64,
        },
        "top-right-outside": {
          "dominantBaseline": "text-after-edge",
          "rotation": -90,
          "textAnchor": "start",
          "x": 286,
          "y": 36,
        },
      }
    `)
  })
})
