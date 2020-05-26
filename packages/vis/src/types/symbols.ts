// Copyright (c) Volterra, Inc. All rights reserved.
import { symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye } from 'd3-shape'

export enum SymbolType {
  CIRCLE = 'circle',
  CROSS = 'cross',
  DIAMOND = 'diamond',
  SQUARE = 'square',
  STAR = 'star',
  TRIANGLE = 'triangle',
  WYE = 'wye'
}

export const Symbol = {
  [SymbolType.CIRCLE]: symbolCircle,
  [SymbolType.CROSS]: symbolCross,
  [SymbolType.DIAMOND]: symbolDiamond,
  [SymbolType.SQUARE]: symbolSquare,
  [SymbolType.STAR]: symbolStar,
  [SymbolType.TRIANGLE]: symbolTriangle,
  [SymbolType.WYE]: symbolWye,
}
