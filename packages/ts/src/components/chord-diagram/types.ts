import { HierarchyRectangularNode } from 'd3-hierarchy'
import { GraphLinkCore, GraphNodeCore } from 'types'

// Node data flow in the component:
// Input data (N extends ChordInputNode, L extends ChordInputLink)
//   => GraphNodeCore<N>[] (we reference it only in a few places when it's needed, to make the code easier to read)
//   => ChordHierarchyNode (nested object representing node hierarchy)
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

export interface ChordHierarchyNode<N> {
  key: string;
  values: (ChordHierarchyNode<N> | N)[];
  depth?: number;
  height?: number;
  value?: number;
  ancestors?: string[];
}

export type ChordNodeState = {
  _state: {
    hovered?: boolean;
    value?: number;
  };
  _prevX1?: number;
}

export type ChordNodeCore<N> = HierarchyRectangularNode<N> & ChordNodeState & {
  data: GraphNodeCore<N, ChordInputLink>;
  uid: string; // Unique id for textPath href
}

export type ChordNodeDatum<N> = ChordHierarchyNode<N> | N

export type ChordNode<N extends ChordInputNode> = ChordNodeCore<ChordNodeDatum<N>>
export type ChordLeafNode<N extends ChordInputNode> = ChordNodeCore<N>

export type ChordRibbonPoint = { a0: number; a1: number; r: number }
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
