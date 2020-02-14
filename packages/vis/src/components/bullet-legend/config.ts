// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Config } from 'core/config'

export interface BulletLegendItemInterface {
  name: string | number;
  color?: string;
  inactive?: boolean;
}

export interface BulletLegendConfigInterface {
  /** Legend items array { name, color }[] */
  items?: BulletLegendItemInterface[];
  /** Additional label class */
  labelClassName?: string;
  /** Callback function for a legend item click */
  onLegendItemClick?: ((d?: BulletLegendItemInterface, i?: number) => any);
}

export class BulletLegendConfig extends Config implements BulletLegendConfigInterface {
  items: BulletLegendItemInterface[] = []
  labelClassName = ''
  onLegendItemClick = undefined;
}
