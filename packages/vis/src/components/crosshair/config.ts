// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { XYComponentCore } from 'core/xy-component'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { Tooltip } from 'core/tooltip'

// Types
import { NumericAccessor } from 'types/misc'

export interface CrosshairConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Separate array of accessors for stacked components (eg StackedBar, Area). Default: `[]` */
  yStacked?: NumericAccessor<Datum>[];
  /** Baseline accessor function for stacked values, useful with stacked areas. Default: `null` */
  baseline?: NumericAccessor<Datum>;
  /** An instance of the Tooltip component to be used with Crosshair. Default: `undefined` */
  tooltip?: Tooltip<XYComponentCore<Datum>, Datum> | undefined;
  /** Tooltip template accessor. The function is supposed to return either a valid HTML string or an HTMLElement. Default: `d => ''` */
  template?: (data: Datum, i: number, elements: any) => string | HTMLElement;
  /** Hide Crosshair when the corresponding element is far from mouse pointer. Default: `true` */
  hideWhenFarFromPointer?: boolean;
  /** Distance to check in the hideWhenFarFromPointer condition. Default: `100` */
  hideWhenFarFromPointerDistance?: number;
}

export class CrosshairConfig<Datum> extends XYComponentConfig<Datum> implements CrosshairConfigInterface<Datum> {
  yStacked = []
  baseline = null
  duration = 100
  tooltip: Tooltip<XYComponentCore<Datum>, Datum> = undefined
  template = (d: Datum): string => ''
  hideWhenFarFromPointer = true
  hideWhenFarFromPointerDistance = 100
}
