import { HierarchyRectangularNode } from 'd3-hierarchy'

// Node data flow in the component:
// Input data (N extends ChordInputNode, L extends ChordInputLink)
//   => GraphNodeCore<N>[] (we reference it only in a few places when it's needed, to make the code easier to read)
//   => ChordHierarchy (nested object representing node hierarchy)
//   => ChordNode[] and ChordLeafNode[] (HierarchyRectangularNode[] from D3 partition)

export interface ChordInputNode {
  id?: string;
}

export interface ChordInputLink {
  id?: string;
  source: number | string | ChordInputNode;
  target: number | string | ChordInputNode;
}

export interface ChordHierarchy<N> {
  key: string;
  values: (ChordHierarchy<N> | N)[];
}

export type ChordNodeState = {
  _state: {
    hovered?: boolean;
    value?: number;
  };
  _prevX1?: number;
}

export type ChordNode<N extends ChordInputNode> = HierarchyRectangularNode<N | ChordHierarchy<N>> & ChordNodeState
export type ChordLeafNode<N extends ChordInputNode> = HierarchyRectangularNode<N> & ChordNodeState

export type ChordRibbonPoint = { x0: number; x1: number; y0: number; y1: number }
export interface ChordRibbon<N extends ChordInputNode> {
  source: ChordLeafNode<N>;
  target: ChordLeafNode<N>;
  points: ChordRibbonPoint[];
  _state: {
    hovered?: boolean;
  };
}

export enum ChordLabelAlignment {
  Along = 'along',
  Perpendicular = 'perpendicular',
}
