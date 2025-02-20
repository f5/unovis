import { XYComponentConfigInterface, XYComponentDefaultConfig } from 'core/xy-component/config'

// Types
import { WithOptional } from 'types/misc'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { TextAlign } from 'types'

export interface TimelineConfigInterface<Datum> extends WithOptional<XYComponentConfigInterface<Datum>, 'y'> {
  // Items (Lines)
  /** @deprecated This property has been renamed to `key` */
  type?: StringAccessor<Datum>;
  /** @deprecated This property has been renamed to `lineLength` */
  length?: NumericAccessor<Datum>;
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
  /** Configurable Timeline item cursor when hovering over. Default: `null` */
  cursor?: StringAccessor<Datum>;
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
  /** Row label formatter function. Default: `undefined` */
  rowLabelFormatter?: (key: string) => string;
  /** Fixed label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined`. Falls back to deprecated `labelWidth`. */
  rowLabelWidth?: number;
  /** Maximum label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined`. Falls back to deprecated `maxLabelWidth`. */
  rowMaxLabelWidth?: number;
  /** Text alignment for labels: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `TextAlign.Right` */
  rowLabelTextAlign?: TextAlign | string;

  // Misc
  /** Scrolling callback function: `(scrollTop: number) => void`. Default: `undefined` */
  onScroll?: (scrollTop: number) => void;
}

export const TimelineDefaultConfig: TimelineConfigInterface<unknown> = {
  ...XYComponentDefaultConfig,
  id: undefined,

  // Items (Lines)
  lineRow: undefined,
  lineLength: undefined,
  type: (d: unknown): string => (d as { type: string }).type, // Deprecated
  length: (d: unknown): number => (d as { length: number }).length, // Deprecated
  color: (d: unknown): string => (d as { color: string }).color,
  lineWidth: 8,
  lineCap: false,
  cursor: null,
  showEmptySegments: false,

  // Rows
  rowHeight: 22,
  alternatingRowColors: true,

  // Row Labels
  showLabels: false, // Deprecated
  labelWidth: undefined, // Deprecated
  maxLabelWidth: 120, // Deprecated

  showRowLabels: undefined,
  rowLabelFormatter: undefined,
  rowLabelWidth: undefined,
  rowMaxLabelWidth: undefined,
  rowLabelTextAlign: TextAlign.Right,

  // Misc
  onScroll: undefined,
}
