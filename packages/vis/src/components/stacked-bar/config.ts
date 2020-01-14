// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

export interface StackedBarConfigInterface extends XYComponentConfigInterface {
    /** Bar width in pixels */
    barWidth?: number;
    /** Maximum bar width for dynamic sizing. Limits the barWidth property on the top */
    barMaxWidth?: number;
    /** Expected step between the bars in the X axis units. Used to dynamically calculate the width for bars correctly when data has gaps */
    expectedDataStep?: number;
    /** Fractional padding between the bars in the range of [0,1) */
    barPadding?: number;
    /** Orientation of the chart */
    isVertical?: boolean;
    /** Rounded corners for bars. Boolean or number (to set the radius in pixels) */
    roundedCorners?: number | boolean;
}

export class StackedBarConfig extends XYComponentConfig implements StackedBarConfigInterface {
    barMaxWidth = undefined
    barWidth = undefined
    expectedDataStep = undefined
    barPadding = 0.0
    isVertical = true
    roundedCorners = true
}
