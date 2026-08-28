import { XYComponentConfigInterface, XYComponentDefaultConfig } from '@/core/xy-component/config'

// Types
import { ColorAccessor, GenericAccessor, StringAccessor } from '@/types/accessor'
import { FillPatternType } from '@/styles/patterns'
import { Orientation } from '@/types/position'
import { StyleDeclaration } from '@/types/style'

export interface GroupedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Bar color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum>;
  /** Bar fill pattern accessor. Resolves to a `FillPatternType`. Default: `undefined` */
  pattern?: GenericAccessor<FillPatternType, Datum>;
  /** Per-bar inline styles accessor, called with the datum and the bar's index within the group.
   * The returned object is applied as inline styles, with camelCase keys converted to kebab-case.
   * Keys the component manages itself (`fill`, `cursor`, `mask`) take precedence over their
   * defaults (e.g. the `color` accessor) and stay animated; all other keys are applied
   * instantly. Keys no longer returned are cleaned up on the next render. Default: `undefined` */
  barStyle?: GenericAccessor<StyleDeclaration, Datum>;
  /** Force set the group width in pixels. Default: `undefined` */
  groupWidth?: number;
  /** Maximum group width for dynamic sizing. Limits the groupWidth property from the top. Default: `undefined` */
  groupMaxWidth?: number;
  /** Expected step between the bar groups in the X axis units.
   * Needed to correctly calculate the width of the bar groups when there are gaps in the data.
   * Default: `undefined` */
  dataStep?: number;
  /** Fractional padding between the groups in the range of [0,1). Default: `0.05` */
  groupPadding?: number;
  /** Fractional padding between the bars in the range of [0,1). Default: `0` */
  barPadding?: number;
  /** Rounded bar corners. Boolean or number (to set the radius in pixels explicitly). Default: `2` */
  roundedCorners?: number | boolean;
  /** Sets the minimum bar height for better visibility of small values. Default: `1` */
  barMinHeight?: number;
  /** Configurable bar cursor when hovering over. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Chart orientation: `Orientation.Vertical` or `Orientation.Horizontal`. Default `Orientation.Vertical` */
  orientation?: Orientation | string;
}

export const GroupedBarDefaultConfig: GroupedBarConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  color: undefined,
  pattern: undefined,
  barStyle: undefined,
  groupMaxWidth: undefined,
  groupWidth: undefined,
  dataStep: undefined,
  groupPadding: 0.05,
  barPadding: 0.0,
  roundedCorners: 2,
  barMinHeight: 2,
  cursor: null,
  orientation: Orientation.Vertical,
}
