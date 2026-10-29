import { XYComponentConfigInterface, XYComponentDefaultConfig } from '@/core/xy-component/config'

// Types
import { WithOptional } from '@/types/misc'

// We extend partial XY config interface because x and y properties are not used by Zoom
export interface ZoomConfigInterface<Datum> extends WithOptional<XYComponentConfigInterface<Datum>, 'x' | 'y'> {
  /** Limits of zooming out and panning. By default, the extent of the data combined with the container's `xDomain`. Default: `undefined` */
  extent?: [number | undefined, number | undefined];
  /** Minimum width of the zoomed X domain in the data space. By default, two steps between the closest data points. Default: `undefined` */
  minSpan?: number;
  /** Callback function to be called when the user zooms or pans the chart. Receives the new X domain,
   * or `undefined` when the zoom has been reset, and the event that caused the change. Default: `undefined` */
  onZoom?: (xDomain: [number, number] | undefined, event?: WheelEvent | PointerEvent | MouseEvent | KeyboardEvent) => void;
}

export const ZoomDefaultConfig: ZoomConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  x: undefined,
  y: undefined,
  excludeFromDomainCalculation: true,
  extent: undefined,
  minSpan: undefined,
  onZoom: undefined,
}
