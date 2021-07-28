// Copyright (c) Volterra, Inc. All rights reserved.
import { curveBasis, curveBasisClosed, curveBasisOpen, curveBundle, curveCardinal, curveCardinalClosed, curveCardinalOpen, curveCatmullRom, curveCatmullRomClosed, curveCatmullRomOpen, curveLinear, curveLinearClosed, curveMonotoneX, curveMonotoneY, curveNatural, curveStep, curveStepAfter, curveStepBefore } from 'd3-shape'

export enum CurveType {
  Basis = 'basis',
  BasisClosed = 'basisClosed',
  BasisOpen = 'basisOpen',
  Bundle = 'bundle',
  Cardinal = 'cardinal',
  CardinalClosed = 'cardinalClosed',
  CardinalOpen = 'cardinalOpen',
  CatmullRom = 'catmullRom',
  CatmullRomClosed = 'catmullRomClosed',
  CatmullRomOpen = 'catmullRomOpen',
  Linear = 'linear',
  LinearClosed = 'linearClosed',
  MonotoneX = 'monotoneX',
  MonotoneY = 'monotoneY',
  Natural = 'natural',
  Step = 'step',
  StepAfter = 'stepAfter',
  StepBefore = 'stepBefore',
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
