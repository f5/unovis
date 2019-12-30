// Copyright (c) Volterra, Inc. All rights reserved.

import { XYConfigInterface, XYConfig } from 'core/xy-component/config'
import { Margin } from 'utils/types'

export interface AxisConfigInterface extends XYConfigInterface {
    /** Axis position: top, bottom, right or left */
    position?: string;
    /** Axis type: x or y */
    type?: string
    /** Axis label */
    label?: string
    /** Draw or not axis grid line */
    gridLine?: boolean
    /** Draw or not axis tick lines */
    tickLine?: boolean
    /** Draw minimum and maximum axis ticks only */
    minMaxTicksOnly?: boolean
    /** Always draw all axis ticks */
    showAllTicks?: boolean
    /**  */
    tickTextLength?: number
    /**  */
    tickTextWidth?: number
    /**  */
    tickTextSeparator?: string
    /**  */
    tickTextForceWordBreak?: boolean
    /**  */
    tickTextExpandOnHover?: boolean
    /**  */
    tickTextTrimType?: string
    /**  */
    tickTextFitMode?: string
    padding?: Margin
}

export class AxisConfig extends XYConfig implements AxisConfigInterface {
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
  tickTextTrimType = 'middle'
  tickTextFitMode = 'wrap'
  padding = {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
  }
}
