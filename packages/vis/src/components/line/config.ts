// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { CurveType } from 'types/curves'

export interface LineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  /** Line width in pixels */
  lineWidth?: number;
  /** Value to be used in case of no data */
  noDataValue?: number | null;
  /** Highlight line on hover */
  highlightOnHover?: boolean;
}

export class LineConfig<Datum> extends XYComponentConfig<Datum> implements LineConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  lineWidth = 2
  noDataValue = null
  highlightOnHover = true
}
