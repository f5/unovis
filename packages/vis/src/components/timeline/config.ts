// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { NumericAccessor, StringAccessor } from 'types/misc'

export interface TimelineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Width of the lines */
  lineWidth?: NumericAccessor<Datum>;
  /** Timeline row height */
  rowHeight?: number;
  /** Line length accessor function or a value */
  length?: NumericAccessor<Datum>;
  /** Type accessor function, records of one type are plotted in one row */
  type?: StringAccessor<Datum>;
}

export class TimelineConfig<Datum> extends XYComponentConfig<Datum> implements TimelineConfigInterface<Datum> {
  lineWidth = 8
  rowHeight = 22;
  // eslint-disable-next-line dot-notation
  length: NumericAccessor<Datum> = d => d['length'];
  // eslint-disable-next-line dot-notation
  type: StringAccessor<Datum> = d => d['type']
}
