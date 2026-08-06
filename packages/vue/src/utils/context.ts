import { XYComponentCore } from '@unovis/ts/core/xy-component'
import { ComponentCore } from '@unovis/ts/core/component'
import { Tooltip } from '@unovis/ts/components/tooltip'
import { Crosshair } from '@unovis/ts/components/crosshair'
import { Axis } from '@unovis/ts/components/axis'
import { Annotations } from '@unovis/ts/components/annotations'
import { InjectionKey, Ref } from 'vue'

export const componentAccessorKey = Symbol('componentAccessorKey') as InjectionKey<{
  data: Ref<any>;
  update: (c: XYComponentCore<any> | ComponentCore<any>) => void;
  destroy: () => void;
}>

export const tooltipAccessorKey = Symbol('tooltipAccessorKey') as InjectionKey<{
  data: Ref<any>;
  update: (c: Tooltip) => void;
  destroy: () => void;
}>

export const crosshairAccessorKey = Symbol('crosshairAccessorKey') as InjectionKey<{
  data: Ref<any>;
  update: (c: Crosshair<any>) => void;
  destroy: () => void;
}>

export const axisAccessorKey = Symbol('axisAccessorKey') as InjectionKey< {
  data: Ref<any>;
  update: (c: Axis<any>) => void;
  destroy: (c: string) => void;
}>

export const annotationsAccessorKey = Symbol('annotationsAccessorKey') as InjectionKey<{
  data: Ref<any>;
  update: (c: Annotations) => void;
  destroy: () => void;
}>
