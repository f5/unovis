// Core
import { ContainerDefaultConfig, ContainerConfigInterface } from '@/core/container/config'
import { ComponentCore } from '@/core/component'
import { Tooltip } from '@/components/tooltip'
import { Annotations } from '@/components/annotations'

// Types
import { Spacing } from 'types/spacing'

export interface SingleContainerConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization component. Default: `undefined` */
  component?: ComponentCore<Datum>;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip;
  /** Annotations component. Default: `undefined` */
  annotations?: Annotations | undefined;
  /** Callback function to be called when the chart rendering is complete. Default: `undefined` */
  onRenderComplete?: (
    svgNode: SVGSVGElement,
    margin: Spacing,
    containerWidth: number,
    containerHeight: number,
    componentWidth: number,
    componentHeight: number,
  ) => void;
}

export const SingleContainerDefaultConfig: SingleContainerConfigInterface<unknown> = {
  ...ContainerDefaultConfig,
  tooltip: undefined,
  annotations: undefined,
}
