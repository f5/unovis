export type PlotlineLineStylePresets = 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'longDash' | 'dashDot' | 'longDashDot' | 'longDashDotDot'
export type PlotlineLegendPosition = 'top-left'| 'top'| 'top-right'| 'right'| 'bottom-right'| 'bottom'| 'bottom-left'| 'left'
export type PlotlineLegendOrientation = 'horizontal'| 'vertical'
export type PlotlineLabelOptions = {
  labelText?: string;
  labelPosition: PlotlineLegendPosition;
  labelOffsetX: number;
  labelOffsetY: number;
  labelOrientation: PlotlineLegendOrientation;
  labelColor?: string;
  labelSize?: number;
};
