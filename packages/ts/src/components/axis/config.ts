import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { AxisType } from 'components/axis/types'
import { Position } from 'types/position'
import { FitMode, TrimMode, TextAlign } from 'types/text'

// We extend partial XY config interface because x and y properties are optional for Axis
export interface AxisConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /** Axis position: `Position.Top`, `Position.Bottom`, `Position.Right` or `Position.Left`. Default: `undefined` */
  position?: Position | string;
  /** Axis type: `AxisType.X` or `AxisType.Y` */
  type?: AxisType | string;
  /** Extend the axis domain line to be full width or full height. Default: `true` */
  fullSize?: boolean;
  /** Axis label. Default: `undefined` */
  label?: string;
  /** Font size of the axis label as CSS string. Default: `null` */
  labelFontSize?: string | null;
  /** Distance between the axis and the label in pixels. Default: `8` */
  labelMargin?: number;
  /** Sets whether to draw the grid lines or not. Default: `true` */
  gridLine?: boolean;
  /** Sets whether to draw the tick lines or not. Default: `true` */
  tickLine?: boolean;
  /** Sets whether to draw the domain line or not. Default: `true` */
  domainLine?: boolean;
  /** Draw the min and max axis ticks only. Default: `false` */
  minMaxTicksOnly?: boolean;
  /** Tick label formatter function. Default: `undefined` */
  tickFormat?: ((tick: number, i: number, ticks: number[]) => string) | ((tick: Date, i: number, ticks: Date[]) => string);
  /** Explicitly set tick values. Default: `undefined` */
  tickValues?: number[];
  /** Set the approximate number of axis ticks (will be passed to D3's axis constructor). Default: `undefined` */
  numTicks?: number;
  /** Tick text fit mode: `FitMode.Wrap` or `FitMode.Trim`. Default: `FitMode.Wrap`. */
  tickTextFitMode?: FitMode | string;
  /** Maximum number of characters for tick text wrapping. Default: `undefined` */
  tickTextLength?: number;
  /** Maximum width in pixels for the tick text to be wrapped or trimmed. Default: `undefined` */
  tickTextWidth?: number;
  /** Tick text wrapping separator. String or array of strings. Default: `' '` */
  tickTextSeparator?: string | string[];
  /** Force word break for ticks when they don't fit. Default: `false` */
  tickTextForceWordBreak?: boolean;
  /** Tick text trim mode: `TrimMode.Start`, `TrimMode.Middle` or `TrimMode.End`. Default: `TrimMode.Middle` */
  tickTextTrimType?: TrimMode | string;
  /** Font size of the tick text as CSS string. Default: `null` */
  tickTextFontSize?: string | null;
  /** Text alignment for ticks: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `undefined` */
  tickTextAlign?: TextAlign | string;
  /** The spacing in pixels between the tick and it's label. Default: `8` */
  tickPadding?: number;
}

export class AxisConfig<Datum> extends XYComponentConfig<Datum> implements AxisConfigInterface<Datum> {
  position = undefined
  type = undefined
  label = undefined
  labelFontSize = null
  gridLine = true
  tickLine = true
  domainLine = true
  numTicks = undefined
  minMaxTicksOnly = false
  tickTextLength = undefined
  tickTextWidth = undefined
  tickTextSeparator = ' '
  tickTextForceWordBreak = false
  tickTextTrimType = TrimMode.Middle
  tickTextFitMode = FitMode.Wrap
  tickTextFontSize = null
  tickTextAlign = undefined
  labelMargin = 8
  tickFormat = undefined
  tickValues = undefined
  fullSize = true
  tickPadding = 8
}
