import { Curve } from '@unovis/ts/types/curve'
import { SmoothStepDirection } from '@unovis/ts/utils/curves/smooth-step'

export const CURVE_OPTIONS = [
  { label: 'curveSmoothStep', value: undefined },
  { label: 'curveBasis', value: Curve.basis },
  { label: 'curveCardinal', value: Curve.cardinal },
  { label: 'curveCatmullRom', value: Curve.catmullRom },
  { label: 'curveLinear', value: Curve.linear },
  { label: 'curveNatural', value: Curve.natural },
  { label: 'curveStep', value: Curve.step },
  { label: 'curveStepAfter', value: Curve.stepAfter },
  { label: 'curveStepBefore', value: Curve.stepBefore },
]

export const DIRECTIONS = Object.values(SmoothStepDirection)
