import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'
// import { PlotlineLineStylePresets } from './types'

export interface PlotbandConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  color?: string;
  /** Line width in pixels. Default: `2` */
  lineWidth?: number;
  /** Axis to draw the plotline on. Default: `y` */
  axis?: 'x' | 'y';
  /** From to draw the plotline at. Default: `0` */
  from?: number | null | undefined;
  /** From to draw the plotline at. Default: `0` */
  to?: number | null | undefined;
}

export const PlotbandDefaultConfig: PlotbandConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  lineWidth: 2,
  axis: 'y',
  from: 0,
  to: 0,
  color: undefined,
}
