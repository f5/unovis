// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable no-irregular-whitespace */
import { Config } from 'core/config'

export interface ComponentConfigInterface {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  duration?: number;
  /** Component width in pixels. This property is set automatically by the container. */
  width?: number;
  /** Component height in pixels. This property is set automatically by the container. */
  height?: number;
  /** Events configuration. An object containing properties in the following format:
   *
   * ```
   * {
   *   [selectorString]: {
   *       [eventType]: callbackFunction
   *   }
   * }
   * ```
   * e.g.:
   * ```
   * {
   *   [Area.selectors.area]: {
   *     click: (d) => console.log("Clicked Area", d)
   *   }
   * }
   * ```
   */
  events?: {
    [selector: string]: {
      [eventName: string]: (data: any, event?: Event, i?: number, els?: SVGElement[] | HTMLElement[]) => void;
    };
  };
  /** You can set every SVG and HTML visualization object to have a custom DOM attributes, which is useful
   * when you want to do unit or end-to-end testing. Attributes configuration object has the following structure:
   *
   * ```
   * {
   *   [selectorString]: {
   *       [attributeName]: attribute constant value or accessor function
   *   }
   * }
   * ```
   * e.g.:
   * ```
   * {
   *   [Area.selectors.area]: {
   *     "test-value": d => d.value
   *   }
   * }
   * ```
   */
  attributes?: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  };
}

export class ComponentConfig extends Config implements ComponentConfigInterface {
  duration = 600
  width = 400
  height = 200
  events = {}
  attributes = {}
}

export interface ConfigConstructor {
  new(config?: ComponentConfigInterface): ComponentConfig;
}
