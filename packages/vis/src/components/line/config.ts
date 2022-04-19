import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curve'
import { GenericAccessor, StringAccessor } from 'types/accessor'

export interface LineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  curveType?: CurveType;
  /** Line width in pixels. Default: `2` */
  lineWidth?: number;
  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  lineDashArray?: GenericAccessor<number[], Datum>;
  /** When a data point has an `undefined`, `NaN`, or other no-data value, they'll be replaced with a value specified here.
   * Setting this property to `undefined` will lead to having the line break when there's no data, and continue when
   * the data appears again. If you set it to `null`, the values will be treated as numerical `0` values and the line
   * won't break; however if the whole dataset consists of only `null`s, the line won't be displayed.
   * Default: `undefined`
  */
  fallbackValue?: number | undefined | null;
  /** Highlight line on hover. Default: `false` */
  highlightOnHover?: boolean;
  /** Optional link cursor. Default: `null` */
  cursor?: StringAccessor<Datum[]>;
}

export class LineConfig<Datum> extends XYComponentConfig<Datum> implements LineConfigInterface<Datum> {
  curveType = CurveType.MonotoneX
  lineWidth = 2
  lineDashArray = undefined
  fallbackValue = undefined
  highlightOnHover = false
  cursor = null
}
