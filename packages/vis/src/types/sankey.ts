// Copyright (c) Volterra, Inc. All rights reserved.
import { sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify } from 'd3-sankey'

// Types
import { NodeDatumCore, LinkDatumCore } from 'types/graph'

export interface SankeyNodeDatumInterface extends NodeDatumCore {
  layer?: number;
  sourceLinks?: SankeyLinkDatumInterface[];
  targetLinks?: SankeyLinkDatumInterface[];
  width?: number;
  value?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export interface SankeyLinkDatumInterface extends LinkDatumCore {
  value?: number;
}

export enum SubLabelPlacement {
  INLINE = 'inline',
  BELOW = 'below',
}

export enum NodeAlignType {
  LEFT = sankeyLeft,
  RIGHT = sankeyRight,
  CENTER = sankeyCenter,
  JUSTIFY = sankeyJustify,
}
