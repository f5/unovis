// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { ComponentCore } from 'core/component'
import { Tooltip } from 'components/tooltip'

// Types
import { Sizing } from 'types/component'

export interface SingleContainerConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization component. Default: `undefined` */
  component?: ComponentCore<Datum>;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip;
  /** Defines whether components should fit into the container or the container should expand to fit to the component's size. Default: `Sizing.Fit` */
  sizing?: Sizing | string;
  /** Width in pixels or in CSS units.
   * Percentage units `"%"` are not supported here. If you want to set `width` as a percentage, do it via `style`
   * of the corresponding DOM element.
   * By default, Container automatically fits to the size of the parent element.
   * Default: `undefined`
  */
}

export class SingleContainerConfig<Datum> extends ContainerConfig implements SingleContainerConfigInterface<Datum> {
  tooltip = undefined
  sizing = Sizing.Fit
}
