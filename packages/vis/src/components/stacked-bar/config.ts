// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { StringAccessor } from 'types/accessor'
import { GenericDataRecord } from 'types/data'

export interface StackedBarConfigInterface<Datum = GenericDataRecord> extends XYComponentConfigInterface<Datum> {
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
  /** Rounded corners for top bars. Boolean or number (to set the radius in pixels). Default: `true` */
  roundedCorners?: number | boolean;
  /** Configurable bar cursor when hovering over. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Sets the minimum bar height to 1 pixel for better visibility of small values. Default: `false` */
  barMinHeight?: boolean;
  /** Base value to test data existence when barMinHeight is set to `true`.
   * Everything equal to barMinHeightZeroValue will not be rendered on the chart.
   * Default: `null` */
  barMinHeightZeroValue?: any;
}

export class StackedBarConfig<Datum = GenericDataRecord> extends XYComponentConfig<Datum> implements StackedBarConfigInterface<Datum> {
  barMaxWidth = undefined
  barWidth = undefined
  dataStep = undefined
  barPadding = 0.0
  roundedCorners = true
  cursor = null
  barMinHeight = false
  barMinHeightZeroValue = null
}
