// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curves'
import { NumericAccessor } from 'types/misc'

export interface AreaConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  /** Baseline accessor function */
  baseline?: NumericAccessor<Datum>;
}

export class AreaConfig<Datum> extends XYComponentConfig<Datum> implements AreaConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  baseline = undefined
}
