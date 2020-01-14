// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { Margin } from 'types/misc'

export interface ContainerConfigInterface {
  /** Container margins */
  margin?: Margin;
  /** Chart padding */
  padding?: Margin;
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
