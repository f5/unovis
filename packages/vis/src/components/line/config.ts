// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curve'
import { GenericAccessor, StringAccessor } from 'types/accessor'
import { GenericDataRecord } from 'types/data'

export interface LineConfigInterface<Datum = GenericDataRecord> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  /** Line width in pixels */
  lineWidth?: number;
  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  lineDashArray?: GenericAccessor<number[], Datum>;
  /** Value to be used in case of no data */
  noDataValue?: number | null;
  /** Highlight line on hover */
  highlightOnHover?: boolean;
  /** Optional link cursor. Default: `null` */
  cursor?: StringAccessor<Datum[]>;
}

export class LineConfig<Datum = GenericDataRecord> extends XYComponentConfig<Datum> implements LineConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  lineWidth = 2
  lineDashArray = undefined
  noDataValue = null
  highlightOnHover = true
  cursor = null
}
