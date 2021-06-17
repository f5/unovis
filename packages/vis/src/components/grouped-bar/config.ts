// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { StringAccessor } from 'types/misc'

export interface GroupedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Optionaly set the group width in pixels (distributed evenly among the group bars) */
  groupWidth?: number;
  /** Maximum bar width for dynamic sizing. Limits the barWidth property from the top */
  groupMaxWidth?: number;
  /** Expected step between the bars in the X axis units. Used to dynamically calculate the width for bars correctly when data has gaps */
  dataStep?: number;
  /** Fractional padding between the groups in the range of [0,1). Default 0.05 */
  groupPadding?: number;
  /** Fractional padding between the bars in the range of [0,1). Default: 0 */
  barPadding?: number;
  /** Orientation of the chart. Default: true */
  isVertical?: boolean;
  /** Rounded corners for bars. Boolean or number (to set the radius in pixels). Default: true */
  roundedCorners?: number | boolean;
  /** Sets the minimum bar height for better visibility of small values. Default: 1 */
  barMinHeight?: number;
  /** Optional bar cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
}

export class GroupedBarConfig<Datum> extends XYComponentConfig<Datum> implements GroupedBarConfigInterface<Datum> {
  groupMaxWidth = undefined
  groupWidth = undefined
  dataStep = undefined
  groupPadding = 0.05
  barPadding = 0.0
  isVertical = true
  roundedCorners = true
  barMinHeight = 2
  cursor = null
}
