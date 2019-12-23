// Copyright (c) Volterra, Inc. All rights reserved.
import { symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye } from 'd3-shape'

export enum SymbolType {
  circle,
  cross,
  diamond,
  square,
  star,
  triangle,
  wye
}

export const Symbol = {
  [SymbolType.circle]: symbolCircle,
  [SymbolType.cross]: symbolCross,
  [SymbolType.diamond]: symbolDiamond,
  [SymbolType.square]: symbolSquare,
  [SymbolType.star]: symbolStar,
  [SymbolType.triangle]: symbolTriangle,
  [SymbolType.wye]: symbolWye,
}
