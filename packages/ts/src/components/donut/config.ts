// Core
import { ComponentConfigInterface, ComponentDefaultConfig } from '@/core/component/config'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from '@/types/accessor'
import { FillPatternType } from '@/styles/patterns'

export interface DonutConfigInterface<Datum> extends ComponentConfigInterface {
  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  id?: ((d: Datum, i: number, ...any: unknown[]) => string | number);
  /** Value accessor function. Default: `undefined` */
  value: NumericAccessor<Datum>;
  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** Pad angle. Default: `0` */
  padAngle?: number;
  /** Minimum angular sweep, in radians, for any segment with a positive value.
   * Segments whose proportional sweep would be smaller are inflated to this angle,
   * with the difference taken proportionally from the remaining segments.
   * Guarantees a segment can survive the `padAngle` inset instead of collapsing
   * to a zero-area path; a sensible setting is `minSegmentAngle >= 2 * padAngle`.
   * Default: `undefined` */
  minSegmentAngle?: number;
  /** Custom sort function. Default: `undefined` */
  sortFunction?: (a: Datum, b: Datum) => number;
  /** Corner Radius. Default: `0` */
  cornerRadius?: number;
  /** Color accessor function. Default: `undefined` */
  color?: ColorAccessor<Datum>;
  /** Fill pattern accessor. Resolves to a `FillPatternType`.
   * When unset and `theme-patterns` is active, a default pattern is applied by segment index. Default: `undefined` */
  pattern?: GenericAccessor<FillPatternType, Datum>;
  /** Icon accessor function or constant value. The icon is displayed in the middle of the segment. Provide a href to an SVG
   * symbol defined in the container's `svgDefs` (e.g. `'#heart'`), or text, which is inserted as HTML with all tags stripped: an icon font glyph (e.g. `'&#xf004;'`, set the font
   * with the `--vis-donut-icon-font-family` CSS variable) or a Unicode symbol. The icon is hidden when its segment is too
   * small to fit it. Default: `undefined`
   */
  icon?: StringAccessor<Datum>;
  /** Icon size in pixels. When `undefined`, the size is 50% of the arc width, but no more than 15% of the donut radius
   * and no more than 20 pixels. Default: `undefined`
   */
  iconSize?: NumericAccessor<Datum>;
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
  minSegmentAngle: undefined,
  sortFunction: undefined,
  cornerRadius: 0,
  color: undefined,
  pattern: undefined,
  icon: undefined,
  iconSize: undefined,
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
