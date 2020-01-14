// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { CurveType } from 'types/curves'

export interface LineConfigInterface extends XYComponentConfigInterface {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  lineWidth?: number;
}

export class LineConfig extends XYComponentConfig implements LineConfigInterface {
  curveType = CurveType.MonotoneX
  lineWidth = 2
}
