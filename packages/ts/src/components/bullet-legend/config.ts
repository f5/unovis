import { Config } from 'core/config'

// Local Types
import { BulletLegendItemInterface } from './types'

export interface BulletLegendConfigInterface {
  /** Legend items array BulletLegendItemInterface[]. Default: `[]` */
  items: BulletLegendItemInterface[];
  /** Apply a specific class to the labels. Default: `''` */
  labelClassName?: string;
  /** Callback function for the legend item click. Default: `undefined` */
  onLegendItemClick?: ((d: BulletLegendItemInterface, i: number) => void);
  /** Label text (<span> element) font-size CSS. Default: `null` */
  labelFontSize?: string | null;
  /** Label text (<span> element) max-width CSS property. Default: `null` */
  labelMaxWidth?: string | null;
  /** Bullet circle size, mapped to the width and height CSS properties. Default: `null` */
  bulletSize?: string | null;
}

export class BulletLegendConfig extends Config implements BulletLegendConfigInterface {
  items: BulletLegendItemInterface[] = []
  labelClassName = ''
  onLegendItemClick = undefined
  labelFontSize = null
  labelMaxWidth = null
  bulletSize = null
}
