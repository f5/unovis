import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { ColorAccessor, StringAccessor } from 'types/accessor'
import { Orientation } from 'types/position'

export interface StackedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Spacing in pixels between stacked items in a single bar. Default: `0` */
  stackSpacing?: number;
  /** Bar color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum>;
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
  barMaxWidth: undefined,
  barWidth: undefined,
  dataStep: undefined,
  barPadding: 0.0,
  roundedCorners: 2,
  stackSpacing: 0,
  cursor: null,
  barMinHeight1Px: false,
  barMinHeightZeroValue: null,
  orientation: Orientation.Vertical,
}

