// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { XYComponentCore } from 'core/xy-component'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { Tooltip } from 'core/tooltip'

// Types
import { NumericAccessor } from 'types/misc'

export interface CrosshairConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Separate array of accessors for stacked components (eg StackedBar, Area) */
  yStacked?: NumericAccessor<Datum>[];
  /** Baseline accessor function for stacked values, useful with stacked areas */
  baseline?: NumericAccessor<Datum>;
  /** Tooltip component */
  tooltip?: Tooltip<XYComponentCore<Datum>, Datum> | undefined;
  /** Tooltip template */
  template?: (data: Datum, i: number, elements: any) => string | HTMLElement;
}

export class CrosshairConfig<Datum> extends XYComponentConfig<Datum> implements CrosshairConfigInterface<Datum> {
  yStacked = []
  baseline = null
  duration = 100
  tooltip: Tooltip<XYComponentCore<Datum>, Datum> = undefined
  template = (d: Datum): string => ''
}
