import { XYComponentConfigInterface, XYComponentDefaultConfig } from '@/core/xy-component/config'
import { Tooltip } from '@/components/tooltip'

// Types
import { NumericAccessor, ColorAccessor } from '@/types/accessor'
import { ContinuousScale } from '@/types/scale'
import { WithOptional } from '@/types/misc'
import { CrosshairCircle } from './types'

// We extend partial XY config interface because x and y properties are optional for Crosshair
export interface CrosshairConfigInterface<Datum> extends WithOptional<XYComponentConfigInterface<Datum>, 'x' | 'y'> {
  /** Optional accessor function for getting the values along the X axis. Default: `undefined` */
  x?: NumericAccessor<Datum>;
  /** Optional single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  y?: NumericAccessor<Datum> | NumericAccessor<Datum>[];
  /** Optional color array or color accessor function for crosshair circles. Default: `d => d.color` */
  color?: ColorAccessor<Datum>;
  /** Optional stroke color accessor function for crosshair circles. Default: `undefined` */
  strokeColor?: ColorAccessor<Datum>;
  /** Optional stroke width for crosshair circles. Default: `undefined` */
  strokeWidth?: NumericAccessor<Datum>;
  /** Separate array of accessors for stacked components (eg StackedBar, Area). Default: `undefined` */
  yStacked?: NumericAccessor<Datum>[];
  /** Baseline accessor function for stacked values, useful with stacked areas. Default: `null` */
  baseline?: NumericAccessor<Datum>;
  /** An instance of the Tooltip component to be used with Crosshair. Default: `undefined` */
  tooltip?: Tooltip | undefined;
  // TODO: Change `datum` type to `Datum | undefined`. This may break the build for many people, so we might want to do it in version 2.0
  /** Tooltip template accessor. The function is supposed to return either a valid HTML string or an HTMLElement.
   * When `snapToData` is `false`, `datum` will be `undefined` but `data` and `leftNearestDatumIndex` will be provided.
   * Default: `d => ''` */
  template?: (datum: Datum, x: number | Date, data: Datum[], leftNearestDatumIndex?: number) => string | HTMLElement;
  /** Hide Crosshair when the corresponding datum element is far from mouse pointer. Default: `true` */
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
   * The function receives the horizontal position of the crosshair (in the data space, not in pixels), the data array,
   * the `yScale` instance to help you calculate the correct vertical position of the circles, and the nearest datum index.
   * It has to return an array of the `CrosshairCircle` objects: `{ y: number; color: string; opacity?: number }[]`.
   * Default: `undefined`
  */
  getCircles?: (x: number | Date, data: Datum[], yScale: ContinuousScale, leftNearestDatumIndex?: number) => CrosshairCircle[];
  /** Callback function that is called when the crosshair is moved:
   * - `x` is the horizontal position of the crosshair in the data space;
   * - `datum` is the nearest datum to the crosshair;
   * - `datumIndex` is the index of the nearest datum.
   * - `event` is the event that triggered the crosshair move (mouse or wheel).
   *
   * When the mouse goes out of the container and on wheel events, all the arguments are `undefined` except for `event`.
   * Default: `undefined` */
  onCrosshairMove?: (x?: number | Date, datum?: Datum, datumIndex?: number, event?: MouseEvent | WheelEvent) => void;
  /** Force the crosshair to show at a specific position. Default: `undefined` */
  forceShowAt?: number | Date;
  /** Skip range checks for crosshair visibility. When true, crosshair will show regardless of position within chart bounds. Default: `false`
   *  This is useful for testing, especially when you only triggers mousemove event but does not have real mouse event.
   */
  skipRangeCheck?: boolean;
}

export const CrosshairDefaultConfig: CrosshairConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  yStacked: undefined,
  baseline: null,
  duration: 100,
  tooltip: undefined,
  template: <Datum>(d: Datum, x: number | Date, data: Datum[], leftNearestDatumIndex?: number): string => '',
  hideWhenFarFromPointer: true,
  hideWhenFarFromPointerDistance: 100,
  snapToData: true,
  getCircles: undefined,
  color: undefined,
  strokeColor: undefined,
  strokeWidth: undefined,
  onCrosshairMove: undefined,
  forceShowAt: undefined,
  skipRangeCheck: false,
}
