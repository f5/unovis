// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

export interface GroupedBarConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
    /** Bar width in pixels */
    groupWidth?: number;
    /** Maximum bar width for dynamic sizing. Limits the barWidth property on the top */
    groupMaxWidth?: number;
    /** Expected step between the bars in the X axis units. Used to dynamically calculate the width for bars correctly when data has gaps */
    dataStep?: number;
    /** Fractional padding between the groups in the range of [0,1) */
    groupPadding?: number;
    /** Fractional padding between the bars in the range of [0,1) */
    barPadding?: number;
    /** Orientation of the chart */
    isVertical?: boolean;
    /** Rounded corners for bars. Boolean or number (to set the radius in pixels) */
    roundedCorners?: number | boolean;
}

export class GroupedBarConfig<Datum> extends XYComponentConfig<Datum> implements GroupedBarConfigInterface<Datum> {
    groupMaxWidth = undefined
    groupWidth = undefined
    dataStep = undefined
    groupPadding = 0.2
    barPadding = 0.0
    isVertical = true
    roundedCorners = true
}
