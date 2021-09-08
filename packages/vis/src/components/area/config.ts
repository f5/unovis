// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curve'
import { NumericAccessor, StringAccessor } from 'types/accessor'
import { GenericDataRecord } from 'types/data'

export interface AreaConfigInterface<Datum = GenericDataRecord> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  curveType?: CurveType;
  /** Baseline value or accessor function. Default: `undefined` */
  baseline?: NumericAccessor<Datum>;
  /** Opacity value or accessor function. Default: `1` */
  opacity?: NumericAccessor<Datum>;
  /** Optional area cursor. String or accessor function. Default: `null` */
  cursor?: StringAccessor<Datum[]>;
}

export class AreaConfig<Datum = GenericDataRecord> extends XYComponentConfig<Datum> implements AreaConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  baseline = (): number => 0
  opacity = 1
  cursor = null
}
