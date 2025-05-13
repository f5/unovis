import { AxisType } from 'components/axis/types'
import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'
import { PlotbandLabelPlacement, PlotbandLabelOrientation, PlotbandLabelPosition } from './types'

export interface PlotbandConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /**
   * Fill color of the plotband.
   * Accepts any valid CSS color string.
   *
   * @default 'var(--vis-plotband-color)'
   */
  color?: string;

  /** Axis to draw the plotband on.
   *  @default AxisType.Y
   */
  axis?: AxisType;

  /** Start coordinate for the plotband.
   *  @default 0
   */
  from?: number | null | undefined;

  /** End coordinate for the plotband.
   *  @default 0
   */
  to?: number | null | undefined;

  /** Optional text to display on the plotband */
  labelText?: string;

  /** Position of the label relative to the plotband area (e.g., 'top-left').
   *  Can be customized with a string.
   *  @default PlotbandLabelPosition.TopRight
   */
  labelPosition: PlotbandLabelPosition;

  /** Horizontal offset (in pixels) for positioning the label.
   *  @default 14
   */
  labelOffsetX: number;

  /** Vertical offset (in pixels) for positioning the label.
   *  @default 14
   */
  labelOffsetY: number;

  /** Orientation of the label text.
   *  @default PlotbandLabelOrientation.Horizontal
   */
  labelOrientation: PlotbandLabelOrientation | string;

  /** Optional color for the label text */
  labelColor?: string;

  /**
   * Font size (in pixels) for the label text.
   * Uses the CSS variable `--vis-plotband-label-font-size` by default, which resolves to `12px`.
   *
   * @default 12
   */
  labelSize?: number;
}

export const PlotbandDefaultConfig: PlotbandConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  axis: AxisType.Y,
  from: 0,
  to: 0,
  color: undefined,
  labelPosition: PlotbandLabelPosition.TopRightOutside,
  labelOffsetX: 14,
  labelOffsetY: 14,
  labelOrientation: PlotbandLabelOrientation.Horizontal,
}
