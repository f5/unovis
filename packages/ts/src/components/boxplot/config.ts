import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { WithOptional } from 'types/misc'

export interface BoxplotConfigInterface<Datum> extends WithOptional<XYComponentConfigInterface<Datum>, 'y'> {
  /** Box fill color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum>;
  /** Median accessor function. Defines the position of the median line inside the box.
   * Default: `undefined` */
  median?: NumericAccessor<Datum>;
  /** Quartiles accessor function returning a `[q1, q3]` tuple. Defines the bottom and the top of the box.
   * Default: `undefined` */
  quartiles?: GenericAccessor<[number, number], Datum>;
  /** Whiskers accessor function returning a `[min, max]` tuple. Defines the bottom and the top whisker ends.
   * Default: `undefined` */
  whiskers?: GenericAccessor<[number, number], Datum>;
  /** Force set the box width in pixels. Default: `undefined` */
  barWidth?: number;
  /** Maximum box width for dynamic sizing. Default: `undefined` */
  barMaxWidth?: number;
  /** Expected step between the boxes in the X axis units. When the data has missing points the step
   * can't be inferred reliably from the data, so set it explicitly here to size the boxes correctly.
   * Default: `undefined` */
  dataStep?: number;
  /** Fractional padding between the boxes in the range of [0,1). Default: `0.25` */
  barPadding?: number;
  /** Rounded corners for the box. Boolean or number (to set the radius in pixels). Default: `2` */
  roundedCorners?: number | boolean;
  /** Configurable box cursor when hovering over. Default: `null` */
  cursor?: StringAccessor<Datum>;
}

export const BoxplotDefaultConfig: BoxplotConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  color: undefined,
  median: undefined,
  quartiles: undefined,
  whiskers: undefined,
  barWidth: undefined,
  barMaxWidth: undefined,
  dataStep: undefined,
  barPadding: 0.25,
  roundedCorners: 2,
  cursor: null,
}
