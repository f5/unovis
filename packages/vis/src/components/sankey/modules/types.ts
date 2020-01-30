// Copyright (c) Volterra, Inc. All rights reserved.

// Types
import { NodeDatumCore, LinkDatumCore } from 'types/graph'

export interface SankeyNodeDatumInterface extends NodeDatumCore {
  width?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export interface SankeyLinkDatumInterface extends LinkDatumCore {
  value?: number;
}
