import { Arrangement } from 'types/position'

export type TimelineRowIcon = {
  href: string;
  size: number;
  color: string;
}

export type TimelineRowLabel<D> = {
  label: string;
  formattedLabel: string;
  data: D[];
  iconHref?: string;
  iconSize?: number;
  iconColor?: string;
}

export type TimelineArrow = {
  id?: string;
  /** The optional x position of the arrow start. By default the arrow will be placed at the source line's end */
  xSource?: number;
  /** The optional x position of the arrow end. By default the arrow will be placed at the target line's start */
  xTarget?: number;
  /** The horizontal offset of the arrow in pixels. Default: `undefined` */
  xSourceOffsetPx?: number;
  /** The horizontal offset of the arrow in pixels. Default: `undefined` */
  xTargetOffsetPx?: number;
  /** The id of the line start element. */
  lineSourceId: string;
  /** The id of the line end element. */
  lineTargetId: string;
  /** The margin between the line source and the arrow in pixels. Default: `undefined` */
  lineSourceMarginPx?: number;
  /** The margin between the line target and the arrow in pixels. Default: `undefined` */
  lineTargetMarginPx?: number;
  /** The length of the arrowhead in pixels. Default: `8` */
  arrowHeadLength?: number;
  /** The width of the arrowhead in pixels. Default: `6` */
  arrowHeadWidth?: number;
}

export type TimelineArrowRenderState = {
  _points: [number, number][];
}

export type TimelineLineRenderState = {
  _id: string;
  /** The x position of the line start pixels. */
  _xPx: number;
  /** The y position of the line in pixels. */
  _yPx: number;
  /** The x offset of the line in pixels. Applied the the lines is too short. See the `_lengthCorrected` property */
  _xOffsetPx: number;
  /** The height of the line in pixels. */
  _height: number;
  /** The length of the line in pixels. */
  _length: number;
  /** When the line is too short, the length is corrected to be
   * at least the line height when `config.lineCap` is set to `true` */
  _lengthCorrected: number;
  _startIconSize: number;
  _endIconSize: number;
  _startIconColor: string;
  _endIconColor: string;
  _startIconArrangement: `${Arrangement}`;
  _endIconArrangement: `${Arrangement}`;
}
