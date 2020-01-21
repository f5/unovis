// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { CurveType } from 'types/curves'

export interface LineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  lineWidth?: number;
}

export class LineConfig<Datum> extends XYComponentConfig<Datum> implements LineConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  lineWidth = 2
}
