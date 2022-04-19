import { symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye } from 'd3-shape'

export enum SymbolType {
  Circle = 'circle',
  Cross = 'cross',
  Diamond = 'diamond',
  Square = 'square',
  Star = 'star',
  Triangle = 'triangle',
  Wye = 'wye',
}

export const Symbol = {
  [SymbolType.Circle]: symbolCircle,
  [SymbolType.Cross]: symbolCross,
  [SymbolType.Diamond]: symbolDiamond,
  [SymbolType.Square]: symbolSquare,
  [SymbolType.Star]: symbolStar,
  [SymbolType.Triangle]: symbolTriangle,
  [SymbolType.Wye]: symbolWye,
}
