// Local Types
import { VisControlItemInterface, VisControlsOrientation } from './types'

export interface VisControlsConfigInterface {
  /** Controls items array, VisControlItemInterface[]. Default: `[]` */
  items?: VisControlItemInterface[];
  /** Controls orientation. `VisControlsOrientation.Horizontal` or `VisControlsOrientation.Horizontal`. Default: `VisControlsOrientation.Horizontal` */
  orientation?: VisControlsOrientation;
}

export const VisControlsDefaultConfig: VisControlsConfigInterface = {
  items: [],
  orientation: VisControlsOrientation.Horizontal,
}

