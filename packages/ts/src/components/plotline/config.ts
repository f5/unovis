import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'
import { PlotlineLegendPosition, PlotlineLegendOrientation, PlotlineLineStylePresets } from './types'
import { AxisType } from 'components/axis/types'

export interface PlotlineConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /* Color of the plotline */
  color?: string;
  /** Line width in pixels. Default: `2` */
  lineWidth?: number;
  /** Plotline direction type: `AxisType.X` or `AxisType.Y` */
  axis?: AxisType | string;
  /** Value to draw the plotline at. Default: `0` */
  value?: number | null | undefined;
  /** Line style, see SVG's stroke-dasharray. Default: `solid` */
  lineStyle?: PlotlineLineStylePresets | number[];
  /* Label text. Default: `undefined` */
  labelText?: string;
  /* Label position. Default: `top-right` */
  labelPosition: PlotlineLegendPosition;
  /* Label offset X. Default: `14` */
  labelOffsetX: number;
  /* Label offset Y. Default: `14` */
  labelOffsetY: number;
  /* Label orientation. Default: `horizontal` */
  labelOrientation: PlotlineLegendOrientation;
  /* Label color. Default: `undefined` */
  labelColor?: string;
  /* Label size. Default: `undefined` */
  labelSize?: number;
}

export const PlotlineDefaultConfig: PlotlineConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  lineWidth: 2,
  axis: AxisType.Y,
  value: 0,
  color: undefined,
  lineStyle: 'solid',
  labelPosition: 'top-right',
  labelOffsetX: 14,
  labelOffsetY: 14,
  labelOrientation: 'horizontal',
}
