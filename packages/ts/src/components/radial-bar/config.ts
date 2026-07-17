// Core
import { ComponentConfigInterface, ComponentDefaultConfig } from '@/core/component/config'

// Types
import { ColorAccessor, NumericAccessor } from '@/types/accessor'

export interface RadialBarConfigInterface<Datum> extends ComponentConfigInterface {
  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  id?: ((d: Datum, i: number, ...any: unknown[]) => string | number);
  /** Value accessor function. Default: `undefined` */
  value: NumericAccessor<Datum>;
  /** Maximum value accessor or an array of maximums (indexed by each datum's original position in `data` before sorting).
   * Used to scale each bar's arc length: each bar fills `(value / maxValue) * (angleRange[1] - angleRange[0])`.
   * When `undefined`, the maximum is derived from the data. Default: `undefined`
   */
  maxValue?: NumericAccessor<Datum> | number[];
  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** Pad angle in radians applied between the bar and its end. Default: `0` */
  padAngle?: number;
  /** Custom sort function. Default: `undefined` */
  sortFunction?: (a: Datum, b: Datum) => number;
  /** Corner Radius. Default: `0` */
  cornerRadius?: number;
  /** Color accessor function. Default: `undefined` */
  color?: ColorAccessor<Datum>;
  /** Explicitly set the outer radius of the outermost ring. Default: `undefined` */
  radius?: number;
  /** Width of each ring (track) in pixels. Default: `16` */
  trackWidth?: number;
  /** Gap between rings in pixels. Default: `4` */
  trackPadding?: number;
  /** When `true`, `data[0]` is the innermost ring instead of the outermost. Default: `false` */
  reverseOrder?: boolean;
  /** Central label text. Default: `undefined` */
  centralLabel?: string;
  /** Central sub-label text. Default: `undefined` */
  centralSubLabel?: string;
  /** Enables wrapping for the sub-label. Default: `true` */
  centralSubLabelWrap?: boolean;
  /** Central label and sub-label horizontal offset in pixels. Default: `undefined` */
  centralLabelOffsetX?: number;
  /** Central label and sub-label vertical offset in pixels. Default: `undefined` */
  centralLabelOffsetY?: number;
  /** Show a faded background track for each ring. The color is configurable via
   * the `--vis-radial-bar-background-color` and `--vis-dark-radial-bar-background-color` CSS variables.
   * Default: `true`
   */
  showBackground?: boolean;
  /** Background angle range. When `undefined`, the value will be taken from `angleRange`. Default: `undefined` */
  backgroundAngleRange?: [number, number];
}

export const RadialBarDefaultConfig: RadialBarConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  id: (d: unknown, i: number): string | number => (d as { id: string }).id ?? i,
  value: undefined,
  maxValue: undefined,
  angleRange: [0, 2 * Math.PI],
  padAngle: 0,
  sortFunction: undefined,
  cornerRadius: 0,
  color: undefined,
  radius: undefined,
  trackWidth: 16,
  trackPadding: 4,
  reverseOrder: false,
  centralLabel: undefined,
  centralSubLabel: undefined,
  centralSubLabelWrap: true,
  centralLabelOffsetX: undefined,
  centralLabelOffsetY: undefined,
  showBackground: true,
  backgroundAngleRange: undefined,
}
