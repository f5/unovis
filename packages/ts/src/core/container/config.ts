// Core
import { Config } from 'core/config'

// Types
import { Spacing } from 'types/spacing'

export interface ContainerConfigInterface {
  /** Animation duration of all the components within the container. Default: `undefined` */
  duration?: number;
  /** Margins. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  margin?: Spacing;
  /** Padding. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  padding?: Spacing;

  width?: number | string;
  /** Height in pixels or in CSS units.
   * Percentage units `"%"` are not supported here. If you want to set `height` as a percentage, do it via `style`
   * of the corresponding DOM element.
   * By default, Container automatically fits to the size of the parent element.
   * Default: `undefined`
  */
  height?: number | string;
  /** Custom SVG defs available to all the components within the container. Default: `undefined`. */
  svgDefs?: string;
  /** Alternative text description of the chart for accessibility purposes. It will be applied as an
   * `aria-label` attribute to the div element containing your chart. Default: `undefined`.
  */
  ariaLabel?: string | null | undefined;
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

  width = undefined
  height = undefined

  svgDefs = undefined
  ariaLabel = undefined
}
