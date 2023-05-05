export enum TrimMode {
  Start = 'start',
  Middle = 'middle',
  End = 'end',
}

export enum VerticalAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}

export enum FitMode {
  Wrap = 'wrap',
  Trim = 'trim',
}

export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export type UnovisText = {
  // The text content to be displayed.
  text: string;
  // The font size of the text in pixels.
  fontSize: number;
  // The font family of the text (optional). Default: `'var(--vis-font-family)'`.
  fontFamily?: string;
  // The color of the text (optional).
  color?: string;
  // The line height scaling factor for the text (optional).
  lineHeight?: number;
  // The top margin of the text block in pixels (optional).
  marginTop?: number;
  // The bottom margin of the text block in pixels (optional).
  marginBottom?: number;
  // The font width-to-height ratio (optional).
  fontWidthToHeightRatio?: number;
}

export type UnovisWrappedText = UnovisText & {
  // An array of text lines, where each element represents a single line of text.
  _lines: string[];
  // Estimated height of this text block
  _estimatedHeight: number;
}

export type UnovisTextOptions = {
  // The maximum width of the text in pixels.
  width?: number;
  // The word separator(s) used to split the text into words.
  separator?: string | string[];
  // The vertical alignment of the text ('top', 'middle', or 'bottom').
  verticalAlign?: VerticalAlign | string;
  // The horizontal text alignment ('left', 'center', or 'right').
  textAlign?: TextAlign | string;
  // Whether to use a fast estimation method or a more accurate one for text calculations.
  fastMode?: boolean;
  // Force word break if they don't fit into the width
  wordBreak?: boolean;
}

export type UnovisTextFrameOptions = UnovisTextOptions & {
  width: number;
  height?: number;
  x?: number;
  y?: number;
}

