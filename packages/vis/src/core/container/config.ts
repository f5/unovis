// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { Spacing } from 'types/misc'

export interface ContainerConfigInterface {
  /** Animation duration of all the components within the container */
  duration?: number;
  /** Container margins */
  margin?: Spacing;
  /** Chart padding */
  padding?: Spacing;
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
}
