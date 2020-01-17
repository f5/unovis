// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { CurveType } from 'types/curves'

export interface LineConfigInterface<Data> extends XYComponentConfigInterface<Data> {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  lineWidth?: number;
}

export class LineConfig<Data> extends XYComponentConfig<Data> implements LineConfigInterface<Data> {
  curveType = CurveType.MonotoneX
  lineWidth = 2
}
