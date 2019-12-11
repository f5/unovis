// Copyright (c) Volterra, Inc. All rights reserved.
import { XYConfigInterface, XYConfig } from 'core/xy-component/config'
import { CurveType } from 'enums/curves'

export interface LineConfigInterface extends XYConfigInterface {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
}

export class LineConfig extends XYConfig implements LineConfigInterface {
  curveType = CurveType.MonotoneX
}
