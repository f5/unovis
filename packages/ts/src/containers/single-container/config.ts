// Core
import { ContainerDefaultConfig, ContainerConfigInterface } from 'core/container/config'
import { ComponentCore } from 'core/component'
import { Tooltip } from 'components/tooltip'

export interface SingleContainerConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization component. Default: `undefined` */
  component?: ComponentCore<Datum>;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip;
}

export const SingleContainerDefaultConfig: SingleContainerConfigInterface<unknown> = {
  ...ContainerDefaultConfig,
  tooltip: undefined,
}
