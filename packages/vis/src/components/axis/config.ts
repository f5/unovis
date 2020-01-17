// Copyright (c) Volterra, Inc. All rights reserved.

import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { AxisType } from 'types/axis'
import { Position } from 'types/position'
import { FitMode, TrimMode } from 'types/text'
import { Margin } from 'types/misc'

export interface AxisConfigInterface<Data> extends XYComponentConfigInterface<Data> {
    /** Axis position: top, bottom, right or left */
    position?: Position;
    /** Axis type: x or y */
    type?: AxisType;
    /** Axis label */
    label?: string;
    /** Draw or not axis grid line */
    gridLine?: boolean;
    /** Draw or not axis tick lines */
    tickLine?: boolean;
    /** Draw minimum and maximum axis ticks only */
    minMaxTicksOnly?: boolean;
    /** Always draw all axis ticks */
    showAllTicks?: boolean;
    /**  */
    tickTextLength?: number;
    /**  */
    tickTextWidth?: number;
    /**  */
    tickTextSeparator?: string;
    /**  */
    tickTextForceWordBreak?: boolean;
    /**  */
    tickTextExpandOnHover?: boolean;
    /**  */
    tickTextTrimType?: TrimMode;
    /**  */
    tickTextFitMode?: FitMode;
    padding?: Margin;
    offset?: Margin;
}

export class AxisConfig<Data> extends XYComponentConfig<Data> implements AxisConfigInterface<Data> {
  position = undefined
  type = undefined
  label = undefined
  gridLine = true
  tickLine = true
  minMaxTicksOnly = false
  showAllTicks = false
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

  offset = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
}
