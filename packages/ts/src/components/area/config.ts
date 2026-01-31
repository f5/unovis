import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curve'
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

export interface AreaConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Area color accessor function. The whole data array will be passed as the first argument. Default: `undefined` */
  color?: ColorAccessor<Datum[]>;
  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  curveType?: CurveType | string;
  /** Baseline value or accessor function. Default: `undefined` */
  baseline?: NumericAccessor<Datum>;
  /** Opacity value or accessor function. Default: `1` */
  opacity?: NumericAccessor<Datum[]>;
  /** Optional area cursor. String or accessor function. Default: `null` */
  cursor?: StringAccessor<Datum[]>;
  /** Display a line on the top of the area. Default: `false` */
  line?: boolean;
  /** Line color accessor function. The whole data array will be passed as the first argument. Default: `undefined` */
  lineColor?: ColorAccessor<Datum[]>;
  /** Line width in pixels. Default: `2` */
  lineWidth?: number;
  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  lineDashArray?: GenericAccessor<number[], Datum[]>;
  /** If an area is smaller than 1px, extend it to have 1px height. Default: `false`
   * @deprecated Use minHeight instead
   */
  minHeight1Px?: boolean;
  /** Minimum height of the area, use carefully.
   * This setting is useful when some of the area values are zeros or very small so visually they become
   * practically invisible, but you want to show that the data behind them exists and they're not just empty segments.
   * Default: `undefined` */
  minHeight?: number;
  /** Whether to stack min height areas or not. Default: `undefined` */
  stackMinHeight?: boolean;
}

export const AreaDefaultConfig: AreaConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  color: undefined,
  curveType: CurveType.MonotoneX,
  baseline: (): number => 0,
  opacity: 1,
  cursor: null,
  line: false,
  lineColor: undefined,
  lineWidth: 2,
  lineDashArray: undefined,
  minHeight1Px: false,
  minHeight: undefined,
  stackMinHeight: false,
}
