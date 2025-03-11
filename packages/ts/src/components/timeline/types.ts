import { Arrangement } from 'types/position'

export type TimelineRowLabel<D> = {
  label: string;
  formattedLabel: string;
  data: D[];
}

export type TimelineArrow = {
  /** The optional x position of the arrow. By default the arrow will be placed at the source line's end */
  x?: number;
  /** The horizontal offset of the arrow in pixels. Default: `undefined` */
  xOffsetPx?: number;
  /** The id of the line start element. */
  lineSourceId: string;
  /** The id of the line end element. */
  lineTargetId: string;
  /** The margin between the line source and the arrow in pixels. Default: `undefined` */
  lineSourceMarginPx?: number;
  /** The margin between the line target and the arrow in pixels. Default: `undefined` */
  lineTargetMarginPx?: number;
  /** The length of the arrowhead in pixels. Default: `5` */
  arrowHeadLength?: number;
  /** The width of the arrowhead in pixels. Default: `6` */
  arrowHeadWidth?: number;
}

export type TimelineArrowRenderState = {
  _x1: number;
  _x2: number;
  _y1: number;
  _y2: number;
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
