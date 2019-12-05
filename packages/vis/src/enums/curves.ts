// Copyright (c) Volterra, Inc. All rights reserved.
import { curveBasis, curveBasisClosed, curveBasisOpen, curveBundle, curveCardinal, curveCardinalClosed, curveCardinalOpen, curveCatmullRom, curveCatmullRomClosed, curveCatmullRomOpen, curveLinear, curveLinearClosed, curveMonotoneX, curveMonotoneY, curveNatural, curveStep, curveStepAfter, curveStepBefore } from 'd3-shape'

export enum CurveType {
  Basis,
  BasisClosed,
  BasisOpen,
  Bundle,
  Cardinal,
  CardinalClosed,
  CardinalOpen,
  CatmullRom,
  CatmullRomClosed,
  CatmullRomOpen,
  Linear,
  LinearClosed,
  MonotoneX,
  MonotoneY,
  Natural,
  Step,
  StepAfter,
  StepBefore,
}

export const Curve = {
  [CurveType.Basis]: curveBasis,
  [CurveType.BasisClosed]: curveBasisClosed,
  [CurveType.BasisOpen]: curveBasisOpen,
  [CurveType.Bundle]: curveBundle,
  [CurveType.Cardinal]: curveCardinal,
  [CurveType.CardinalClosed]: curveCardinalClosed,
  [CurveType.CardinalOpen]: curveCardinalOpen,
  [CurveType.CatmullRom]: curveCatmullRom,
  [CurveType.CatmullRomClosed]: curveCatmullRomClosed,
  [CurveType.CatmullRomOpen]: curveCatmullRomOpen,
  [CurveType.Linear]: curveLinear,
  [CurveType.LinearClosed]: curveLinearClosed,
  [CurveType.MonotoneX]: curveMonotoneX,
  [CurveType.MonotoneY]: curveMonotoneY,
  [CurveType.Natural]: curveNatural,
  [CurveType.Step]: curveStep,
  [CurveType.StepAfter]: curveStepAfter,
  [CurveType.StepBefore]: curveStepBefore,
}
