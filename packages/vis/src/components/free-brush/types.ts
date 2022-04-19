export type FreeBrushSelection = [number, number] | [[number, number], [number, number]];
export type FreeBrushSelectionInPixels = FreeBrushSelection

export enum FreeBrushMode {
  X = 'x',
  Y = 'y',
  XY = 'xy',
}
