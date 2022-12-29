import { Axis, AxisType, ComponentCore, Crosshair, Tooltip, XYComponentCore } from '@unovis/ts'

export type Lifecycle = (_: HTMLElement, c: ComponentCore<unknown> | Tooltip) => ({
  destroy: () => void;
})

export function getConfigKey (c: ComponentCore<unknown> | Tooltip): string {
  if (c instanceof Tooltip) return 'tooltip'
  if (c instanceof Axis) {
    if (c.config.type === AxisType.X) return 'xAxis'
    if (c.config.type === AxisType.Y) return 'yAxis'
  }
  if (c instanceof Crosshair) return 'crosshair'
  if (c instanceof XYComponentCore) return 'components'
  if (c instanceof ComponentCore) return 'component'
}
