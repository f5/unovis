// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curve'
import { NumericAccessor, StringAccessor } from 'types/misc'

export interface AreaConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  curveType?: CurveType;
  /** Baseline accessor function. Default: `undefined` */
  baseline?: NumericAccessor<Datum>;
  /** Opacity accessor function. Default: `1` */
  opacity?: NumericAccessor<Datum>;
  /** Optional area cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
}

export class AreaConfig<Datum> extends XYComponentConfig<Datum> implements AreaConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  baseline = (): number => 0
  opacity = 1
  cursor = null
}
