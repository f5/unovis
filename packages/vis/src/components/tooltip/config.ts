// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable no-irregular-whitespace */
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

// Types
import { Position, PositionStrategy } from 'types/position'

export interface TooltipConfigInterface {
  /** An array of visualization components to interact with. Default: `[]` */
  components?: ComponentCore<unknown>[];
  /** Container to where the Tooltip component should be inserted. Default: `undefined` */
  container?: HTMLElement;
  /** Horizontal placement of the tooltip. Default: `Position.Auto` */
  horizontalPlacement?: Position | string | undefined;
  /** Horizontal shift of the tooltip in pixels. Default: `0` */
  horizontalShift?: number;
  /** Vertical placement of the tooltip. Default: `Position.Top` */
  verticalPlacement?: Position | string | undefined;
  /** Vertical shift of the tooltip in pixels. Default: `0` */
  verticalShift?: number;
  /** Tooltip positioning within the container: absolute or fixed. Default: `PositionStrategy.Absolute` */
  positionStrategy?: PositionStrategy | string;
  /** Defines the content of the tooltip and hovering over which elements should trigger it.
   * An object containing properties in the following format:
   *
   * ```
   * {
   *   [selectorString]: (d: unknown) => string | HTMLElement
   * }
   * ```
   * e.g.:
   * ```
   * {
   *   [Area.selectors.area]: (d: AreaDatum[]) => `<div>${d.value.toString()}</div>
   * }
   * ```
   */
  triggers?: {
    [selector: string]: (data: unknown, i: number, elements: (HTMLElement | SVGElement)[]) => string | HTMLElement | undefined | null;
  };
}

export class TooltipConfig extends Config implements TooltipConfigInterface {
  components: ComponentCore<unknown>[] = []
  container = undefined
  horizontalPlacement = Position.Auto
  horizontalShift = 0
  verticalPlacement = Position.Top
  verticalShift = 0
  positionStrategy = PositionStrategy.Absolute
  triggers: {
    [selector: string]: (data: any, i: number, elements: (HTMLElement | SVGElement)[]) => string | HTMLElement | undefined | null;
  } = {}
}
