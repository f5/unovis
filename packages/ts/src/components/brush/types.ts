export type BrushHandleType = {
  type: BrushDirection;
}

export enum BrushDirection {
  West = 'w', // D3 defines brush directions as 'w', 'e', ...
  East = 'e',
}
