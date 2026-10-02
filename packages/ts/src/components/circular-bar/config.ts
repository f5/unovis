// Core
import { ComponentConfigInterface, ComponentDefaultConfig } from '@/core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from '@/types/accessor'

export interface CircularBarConfigInterface<Datum> extends ComponentConfigInterface {
  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  id?: ((d: Datum, i: number, ...any: unknown[]) => string | number);
  /** Value accessor function. Returning `null` or `undefined` marks the value as missing,
   * and the corresponding bar will not be rendered. Default: `undefined`
   */
  value: NumericAccessor<Datum>;
  /** Maximum value accessor or an array of maximums (indexed by each datum's original position in `data` before sorting).
   * Used to scale each bar's length: a bar with `value === maxValue` reaches the outer radius of the chart.
   * When `undefined`, the maximum is derived from the data. Default: `undefined`
   */
  maxValue?: NumericAccessor<Datum> | number[];
  /** Diagram angle range in radians. The bars are evenly distributed within it, starting at `angleRange[0]`.
   * When `undefined`, the bars cover the full circle and the first bar is centered at the top. Default: `undefined`
   */
  angleRange?: [number, number];
  /** Gap between neighbouring bars in pixels. Unlike an angular padding, the gap has the same width
   * along the whole side of a bar, which gives the bars their petal-like shape.
   * When `undefined`, the gap is 3% of the chart radius. Default: `undefined`
   */
  barPadding?: number;
  /** Minimum bar length in pixels, measured from the bar's tip (or inner edge) to its outer edge.
   * Bars with small values, `0` included, will be extended to that length so that they remain visible.
   * Bars with missing values (see `value`) are not affected: they're never rendered.
   * Default: `0`
   */
  barMinLength?: number;
  /** Custom sort function. Default: `undefined` */
  sortFunction?: (a: Datum, b: Datum) => number;
  /** Radius of the two outer corners of a bar in pixels. It is automatically reduced when a bar is too short
   * or too narrow to fit it. When `undefined`, the radius is 12% of the chart radius. Default: `undefined`
   */
  cornerRadius?: number;
  /** Radius of the two inner corners of a bar in pixels. When it is large enough, the inner corners merge into
   * a single rounded tip pointing to the center of the chart. The radius is automatically reduced when a bar is
   * too short or too narrow to fit it. When `undefined`, the radius is chosen so that the corners merge into
   * a tip touching `innerRadius`, with a rounding of at least a fraction of the bar's width, so with a small `innerRadius`
   * or very narrow bars the tip starts slightly beyond it. Bars too wide for a tip (e.g. three bars over the full circle)
   * keep two rounded corners and a short inner arc. Sectors of 180° and more are drawn as regular arcs, and
   * `cornerRadius` rounds all of their corners. Default: `undefined`
   */
  innerCornerRadius?: number;
  /** Color accessor function. Default: `undefined` */
  color?: ColorAccessor<Datum>;
  /** Explicitly set the outer radius of the chart. When `undefined`, the chart fills the available space. Default: `undefined` */
  radius?: number;
  /** Inner radius of the chart in pixels, i.e. the radius of the hole in the middle. Bars start at this radius,
   * unless the bar padding and the inner corner radius force them to start farther away from the center.
   * Set it to `0` to make the bars converge into rounded tips. When `undefined`, the inner radius is 26% of the
   * chart radius. Default: `undefined`
   */
  innerRadius?: number;
  /** Icon accessor function or constant value. The icon is displayed at the inner end of the bar. Provide a href to an SVG
   * symbol defined in the container's `svgDefs` (e.g. `'#heart'`), or text, which is inserted as HTML: an icon font glyph (e.g. `'&#xf004;'`, set the font
   * with the `--vis-circular-bar-icon-font-family` CSS variable) or a Unicode symbol. The icon is hidden when its bar is too
   * short to fit it. Default: `undefined`
   */
  icon?: StringAccessor<Datum>;
  /** Icon size in pixels. When `undefined`, the size is 8% of the chart radius. Default: `undefined` */
  iconSize?: NumericAccessor<Datum>;
  /** Show a faded background bar of the maximum length behind each bar. The color is configurable via
   * the `--vis-circular-bar-background-color` and `--vis-dark-circular-bar-background-color` CSS variables.
   * Default: `true`
   */
  showBackground?: boolean;
}

export const CircularBarDefaultConfig: CircularBarConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  // Optional chaining because a data record itself can be `null` when the data has gaps
  id: (d: unknown, i: number): string | number => (d as { id: string })?.id ?? i,
  value: undefined,
  maxValue: undefined,
  angleRange: undefined,
  barPadding: undefined,
  barMinLength: 0,
  sortFunction: undefined,
  cornerRadius: undefined,
  innerCornerRadius: undefined,
  color: undefined,
  radius: undefined,
  innerRadius: undefined,
  showBackground: true,
  icon: undefined,
  iconSize: undefined,
}
