// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curves'
import { StringAccessor } from 'types/misc'

export interface LineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  /** Line width in pixels */
  lineWidth?: number;
  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  lineDashArray?: number[];
  /** Value to be used in case of no data */
  noDataValue?: number | null;
  /** Highlight line on hover */
  highlightOnHover?: boolean;
  /** Optional link cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
}

export class LineConfig<Datum> extends XYComponentConfig<Datum> implements LineConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  lineWidth = 2
  lineDashArray = undefined
  noDataValue = null
  highlightOnHover = true
  cursor = null
}
