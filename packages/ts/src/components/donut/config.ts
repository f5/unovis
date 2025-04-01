// Core
import { ComponentConfigInterface, ComponentDefaultConfig } from '@/core/component/config'

// Types
import { ColorAccessor, NumericAccessor } from '@/types/accessor'

export interface DonutConfigInterface<Datum> extends ComponentConfigInterface {
  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  id?: ((d: Datum, i: number, ...any: unknown[]) => string | number);
  /** Value accessor function. Default: `undefined` */
  value: NumericAccessor<Datum>;
  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** Pad angle. Default: `0` */
  padAngle?: number;
  /** Custom sort function. Default: `undefined` */
  sortFunction?: (a: Datum, b: Datum) => number;
  /** Corner Radius. Default: `0` */
  cornerRadius?: number;
  /** Color accessor function. Default: `undefined` */
  color?: ColorAccessor<Datum>;
  /** Explicitly set the donut outer radius. Default: `undefined` */
  radius?: number;
  /** Arc width in pixels. Set to `0` if you want to have a pie chart. Default: `20` */
  arcWidth?: number;
  /** Central label accessor function or text. Default: `undefined` */
  centralLabel?: string;
  /** Central sub-label accessor function or text. Default: `undefined` */
  centralSubLabel?: string;
  /** Enables wrapping for the sub-label. Default: `true` */
  centralSubLabelWrap?: boolean;
  /** When true, the component will display empty segments (the ones that have `0` values) as tiny slices.
   * Default: `false`
  */
  showEmptySegments?: boolean;
  /** Angular size for empty segments in radians. Default: `0.5 * Math.PI / 180` */
  emptySegmentAngle?: number;
  /** Show donut background. The color is configurable via
   * the `--vis-donut-background-color` and `--vis-dark-donut-background-color` CSS variables.
   * Default: `true`
  */
  showBackground?: boolean;
  /** Background angle range. When undefined, the value will be taken from `angleRange`. Default: `undefined` */
  backgroundAngleRange?: [number, number];

  /** Central label and sub-label horizontal offset in pixels. Default: `undefined` */
  centralLabelOffsetX?: number;

  /** Central label and sub-label vertical offset in pixels. Default: `undefined` */
  centralLabelOffsetY?: number;
}

export const DonutDefaultConfig: DonutConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  id: (d: unknown, i: number): string | number => (d as { id: string }).id ?? i,
  value: undefined,
  angleRange: [0, 2 * Math.PI],
  padAngle: 0,
  sortFunction: undefined,
  cornerRadius: 0,
  color: undefined,
  radius: undefined,
  arcWidth: 20,
  centralLabel: undefined,
  centralSubLabel: undefined,
  centralSubLabelWrap: true,
  showEmptySegments: false,
  emptySegmentAngle: 0.5 * Math.PI / 180,
  showBackground: true,
  backgroundAngleRange: undefined,
  centralLabelOffsetX: undefined,
  centralLabelOffsetY: undefined,
}
