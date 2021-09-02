// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { Tooltip } from 'components/tooltip'

// Types
import { NumericAccessor } from 'types/accessor'
import { GenericDataRecord } from 'types/data'

// We extend partial XY config interface because x and y properties are optional for Crosshair
export interface CrosshairConfigInterface<Datum = GenericDataRecord> extends Partial<XYComponentConfigInterface<Datum>> {
  /** Separate array of accessors for stacked components (eg StackedBar, Area). Default: `[]` */
  yStacked?: NumericAccessor<Datum>[];
  /** Baseline accessor function for stacked values, useful with stacked areas. Default: `null` */
  baseline?: NumericAccessor<Datum>;
  /** An instance of the Tooltip component to be used with Crosshair. Default: `undefined` */
  tooltip?: Tooltip | undefined;
  /** Tooltip template accessor. The function is supposed to return either a valid HTML string or an HTMLElement. Default: `d => ''` */
  template?: (data: Datum, i: number, elements: any) => string | HTMLElement;
  /** Hide Crosshair when the corresponding element is far from mouse pointer. Default: `true` */
  hideWhenFarFromPointer?: boolean;
  /** Distance in pixels to check in the hideWhenFarFromPointer condition. Default: `100` */
  hideWhenFarFromPointerDistance?: number;
}

export class CrosshairConfig<Datum = GenericDataRecord> extends XYComponentConfig<Datum> implements CrosshairConfigInterface<Datum> {
  yStacked = []
  baseline = null
  duration = 100
  tooltip: Tooltip = undefined
  template = (d: Datum): string => ''
  hideWhenFarFromPointer = true
  hideWhenFarFromPointerDistance = 100
}
