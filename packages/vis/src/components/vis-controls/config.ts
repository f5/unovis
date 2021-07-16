// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'

// Types
import { VisControlItemInterface, VisControlsOrientation } from 'types/controls'

export interface VisControlsConfigInterface {
  /** Controls items array */
  items?: VisControlItemInterface[];
  /** Controls orientation. Default is horizontal */
  orientation?: VisControlsOrientation;
}

export class VisControlsConfig extends Config implements VisControlsConfigInterface {
  items = []
  orientation = VisControlsOrientation.Horizontal
}
