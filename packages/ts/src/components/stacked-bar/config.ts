import { XYComponentConfigInterface, XYComponentDefaultConfig } from '@/core/xy-component/config'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from '@/types/accessor'
import { FillPatternType } from '@/styles/patterns'
import { Orientation } from '@/types/position'
import { StyleDeclaration } from '@/types/style'

export interface StackedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Bar color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum>;
  /** Bar fill pattern accessor. Resolves to a `FillPatternType`. Default: `undefined` */
  pattern?: GenericAccessor<FillPatternType, Datum>;
  /** Per-bar inline styles accessor, called with the datum and its stack index. The returned
   * object is applied as inline styles, with camelCase keys converted to kebab-case.
   * Keys the component manages itself (`fill`, `opacity`, `cursor`, `mask`) take precedence over
   * their defaults (e.g. the `color` accessor) and stay animated; all other keys are applied
   * instantly. Keys no longer returned are cleaned up on the next render. Default: `undefined` */
  barStyle?: GenericAccessor<StyleDeclaration, Datum>;
  /** The value each bar's stack starts from, instead of zero. Number or accessor function.
   * Useful for floating bars and waterfall charts, where every bar starts where the previous one ended.
   * Default: `undefined` */
  baseline?: NumericAccessor<Datum>;
  /** Force set bar width in pixels. Default: `undefined` */
  barWidth?: number;
  /** Maximum bar width for dynamic sizing. Default: `undefined` */
  barMaxWidth?: number;
  /** Expected step between the bars in the X axis units.
   * Needed to correctly calculate the width of the bars when there are gaps in the data.
   * Default: `undefined` */
  dataStep?: number;
  /** Fractional padding between the bars in the range of [0,1). Default: `0` */
  barPadding?: number;
  /** Rounded corners for top bars. Boolean or number (to set the radius in pixels). Default: `2` */
  roundedCorners?: number | boolean;
  /** Configurable bar cursor when hovering over. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Sets the minimum bar height to 1 pixel for better visibility of small values. Default: `false` */
  barMinHeight1Px?: boolean;
  /** Base value to test data existence when `barMinHeight1Px` is set to `true`.
   * Everything equal to barMinHeightZeroValue will not be rendered on the chart.
   * Default: `null` */
  barMinHeightZeroValue?: any;
  /** Chart orientation: `Orientation.Vertical` or `Orientation.Horizontal`. Default `Orientation.Vertical` */
  orientation?: Orientation | string;
}

export const StackedBarDefaultConfig: StackedBarConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  color: undefined,
  pattern: undefined,
  barStyle: undefined,
  baseline: undefined,
  barMaxWidth: undefined,
  barWidth: undefined,
  dataStep: undefined,
  barPadding: 0.0,
  roundedCorners: 2,
  cursor: null,
  barMinHeight1Px: false,
  barMinHeightZeroValue: null,
  orientation: Orientation.Vertical,
}

