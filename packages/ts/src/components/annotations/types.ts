import { LengthUnit } from 'types/misc'
import { UnovisText, UnovisTextFrameOptions } from 'types/text'

export type AnnotationItem = UnovisTextFrameOptions & {
  content: string | UnovisText | UnovisText[];
  subject?: AnnotationSubject;
  x?: LengthUnit;
  y?: LengthUnit;
  width?: LengthUnit;
  height?: LengthUnit;
}

export type AnnotationSubjectLocationXY = {
  x: LengthUnit | (() => LengthUnit);
  y: LengthUnit | (() => LengthUnit);
}

export enum AnnotationSubjectType {
  Circle = 'circle',
  Rect = 'rect',
}

export type AnnotationSubjectStyle = {
  /** Type of the subject: AnnotationSubjectType.Circle or AnnotationSubjectType.Rect
  * Default: AnnotationSubjectType.Circle
  */
  type?: AnnotationSubjectType | string;
  /** Subject width. Only for `AnnotationSubjectType.Rect` */
  width?: number;
  /** Subject height. Only for `AnnotationSubjectType.Rect` */
  height?: number;
  /** Subject radius. Only for `AnnotationSubjectType.Circle` */
  radius?: number;
  /** Subject fill color */
  fillColor?: string;
  /** Subject stroke color */
  strokeColor?: string;
  /** Subject stroke-dasharray configuration */
  strokeDasharray?: string;
  /** Padding between the subject and the connector line */
  padding?: number;
  /** Connector line color */
  connectorLineColor?: string;
  /** Connector line stroke-dasharray configuration */
  connectorLineStrokeDasharray?: string;
}

export type AnnotationSubject = AnnotationSubjectStyle & AnnotationSubjectLocationXY

