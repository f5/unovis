import { XYComponentConfigInterface, XYComponentDefaultConfig } from '@/core/xy-component/config'

// Types
import { CurveType } from '@/types/curve'
import { ColorAccessor, GenericAccessor, StringAccessor } from '@/types/accessor'
import { LinePatternType } from '@/styles/patterns'

export interface LineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Line color accessor function. The whole data array will be passed as the first argument. Default: `undefined` */
  color?: ColorAccessor<Datum[]>;
  /** Line pattern accessor. Resolves to a `LinePatternType`. The whole data array is passed as the first argument. Default: `undefined` */
  pattern?: GenericAccessor<LinePatternType, Datum[]>;
  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  curveType?: CurveType;
  /** Line width in pixels. Default: `2` */
  lineWidth?: number;
  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  lineDashArray?: GenericAccessor<number[], Datum[]>;
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
  /** Distance in pixels between the markers of a line `pattern`. By default a marker is drawn on every
   * point of the line, which the browser repaints on every frame — at a few thousand points that alone
   * can halve the frame rate. Setting a spacing draws them on a separate, thinned out path instead, so
   * the count follows the chart's width rather than the size of the data.
   * Only applies when the line has at least one point per pixel; below that the markers stay on the line
   * itself, because a smoothing `curveType` can place them noticeably off it.
   * Default: `undefined` */
  markerSpacing?: number;
  /** Enable interpolated line where data points are missing or fallbackValue is used.
   * You can customize the line's appearance with `--vis-line-gapfill-stroke-dasharray`
   * and `--vis-line-gapfill-stroke-opacity` CSS variables.
   * Default: `false` */
  interpolateMissingData?: boolean;
}

export const LineDefaultConfig: LineConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  curveType: CurveType.MonotoneX,
  lineWidth: 2,
  lineDashArray: undefined,
  markerSpacing: undefined,
  fallbackValue: undefined,
  highlightOnHover: false,
  cursor: null,
  interpolateMissingData: false,
}
