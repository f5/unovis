// Types
import { Spacing } from '@/types/spacing'

export interface FlowLegendConfigInterface {
  /** Margin around the legend. Default: `undefined` */
  margin?: Spacing;
  /** Custom width of the component.  Default: `undefined` */
  customWidth?: number;
  /** Legend items array as string[]. Default: `[]` */
  items?: string[];
  /** Spacing between legend items and the arrows in pixels. Default: `undefined` (fit to container width) */
  spacing?: number;
  /** Color of the flow line. Default: `undefined` */
  lineColor?: string;
  /** Color of the flow label. Default: `undefined` */
  labelColor?: string;
  /** Font size of flow labels in pixels. Default: `12` */
  labelFontSize?: number;
  /** Arrow symbol. Default: `'▶'` */
  arrowSymbol?: string;
  /** Color of the arrow. Default: `undefined` */
  arrowColor?: string;
  /** Offset of the arrow symbol vertically in pixels. Default: `undefined` */
  arrowSymbolYOffset?: number;
  /** Callback function for the legend item click. Default: `undefined` */
  onLegendItemClick?: ((label?: string, i?: number) => void);
  /** If set to true, the legend will be rendered directly into the HTML element provided to the constructor
   * without creating additional `div` element. Default: `false` */
  renderIntoProvidedDomNode?: boolean;
}

export const FlowLegendDefaultConfig: FlowLegendConfigInterface = {
  margin: undefined,
  customWidth: undefined,
  items: [],
  spacing: undefined,
  labelFontSize: 12,
  lineColor: undefined,
  labelColor: undefined,
  arrowSymbol: '▶',
  arrowColor: undefined,
  arrowSymbolYOffset: -1,
  onLegendItemClick: undefined,
  renderIntoProvidedDomNode: false,
}
