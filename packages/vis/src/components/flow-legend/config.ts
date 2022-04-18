import { Config } from 'core/config'

export interface FlowLegendConfigInterface {
  /** Custom width of the component.  Default: `undefined` */
  customWidth?: number;
  /** Legend items array as string[]. Default: `[]` */
  items?: string[];
  /** Color of the flow line. Default: `undefined` */
  lineColor?: string;
  /** Color of the flow label. Default: `undefined` */
  labelColor?: string;
  /** Font size of flow labels in pixels. Default: `12` */
  labelFontSize?: number;
  /** Arrow symbol. Default: `'▶'` */
  arrowSymbol?: string;
  /** Callback function for the legend item click. Default: `undefined` */
  onLegendItemClick?: ((label?: string, i?: number) => void);
}

export class FlowLegendConfig extends Config implements FlowLegendConfigInterface {
  customWidth = undefined
  items = []
  labelFontSize = 12
  arrowSymbol = '▶'
  lineColor = undefined
  labelColor = undefined
  onLegendItemClick = undefined;
}
