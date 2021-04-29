// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { StringAccessor } from 'types/misc'

export interface StackedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
    /** Bar width in pixels */
    barWidth?: number;
    /** Maximum bar width for dynamic sizing. Limits the barWidth property on the top */
    barMaxWidth?: number;
    /** Expected step between the bars in the X axis units. Used to dynamically calculate the width for bars correctly when data has gaps */
    dataStep?: number;
    /** Fractional padding between the bars in the range of [0,1). Default: `0` */
    barPadding?: number;
    /** Orientation of the chart */
    isVertical?: boolean;
    /** Rounded corners for top bars. Boolean or number (to set the radius in pixels). Default: `true` */
    roundedCorners?: number | boolean;
    /** Optional bar cursor. Default: `null` */
    cursor?: StringAccessor<Datum>;
    /** Sets the minimum bar height to 1 for better visibility of small values. Default: `false` */
    barMinHeight?: boolean;
    /** Base value to test data existence when barMinHeight is set to `true`. Anything equal to barMinHeightZeroValue
     * will not be rendered on the chart. Default: `null` */
    barMinHeightZeroValue?: any;
}

export class StackedBarConfig<Datum> extends XYComponentConfig<Datum> implements StackedBarConfigInterface<Datum> {
    barMaxWidth = undefined
    barWidth = undefined
    dataStep = undefined
    barPadding = 0.0
    isVertical = true
    roundedCorners = true
    cursor = null
    barMinHeight = false
    barMinHeightZeroValue = null
}
