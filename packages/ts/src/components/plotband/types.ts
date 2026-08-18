import { TextAlign, VerticalAlign } from '@/types/text'

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

export type PlotbandLayoutValue = {
  x: number;
  y: number;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
}

export type PlotbandLabelLayout = {
  /** Rotation in degrees, applied around the label's anchor point */
  rotation: number;
} & PlotbandLayoutValue


type LabelLayoutFn = (params: {
  startX: number;
  startY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}) => PlotbandLayoutValue

export type PlotbandLayoutMap = Record<PlotbandLabelPosition, LabelLayoutFn>
