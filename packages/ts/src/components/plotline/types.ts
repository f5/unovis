export type PlotlineLineStylePresets = 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'longDash' | 'dashDot' | 'longDashDot' | 'longDashDotDot'
export type PlotlineLegendPosition = 'top-left'| 'top'| 'top-right'| 'right'| 'bottom-right'| 'bottom'| 'bottom-left'| 'left'
export type PlotlineLegendOrientation = 'horizontal'| 'vertical'
export type PlotlineLabelOptions = {
  text?: string;
  position: PlotlineLegendPosition;
  offsetX: number;
  offsetY: number;
  orientation: PlotlineLegendOrientation;
  style?: string;
};
