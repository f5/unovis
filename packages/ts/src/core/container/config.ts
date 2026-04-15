// Core

// Types
import { ColorFunction } from 'types/accessor'
import { Sizing } from 'types/component'
import { Spacing } from 'types/spacing'

export interface ContainerConfigInterface {
  /** Animation duration of all the components within the container. Default: `undefined` */
  duration?: number;
  /** Margins. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  margin?: Spacing;
  /** Padding. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  padding?: Spacing;
  /** Defines whether components should fit into the container or the container should expand to fit to the component's size. Default: `Sizing.Fit` */
  sizing?: Sizing | string;
  /** Width in pixels or in CSS units.
   * Percentage units `"%"` are not supported here. If you want to set `width` as a percentage, do it via `style` or `class`
   * of the corresponding DOM element.
   * Default: `undefined`
  */
  width?: number | string;
  /** Height in pixels or in CSS units.
   * Percentage units `"%"` are not supported here. If you want to set `height` as a percentage, do it via `style` or `class`
   * of the corresponding DOM element.
   * Default: `undefined`
  */
  height?: number | string;
  /** Custom SVG defs available to all the components within the container. Default: `undefined`. */
  svgDefs?: string;
  /** Alternative text description of the chart for accessibility purposes. It will be applied as an
   * `aria-label` attribute to the div element containing your chart. Default: `undefined`.
  */
  ariaLabel?: string | null | undefined;
  /** A custom color function to be used for all the components within the container.
   * Maps indices or data color keys (when `colorKeys` are provided to components) to colors.
   * Default: `undefined`
  */
  color?: ColorFunction;
}

export const ContainerDefaultConfig: ContainerConfigInterface = {
  duration: undefined,
  margin: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  sizing: Sizing.Fit,
  width: undefined,
  height: undefined,

  svgDefs: undefined,
  ariaLabel: undefined,

  color: undefined,
}
