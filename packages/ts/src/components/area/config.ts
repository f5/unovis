import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { CurveType } from 'types/curve'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

export interface AreaConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Area color accessor function. The whole data array will be passed as the first argument. Default: `undefined` */
  color?: ColorAccessor<Datum[]>;
  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  curveType?: CurveType;
  /** Baseline value or accessor function. Default: `undefined` */
  baseline?: NumericAccessor<Datum>;
  /** Opacity value or accessor function. Default: `1` */
  opacity?: NumericAccessor<Datum[]>;
  /** Optional area cursor. String or accessor function. Default: `null` */
  cursor?: StringAccessor<Datum[]>;
  /** If an area is smaller than 1px, extend it to have 1px height.
   * This setting is useful when some of the area values are zeros or very small so visually they become
   * practically invisible, but you want to show that the data behind them exists and they're not just empty segments.
   * Default: `false` */
  minHeight1Px?: boolean;
}

export const AreaDefaultConfig: AreaConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  color: undefined,
  curveType: CurveType.MonotoneX,
  baseline: (): number => 0,
  opacity: 1,
  cursor: null,
  minHeight1Px: false,
}
