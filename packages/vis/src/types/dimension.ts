// Copyright (c) Volterra, Inc. All rights reserved.

import { ContinuousScale } from 'types/scale'

export type Dimension = {
  /** D3 scale, e.g. Scale.ScaleLinear */
  scale?: ContinuousScale;
  /** Force set scale domain (data extent) */
  domain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the scale domain */
  domainMinConstraint?: [number | undefined, number | undefined];
  /** Constraint the maximum value of the scale domain */
  domainMaxConstraint?: [number | undefined, number | undefined];
  /** Force set the domain range (screen space) */
  range?: [number, number];
}
