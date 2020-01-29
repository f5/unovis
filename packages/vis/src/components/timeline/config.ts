// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { NumericAccessor } from 'types/misc'

export interface TimelineConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Width of the lines */
  lineWidth?: number;
  /** Line length accessor function or a value */
  length?: NumericAccessor<Datum>;
  /** Timeline row height */
  rowHeight?: number;
}

export class TimelineConfig<Datum> extends XYComponentConfig<Datum> implements TimelineConfigInterface<Datum> {
  lineWidth = 6
  // eslint-disable-next-line dot-notation
  length: NumericAccessor<Datum> = d => d['length'];
  rowHeight = 22;
}
