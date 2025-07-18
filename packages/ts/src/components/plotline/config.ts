// Config
import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { AxisType } from 'components/axis/types'
import { PlotlineLabelPosition, PlotlineLabelOrientation, PlotlineLineStylePresets } from './types'

export interface PlotlineConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /**
   * Color of the plotline.
   * Uses CSS variable: `--vis-plotline-color`.
   *
   * @default 'var(--vis-plotline-color)'
   */
  color?: string;

  /**
   * Line width in pixels.
   * Uses CSS variable: `--vis-plotline-width`.
   *
   * @default 2
   */
  lineWidth?: number;

  /**
   * Plotline direction type.
   * Should be either `AxisType.X` or `AxisType.Y`.
   *
   * @default AxisType.Y
   */
  axis?: AxisType | string;

  /**
   * Value to draw the plotline at.
   *
   * @default 0
   */
  value?: number | null | undefined;

  /**
   * Duration of the animation in milliseconds.
   *
   * @default 300
   */
  duration?: number;

  /**
   * Line style of the plotline.
   * Can be a named preset or an array of numbers representing `stroke-dasharray`.
   * Uses CSS variable: `--vis-plotline-dasharray`.
   *
   * @default PlotlineLineStylePresets.Solid
   */
  lineStyle?: PlotlineLineStylePresets | number[];

  /**
   * Label text to display on the plotline.
   *
   * @default undefined
   */
  labelText?: string;

  /**
   * Position of the label relative to the plotline.
   *
   * @default PlotlineLabelPosition.TopRight
   */
  labelPosition?: PlotlineLabelPosition;

  /**
   * Horizontal offset of the label in pixels.
   *
   * @default 14
   */
  labelOffsetX?: number;

  /**
   * Vertical offset of the label in pixels.
   *
   * @default 14
   */
  labelOffsetY?: number;

  /**
   * Orientation of the label: horizontal or vertical.
   *
   * @default PlotlineLabelOrientation.Horizontal
   */
  labelOrientation?: PlotlineLabelOrientation;

  /**
   * Color of the label text.
   * Uses CSS variable: `--vis-plotline-label-color`.
   *
   * @default 'var(--vis-plotline-label-color)'
   */
  labelColor?: string;

  /**
   * Font size of the label text in pixels.
   * Uses CSS variable: `--vis-plotline-label-font-size`.
   *
   * @default 'var(--vis-plotline-label-font-size)'
   */
  labelSize?: number;
}

export const PlotlineDefaultConfig: PlotlineConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  lineWidth: 2,
  axis: AxisType.Y,
  value: 0,
  duration: 300,
  color: undefined,
  lineStyle: PlotlineLineStylePresets.Solid,
  labelPosition: PlotlineLabelPosition.TopRight,
  labelOffsetX: 14,
  labelOffsetY: 14,
  labelOrientation: PlotlineLabelOrientation.Horizontal,
}
