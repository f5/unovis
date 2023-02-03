import { HierarchyRectangularNode } from 'd3-hierarchy'
import { GraphLinkCore } from 'types'


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

export type ChordDiagramData<
  N extends ChordInputNode,
  L extends ChordInputLink,
> = {
  nodes: N[];
  links?: L[];
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

export type ChordRibbonPoint = { x0: number; x1: number; y0: number; y1: number; a0: number; a1: number; r: number }
export interface ChordRibbon<N extends ChordInputNode> {
  source: ChordLeafNode<N>;
  target: ChordLeafNode<N>;
  points: ChordRibbonPoint[];
  data: GraphLinkCore<N, ChordInputLink>;
  _state: {
    hovered?: boolean;
  };
}

export enum ChordLabelAlignment {
  Along = 'along',
  Perpendicular = 'perpendicular',
}
