import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { WithOptional } from 'types/misc'
import { NumericAccessor, StringAccessor } from 'types/accessor'

export interface TimelineConfigInterface<Datum> extends WithOptional<XYComponentConfigInterface<Datum>, 'y'> {
  /** Width of the timeline items. Default: `8` */
  lineWidth?: NumericAccessor<Datum>;
  /** Display rounded ends for timeline items. Default: `true` */
  lineCap?: boolean;
  /** Timeline row height. Default: `22` */
  rowHeight?: number;
  /** Timeline item length accessor function. Default: `d => d.length` */
  length?: NumericAccessor<Datum>;
  /** Timeline item type accessor function. Records of one type will be plotted in one row. Default: `d => d.type` */
  type?: StringAccessor<Datum>;
  /** Configurable Timeline item cursor when hovering over. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Show item type labels when set to `true`. Default: `false` */
  showLabels?: boolean;
  /** Fixed label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined` */
  labelWidth?: number;
  /** Maximum label width in pixels. Labels longer than the specified value will be trimmed. Default: `120` */
  maxLabelWidth?: number;
  /** Alternating row colors. Default: `true` */
  alternatingRowColors?: boolean;
  /** Scrolling callback function: `(scrollTop: number) => void`. Default: `undefined` */
  onScroll?: (scrollTop: number) => void;
}

export class TimelineConfig<Datum> extends XYComponentConfig<Datum> implements TimelineConfigInterface<Datum> {
  lineWidth = 8
  lineCap = true
  rowHeight = 22
  // eslint-disable-next-line dot-notation
  length: NumericAccessor<Datum> = d => d['length']
  // eslint-disable-next-line dot-notation
  type: StringAccessor<Datum> = d => d['type']
  cursor = null
  labelWidth = undefined
  showLabels = false
  maxLabelWidth = 120
  alternatingRowColors = true
  onScroll = undefined
}
