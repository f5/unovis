import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { Tooltip } from 'components/tooltip'

// Types
import { NumericAccessor } from 'types/accessor'
import { ContinuousScale } from 'types/scale'
import { CrosshairCircle } from './types'

// We extend partial XY config interface because x and y properties are optional for Crosshair
export interface CrosshairConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /** Separate array of accessors for stacked components (eg StackedBar, Area). Default: `undefined` */
  yStacked?: NumericAccessor<Datum>[];
  /** Baseline accessor function for stacked values, useful with stacked areas. Default: `null` */
  baseline?: NumericAccessor<Datum>;
  /** An instance of the Tooltip component to be used with Crosshair. Default: `undefined` */
  tooltip?: Tooltip | undefined;
  /** Tooltip template accessor. The function is supposed to return either a valid HTML string or an HTMLElement. Default: `d => ''` */
  template?: (data: Datum, x: number | Date) => string | HTMLElement;
  /** Hide Crosshair when the corresponding element is far from mouse pointer. Default: `true` */
  hideWhenFarFromPointer?: boolean;
  /** Distance in pixels to check in the hideWhenFarFromPointer condition. Default: `100` */
  hideWhenFarFromPointerDistance?: number;
  /** Snap to the nearest data point.
   * If disabled, the tooltip template will receive only the horizontal position of the crosshair and you'll be responsible
   * for getting the underlying data records and crosshair circles (see the `getCircles` configuration option).
   * Default: `true`
  */
  snapToData?: boolean;
  /** Custom function for setting up the crosshair circles, usually needed when `snapToData` is set to `false`.
   * The function receives the horizontal position of the crosshair (in the data space, not in pixels), the data array
   * and the `yScale` instance to help you calculate the correct vertical position of the circles.
   * It has to return an array of the CrosshairCircle objects: `{ y: number; color: string; opacity?: number }[]`.
   * Default: `undefined`
  */
  getCircles?: (x: number, data: Datum[], yScale: ContinuousScale) => CrosshairCircle[];
}

export class CrosshairConfig<Datum> extends XYComponentConfig<Datum> implements CrosshairConfigInterface<Datum> {
  yStacked = undefined
  baseline = null
  duration = 100
  tooltip: Tooltip = undefined
  template: ((data: Datum, x: number | Date) => string | HTMLElement) = (d: Datum): string => ''
  hideWhenFarFromPointer = true
  hideWhenFarFromPointerDistance = 100
  snapToData = true
  getCircles = undefined
}
