// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'

// Local Types
import { BulletLegendItemInterface } from './types'

export interface BulletLegendConfigInterface {
  /** Legend items array { name, color }[] */
  items?: BulletLegendItemInterface[];
  /** Additional label class */
  labelClassName?: string;
  /** Callback function for a legend item click */
  onLegendItemClick?: ((d?: BulletLegendItemInterface, i?: number) => any);
  /**  Label font size */
  labelFontSize?: string;
  /** Label text max width */
  labelMaxWidth?: string;
  /** Bullet circle size */
  bulletSize?: string;
}

export class BulletLegendConfig extends Config implements BulletLegendConfigInterface {
  items: BulletLegendItemInterface[] = []
  labelClassName = ''
  onLegendItemClick = undefined;
  labelFontSize = null;
  labelMaxWidth = null;
  bulletSize = null;
}
