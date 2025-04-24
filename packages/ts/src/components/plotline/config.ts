import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'
import { PlotlineLabelOptions, PlotlineLineStylePresets } from './types'

export interface PlotlineConfigInterface<Datum> extends XYComponentConfigInterface<Datum>, PlotlineLabelOptions {
  /* Color of the plotline */
  color?: string;
  /** Line width in pixels. Default: `2` */
  lineWidth?: number;
  /** Axis to draw the plotline on. Default: `y` */
  axis?: 'x' | 'y';
  /** Value to draw the plotline at. Default: `0` */
  value?: number | null | undefined;
  /** Line style, see SVG's stroke-dasharray. Default: `solid` */
  lineStyle?: PlotlineLineStylePresets | number[];
}

export const PlotlineDefaultConfig: PlotlineConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  lineWidth: 2,
  axis: 'y',
  value: 0,
  color: undefined,
  lineStyle: 'solid',
  labelPosition: 'top-right',
  labelOffsetX: 14,
  labelOffsetY: 14,
  labelOrientation: 'horizontal',
}
