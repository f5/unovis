// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { AxisType } from 'components/axis/types'
import { Position } from 'types/position'
import { FitMode, TextAlign, TrimMode } from 'types/text'
import { Spacing } from 'types/misc'

export interface AxisConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Axis position: top, bottom, right or left */
  position?: Position | string;
  /** Axis type: x or y */
  type?: AxisType;
  /** Inner axis padding. Adds space between chart and axis */
  padding?: Spacing;
  /** Extend domain line to be full size dimension */
  fullSize?: boolean;
  /** Axis label */
  label?: string;
  /** Font size of the axis label */
  labelFontSize?: string;
  /** Distance between axis and label in pixels */
  labelMargin?: number;
  /** Whether to draw the grid lines or not, default: true */
  gridLine?: boolean;
  /** Whether to draw the tick lines or not, default: true */
  tickLine?: boolean;
  /** Whether to draw the domain line or not, default: true */
  domainLine?: boolean;
  /** Draw minimum and maximum axis ticks only */
  minMaxTicksOnly?: boolean;
  /** Tick label formatter */
  tickFormat?: (d: number | string, i: number, n: (number | string)[]) => string;
  /** Explicitly set tick values */
  tickValues?: number[];
  /** Approximate number of axis ticks (passed to d3 axis constructor) */
  numTicks?: number;
  /** Tick text fit mode: 'wrap' or 'trim' */
  tickTextFitMode?: FitMode | string;
  /** Maximum number of characters for tick text wrapping */
  tickTextLength?: number;
  /** Maximum width of tick text for wrapping */
  tickTextWidth?: number;
  /** Tick text wrapping separator */
  tickTextSeparator?: string | string[];
  /** Tick text force word break if it doesn't fit */
  tickTextForceWordBreak?: boolean;
  /** Tick text trim mode: 'start , 'middle' or 'end' */
  tickTextTrimType?: TrimMode | string;
  /** Font size of tick text */
  tickTextFontSize?: string;
  /** Text alignment for ticks: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `undefined` */
  tickTextAlign?: TextAlign;
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
  tickTextTrimType = TrimMode.Middle
  tickTextFitMode = FitMode.Wrap
  tickTextAlign = undefined

  padding = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  labelMargin = 8
  tickTextFontSize = null
  tickFormat = null
  tickValues = null
  fullSize = true
}
