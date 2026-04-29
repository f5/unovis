import { describe, expect, it } from 'vitest'

import { HORIZONTAL_X, HORIZONTAL_Y, VERTICAL_X, VERTICAL_Y } from './constants'
import { PlotlineLabelPosition } from './types'

const INPUT = { width: 400, height: 200, offsetX: 14, offsetY: 14 }

const POSITIONS = [
  PlotlineLabelPosition.TopLeft,
  PlotlineLabelPosition.Top,
  PlotlineLabelPosition.TopRight,
  PlotlineLabelPosition.Right,
  PlotlineLabelPosition.BottomRight,
  PlotlineLabelPosition.Bottom,
  PlotlineLabelPosition.BottomLeft,
  PlotlineLabelPosition.Left,
]

function snapshot (map: typeof HORIZONTAL_X): Record<string, unknown> {
  return Object.fromEntries(POSITIONS.map(pos => [pos, map[pos](INPUT)]))
}

describe('Plotline label position maps', () => {
  it('HORIZONTAL_X: anchors are stable across positions', () => {
    expect(snapshot(HORIZONTAL_X)).toMatchInlineSnapshot(`
      {
        "bottom": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 400,
          "y": 186,
        },
        "bottom-left": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 186,
        },
        "bottom-right": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 414,
          "y": 186,
        },
        "left": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 386,
          "y": 100,
        },
        "right": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 414,
          "y": 100,
        },
        "top": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 400,
          "y": 14,
        },
        "top-left": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 14,
        },
        "top-right": {
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
        "bottom": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 400,
          "y": 186,
        },
        "bottom-left": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 386,
          "y": 186,
        },
        "bottom-right": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 414,
          "y": 186,
        },
        "left": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 386,
          "y": 100,
        },
        "right": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 414,
          "y": 100,
        },
        "top": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 400,
          "y": 14,
        },
        "top-left": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 14,
        },
        "top-right": {
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
        "bottom": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 200,
          "y": 214,
        },
        "bottom-left": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 214,
        },
        "bottom-right": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 214,
        },
        "left": {
          "dominantBaseline": "middle",
          "textAnchor": "start",
          "x": 14,
          "y": 200,
        },
        "right": {
          "dominantBaseline": "middle",
          "textAnchor": "end",
          "x": 386,
          "y": 200,
        },
        "top": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 200,
          "y": 186,
        },
        "top-left": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 186,
        },
        "top-right": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 186,
        },
      }
    `)
  })

  it('VERTICAL_Y: anchors are stable across positions', () => {
    expect(snapshot(VERTICAL_Y)).toMatchInlineSnapshot(`
      {
        "bottom": {
          "dominantBaseline": "central",
          "textAnchor": "end",
          "x": 200,
          "y": 214,
        },
        "bottom-left": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "end",
          "x": 14,
          "y": 214,
        },
        "bottom-right": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "end",
          "x": 386,
          "y": 214,
        },
        "left": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "middle",
          "x": 14,
          "y": 200,
        },
        "right": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "middle",
          "x": 386,
          "y": 200,
        },
        "top": {
          "dominantBaseline": "central",
          "textAnchor": "start",
          "x": 200,
          "y": 186,
        },
        "top-left": {
          "dominantBaseline": "text-before-edge",
          "textAnchor": "start",
          "x": 14,
          "y": 186,
        },
        "top-right": {
          "dominantBaseline": "text-after-edge",
          "textAnchor": "start",
          "x": 386,
          "y": 186,
        },
      }
    `)
  })
})
