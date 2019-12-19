// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'

export interface ContainerConfigInterface {
  /** Container margins */
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Chart padding */
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export class ContainerConfig extends Config implements ContainerConfigInterface {
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
}
