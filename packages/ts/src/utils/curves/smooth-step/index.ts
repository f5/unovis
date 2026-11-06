import type { CurveFactoryLineOnly, CurveGeneratorLineOnly } from 'd3-shape'

import { SMOOTH_STEP_RADIUS, SMOOTH_STEP_OFFSET } from './constants'

export enum SmoothStepDirection {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
  Auto = 'auto',
}

export interface SmoothStepCurveFactory extends CurveFactoryLineOnly {
  /** Maximum corner radius in pixels. Returns a new factory. Default: `5` */
  radius: (radius: number) => SmoothStepCurveFactory;
  /** Straight exit and entry offset in pixels. Returns a new factory. Default: `20` */
  offset: (offset: number) => SmoothStepCurveFactory;
  /** Flow direction; `'auto'` chooses the dominant axis per segment. Returns a new factory. Default: `'down'` */
  direction: (direction: SmoothStepDirection) => SmoothStepCurveFactory;
}

function getSmoothStepPoints (x1: number, y1: number, x2: number, y2: number, offset: number, axis: 'x' | 'y', direction: 1 | -1): [number, number][] {
  const [p1, q1] = axis === 'y' ? [y1, x1] : [x1, y1]
  const [p2, q2] = axis === 'y' ? [y2, x2] : [x2, y2]
  const toPoint = (p: number, q: number): [number, number] => axis === 'y' ? [q, p] : [p, q]

  const sourceGappedP = p1 + offset * direction
  const targetGappedP = p2 - offset * direction
  const isSourceOnExitSide = direction > 0 ? p1 < p2 : p1 > p2
  const centerQ = (q1 + q2) / 2
  const centerP = (sourceGappedP + targetGappedP) / 2

  const bend: [number, number][] = isSourceOnExitSide
    ? [toPoint(centerP, q1), toPoint(centerP, q2)]
    : [toPoint(sourceGappedP, centerQ), toPoint(targetGappedP, centerQ)]

  return [toPoint(p1, q1), toPoint(sourceGappedP, q1), ...bend, toPoint(targetGappedP, q2), toPoint(p2, q2)]
}

function createSmoothStep (radius: number, offset: number, direction: SmoothStepDirection): SmoothStepCurveFactory {
  return Object.assign((context: Parameters<CurveFactoryLineOnly>[0]): CurveGeneratorLineOnly => {
    let source: [number, number] | undefined
    let target: [number, number] | undefined

    return {
      lineStart (): void {
        source = undefined
        target = undefined
      },
      point (x: number, y: number): void {
        // Graph supplies Bezier control points between endpoints; this link curve routes only the endpoints.
        if (!source) source = [x, y]
        else target = [x, y]
      },
      lineEnd (): void {
        if (!source) return
        context.moveTo(...source)
        if (!target) return

        const dx = target[0] - source[0]
        const dy = target[1] - source[1]
        const axis = direction === SmoothStepDirection.Auto
          ? (Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y')
          : (direction === SmoothStepDirection.Left || direction === SmoothStepDirection.Right ? 'x' : 'y')
        const sign = direction === SmoothStepDirection.Auto
          ? ((axis === 'x' ? dx : dy) >= 0 ? 1 : -1)
          : (direction === SmoothStepDirection.Up || direction === SmoothStepDirection.Left ? -1 : 1)

        const points = getSmoothStepPoints(...source, ...target, offset, axis, sign)
          .filter((point, i, all) => i === 0 || point[0] !== all[i - 1][0] || point[1] !== all[i - 1][1])

        for (let i = 1; i < points.length - 1; i++) {
          const [a, b, c] = points.slice(i - 1, i + 2)
          if ((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1])) {
            context.lineTo(...b)
            continue
          }

          const before = Math.hypot(b[0] - a[0], b[1] - a[1])
          const after = Math.hypot(c[0] - b[0], c[1] - b[1])
          const size = Math.min(before / 2, after / 2, radius)
          context.lineTo(b[0] + (a[0] - b[0]) * size / before, b[1] + (a[1] - b[1]) * size / before)
          context.quadraticCurveTo(b[0], b[1], b[0] + (c[0] - b[0]) * size / after, b[1] + (c[1] - b[1]) * size / after)
        }

        context.lineTo(...target)
      },
    }
  }, {
    radius: (value: number): SmoothStepCurveFactory => createSmoothStep(value, offset, direction),
    offset: (value: number): SmoothStepCurveFactory => createSmoothStep(radius, value, direction),
    direction: (value: SmoothStepDirection): SmoothStepCurveFactory => createSmoothStep(radius, offset, value),
  })
}

/** Routes the first and last points of each line segment with rounded orthogonal corners.
 * Intermediate points (including Graph's Bezier control points) are ignored. Supports d3-line
 * and SVG/Canvas contexts; does not implement the area-generator interface. */
export const curveSmoothStep = createSmoothStep(SMOOTH_STEP_RADIUS, SMOOTH_STEP_OFFSET, SmoothStepDirection.Down)
