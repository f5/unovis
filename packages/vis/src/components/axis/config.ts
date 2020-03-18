// Copyright (c) Volterra, Inc. All rights reserved.

import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { AxisType } from 'types/axis'
import { Position } from 'types/position'
import { FitMode, TrimMode } from 'types/text'
import { Spacing } from 'types/misc'

export interface AxisConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
    /** Axis position: top, bottom, right or left */
    position?: Position | string;
    /** Axis type: x or y */
    type?: AxisType;
    /** Axis label */
    label?: string;
    /** Font size of the axis label */
    labelFontSize?: string;
    /** Whether to draw the grid lines or not, default: true */
    gridLine?: boolean;
    /** Whether to draw the tick lines or not, default: true */
    tickLine?: boolean;
    /** Whether to draw the domain line or not, default: true */
    domainLine?: boolean;
    /** Draw minimum and maximum axis ticks only */
    minMaxTicksOnly?: boolean;
    /** Tick label formatter */
    tickFormat?: (d: number) => string;
    /** Explicitly set tick values */
    tickValues?: number[];
    /** Approximate number of axis ticks */
    numTicks?: number;
    /**  */
    tickTextLength?: number;
    /**  */
    tickTextWidth?: number;
    /**  */
    tickTextSeparator?: string | string[];
    /**  */
    tickTextForceWordBreak?: boolean;
    /**  */
    tickTextExpandOnHover?: boolean;
    /**  */
    tickTextTrimType?: TrimMode;
    /**  */
    tickTextFitMode?: FitMode;
    /**  */
    labelMargin?: number;
    /** Font size of tick labels */
    tickLabelFontSize?: string;
    padding?: Spacing;
    fullSize?: boolean;
}

export class AxisConfig<Datum> extends XYComponentConfig<Datum> implements AxisConfigInterface<Datum> {
  position = undefined
  type = undefined
  label = undefined
  labelFontSize = null
  gridLine = true
  tickLine = true
  domainLine = true
  numTicks = undefined;
  minMaxTicksOnly = false
  tickTextLength = undefined
  tickTextWidth = undefined
  tickTextSeparator = ' '
  tickTextForceWordBreak = false
  tickTextExpandOnHover = true
  tickTextTrimType = TrimMode.MIDDLE
  tickTextFitMode = FitMode.WRAP
  padding = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  labelMargin = 8
  tickLabelFontSize = null
  tickFormat = null
  tickValues = null
  fullSize = true
}
