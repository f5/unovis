export enum PlotbandLabelPosition {
  TopLeftInside = 'top-left-inside',
  TopLeftOutside = 'top-left-outside',
  TopInside = 'top-inside',
  TopOutside = 'top-outside',
  TopRightInside = 'top-right-inside',
  TopRightOutside = 'top-right-outside',
  RightInside = 'right-inside',
  RightOutside = 'right-outside',
  BottomRightInside = 'bottom-right-inside',
  BottomRightOutside = 'bottom-right-outside',
  BottomInside = 'bottom-inside',
  BottomOutside = 'bottom-outside',
  BottomLeftInside = 'bottom-left-inside',
  BottomLeftOutside = 'bottom-left-outside',
  LeftInside = 'left-inside',
  LeftOutside = 'left-outside',
}

export enum PlotbandLabelOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export interface PlotlineLabelOptions {
  labelText?: string;
  labelPosition: PlotbandLabelPosition;
  labelOffsetX: number;
  labelOffsetY: number;
  labelOrientation: PlotbandLabelOrientation;
  labelColor?: string;
  labelSize?: number;
}
