// Core
import { Config } from 'core/config'

// Types
import { Sizing } from 'types/component'
import { Spacing } from 'types/spacing'

export interface ContainerConfigInterface {
  /** Animation duration of all the components within the container. Default: `undefined` */
  duration?: number;
  /** Margins. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  margin?: Spacing;
  /** Padding. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  padding?: Spacing;
  /** Defines whether components should fit into the container or the container should expand to fit to the component's size. Default: `Sizing.FIT` */
  sizing?: Sizing | string;
  /** Width in pixels. By default, Container automatically fits to the size of the parent element. Default: `undefined`. */
  width?: number;
  /** Height in pixels. By default, Container automatically fits to the size of the parent element. Default: `undefined`. */
  height?: number;
}

export class ContainerConfig extends Config implements ContainerConfigInterface {
  duration = undefined
  margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  padding = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  sizing = Sizing.Fit
  width = undefined
  height = undefined
}
