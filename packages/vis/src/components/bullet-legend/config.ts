// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Config } from 'core/config'

export interface BulletLegendConfigInterface {
  /** Legend items array { name, color }[] */
  items?: { name: string; color?: string; inactive?: boolean }[];
  /** Additional label class */
  labelClassName?: string;
  /** Callback function for a legend item click */
  onLegendItemClick?: ((d?: any, i?: number) => any) | null;
}

export class BulletLegendConfig extends Config implements BulletLegendConfigInterface {
  items = []
  labelClassName = ''
  onLegendItemClick = null
}
