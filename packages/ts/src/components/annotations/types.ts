import { LengthUnit } from 'types/misc'
import { UnovisText, UnovisTextOptions } from 'types/text'


export type AnnotationItem = Omit<UnovisTextOptions, 'x'|'y'|'width'> & {
  content: string | UnovisText | UnovisText[];
  subject?: AnnotationSubject;
  x?: LengthUnit;
  y?: LengthUnit;
  width?: LengthUnit;
  height?: LengthUnit;
  cursor?: string;
}

export type AnnotationSubjectLocationXY = {
  x: LengthUnit | (() => LengthUnit);
  y: LengthUnit | (() => LengthUnit);
}

export type AnnotationSubjectStyle = {
  /** Subject radius */
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

