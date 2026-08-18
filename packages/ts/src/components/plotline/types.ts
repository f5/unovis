import { TextAlign, VerticalAlign } from '@/types/text'

export enum PlotlineLineStylePresets {
  Solid = 'solid',
  Dash = 'dash',
  DashDot = 'dashDot',
  Dot = 'dot',
  LongDash = 'longDash',
  LongDashDot = 'longDashDot',
  LongDashDotDot = 'longDashDotDot',
  ShortDash = 'shortDash',
  ShortDashDot = 'shortDashDot',
  ShortDashDotDot = 'shortDashDotDot',
  ShortDot = 'shortDot',
}

export enum PlotlineLabelPosition {
  TopLeft = 'top-left',
  Top = 'top',
  TopRight = 'top-right',
  Right = 'right',
  BottomRight = 'bottom-right',
  Bottom = 'bottom',
  BottomLeft = 'bottom-left',
  Left = 'left',
}

export enum PlotlineLabelOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export type PlotlineLayoutValue = {
  x: number;
  y: number;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
}

export type PlotlineLabelLayout = {
  /** Rotation in degrees, applied around the label's anchor point */
  rotation: number;
} & PlotlineLayoutValue

export type LineStyleValue =
  | `${number}`
  | `${number},${number}`
  | `${number},${number},${number}`
  | `${number},${number},${number},${number}`
  | `${number},${number},${number},${number},${number}`
  | `${number},${number},${number},${number},${number},${number}`;

export type PlotlineLayoutMap = Record<PlotlineLabelPosition, (params: { width: number; height: number; offsetX: number; offsetY: number }) => PlotlineLayoutValue>
