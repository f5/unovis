// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'

export interface ComponentConfigInterface {
  /** Animation duration */
  duration?: number;
  /** Component width in pixels */
  width?: number;
  /** Component height in pixels */
  height?: number;
  /** Events */
  events?: {
    [selector: string]: {
      [eventName: string]: (data: any) => void;
    };
  };
  /** Custom attributes */
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
