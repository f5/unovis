import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { WithOptional } from 'types/misc'
import { ColorAccessor, NumericAccessor, StringAccessor, GenericAccessor } from 'types/accessor'
import { TextAlign } from 'types/text'
import { Arrangement } from 'types/position'

// Local Types
import type { TimelineArrow, TimelineLineRenderState, TimelineRowLabel } from './types'

export interface TimelineConfigInterface<Datum> extends WithOptional<XYComponentConfigInterface<Datum>, 'y'> {
  // Items (Lines)
  /** @deprecated This property has been renamed to `key` */
  type?: StringAccessor<Datum>;
  /** @deprecated This property has been renamed to `lineLength` */
  length?: NumericAccessor<Datum>;
  /** @deprecated This property has been renamed to `lineCursor` */
  cursor?: StringAccessor<Datum>;
  /** Timeline item row accessor function. Records with the `lineRow` will be plotted in one row. Default: `undefined` */
  lineRow?: StringAccessor<Datum>;
  /** Timeline item length accessor function. Default: `undefined`. Falls back to the deprecated `length` property */
  lineLength?: NumericAccessor<Datum>;
  /** Timeline item color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum>;
  /** Width of the timeline items. Default: `8` */
  lineWidth?: NumericAccessor<Datum>;
  /** Display rounded ends for timeline items. Default: `true` */
  lineCap?: boolean;
  /** Provide a href to an SVG defined in container's `svgDefs` to display an icon at the start of the line. Default: undefined */
  lineStartIcon?: StringAccessor<Datum>;
  /** Line start icon color accessor function. Default: `undefined` */
  lineStartIconColor?: StringAccessor<Datum>;
  /** Line start icon size accessor function. Default: `undefined` */
  lineStartIconSize?: NumericAccessor<Datum>;
  /** Line start icon arrangement configuration. Controls how the icon is positioned relative to the line.
   * Accepts values from the Arrangement enum: `Arrangement.Start`, `Arrangement.Middle`, `Arrangement.End` or a string equivalent.
   * Default: `Arrangement.Inside` */
  lineStartIconArrangement?: GenericAccessor<Arrangement | `${Arrangement}`, Datum>;
  /** Provide a href to an SVG defined in container's `svgDefs` to display an icon at the end of the line. Default: undefined */
  lineEndIcon?: StringAccessor<Datum>;
  /** Line end icon color accessor function. Default: `undefined` */
  lineEndIconColor?: StringAccessor<Datum>;
  /** Line end icon size accessor function. Default: `undefined` */
  lineEndIconSize?: NumericAccessor<Datum>;
  /** Line end icon arrangement configuration. Controls how the icon is positioned relative to the line.
   * Accepts values from the Arrangement enum: `Arrangement.Start`, `Arrangement.Middle`, `Arrangement.End` or a string equivalent.
   * Default: `Arrangement.Inside` */
  lineEndIconArrangement?: GenericAccessor<Arrangement | `${Arrangement}`, Datum>;
  /** Configurable Timeline item cursor when hovering over. Default: `undefined` */
  lineCursor?: StringAccessor<Datum>;
  /** Sets the minimum line length to 1 pixel for better visibility of small values. Default: `false` */
  showEmptySegments?: boolean;

  /** Timeline row height. Default: `22` */
  rowHeight?: number;
  /** Alternating row colors. Default: `true` */
  alternatingRowColors?: boolean;

  // Row Labels
  /** @deprecated This property has been renamed to `showRowLabels */
  showLabels?: boolean;
  /** @deprecated This property has been renamed to `rowLabelWidth */
  labelWidth?: number;
  /** @deprecated This property has been renamed to `rowMaxLabelWidth */
  maxLabelWidth?: number;

  /** Show row labels when set to `true`. Default: `false`. Falls back to deprecated `showLabels` */
  showRowLabels?: boolean;
  /** Row label style as an object with the `{ [property-name]: value }` format. Default: `undefined` */
  rowLabelStyle?: GenericAccessor<Record<string, string>, TimelineRowLabel<Datum>>;
  /** Row label formatter function. Default: `undefined` */
  rowLabelFormatter?: (key: string) => string;
  /** Fixed label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined`. Falls back to deprecated `labelWidth`. */
  rowLabelWidth?: number;
  /** Maximum label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined`. Falls back to deprecated `maxLabelWidth`. */
  rowMaxLabelWidth?: number;
  /** Text alignment for labels: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `TextAlign.Right` */
  rowLabelTextAlign?: TextAlign | `${TextAlign}`;

  // Arrows
  arrows?: TimelineArrow[];

  // Animation
  /** Control the animation by specify the initial position for new lines as [x, y]. Default: `undefined` */
  animationLineEnterPosition?:
  [number | undefined | null, number | undefined | null] |
  ((d: Datum & TimelineLineRenderState, i: number, data: (Datum & TimelineLineRenderState)[]) => [number | undefined, number | undefined]) |
  undefined;
  /** Control the animation by specify the destination position for exiting lines as [x, y]. Default: `undefined` */
  animationLineExitPosition?: [number | undefined | null, number | undefined | null] |
  ((d: Datum & TimelineLineRenderState, i: number, data: (Datum & TimelineLineRenderState)[]) => [number | undefined, number | undefined]) |
  undefined;

  // Callbacks
  /** Scrolling callback function: `(scrollTop: number) => void`. Default: `undefined` */
  onScroll?: (scrollTop: number) => void;
}

export const TimelineDefaultConfig: TimelineConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  id: undefined,

  // Items (Lines)
  cursor: undefined, // Deprecated (see above)
  type: (d: unknown): string => (d as { type: string }).type, // Deprecated (see above)
  length: (d: unknown): number => (d as { length: number }).length, // Deprecated (see above)
  color: (d: unknown): string => (d as { color: string }).color,
  lineRow: undefined,
  lineLength: undefined,
  lineWidth: 8,
  lineCap: false,
  lineCursor: undefined,
  showEmptySegments: false,
  lineStartIcon: undefined,
  lineStartIconColor: undefined,
  lineStartIconSize: undefined,
  lineStartIconArrangement: Arrangement.Inside,
  lineEndIcon: undefined,
  lineEndIconColor: undefined,
  lineEndIconSize: undefined,
  lineEndIconArrangement: Arrangement.Inside,

  // Rows
  rowHeight: 22,
  alternatingRowColors: true,

  // Row Labels
  showLabels: false, // Deprecated (see above)
  labelWidth: undefined, // Deprecated (see above)
  maxLabelWidth: 120, // Deprecated (see above)

  showRowLabels: undefined,
  rowLabelFormatter: undefined,
  rowLabelStyle: undefined,
  rowLabelWidth: undefined,
  rowMaxLabelWidth: undefined,
  rowLabelTextAlign: TextAlign.Right,

  // Arrows
  arrows: undefined,

  // Animation
  animationLineEnterPosition: undefined,

  // Callbacks
  onScroll: undefined,
}
