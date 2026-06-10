import { RollingPinLegendItem } from '@/components/rolling-pin-legend/types'

export interface RollingPinLegendConfigInterface {
  /** Rects forming a legend. Array of `string`, representing colors.
   *
   * Default: `[]` */
  rects: RollingPinLegendItem[];
  /** Label on the left side of the legend. Default: `undefined` */
  leftLabelText?: string;
  /** Label on the right side of the legend. Default: `undefined` */
  rightLabelText?: string;
  /** Apply a specific class to the labels. Default: `''` */
  labelClassName?: string;
  /** Label text (<span> element) font-size CSS. Default: `null` */
  labelFontSize?: string | null;
  /** If set to true, the legend will be rendered directly into the HTML element provided to the constructor
   * without creating additional `div` element. Default: `false` */
  renderIntoProvidedDomNode?: boolean;
}

export const RollingPinLegendDefaultConfig: RollingPinLegendConfigInterface = {
  rects: [],
  leftLabelText: undefined,
  rightLabelText: undefined,
  labelClassName: '',
  labelFontSize: null,
  renderIntoProvidedDomNode: false,
}
