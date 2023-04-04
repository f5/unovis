import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { StringAccessor } from 'types/accessor'
import { Orientation } from 'types/position'

export interface GroupedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
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

export class GroupedBarConfig<Datum> extends XYComponentConfig<Datum> implements GroupedBarConfigInterface<Datum> {
  groupMaxWidth = undefined
  groupWidth = undefined
  dataStep = undefined
  groupPadding = 0.05
  barPadding = 0.0
  roundedCorners = 2
  barMinHeight = 2
  cursor = null
  orientation = Orientation.Vertical
}
