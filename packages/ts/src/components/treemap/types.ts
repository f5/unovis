import { HierarchyNode, HierarchyRectangularNode } from 'd3-hierarchy'

export type TreemapDatum<Datum> = {
  // The key for this layer of the hierarchy,
  // useful for labeling.
  // This is `undefined` for the root node.
  key?: string;

  // The index of the original data item.
  // Defined for leaf nodes only.
  index?: number;

  // The original data item
  // Defined for leaf nodes only.
  datum?: Datum;

  // Whether this is a leaf node.
  isLeaf: boolean;
}

export interface TreemapNode<Datum> extends HierarchyRectangularNode<TreemapDatum<Datum>> {
  topLevelParent: TreemapNode<Datum>; // Reference to the top-level parent node (depth === 1). Convenient for external color routines.

  _id: string;
  _fill?: string;
  _fillOpacity?: number | null;
}

export type HierarchyNodeWithValue<Datum> = HierarchyNode<Datum> & { readonly value: number }
export type TreemapTileFunction<Datum> = (node: HierarchyRectangularNode<Datum>, x0: number, y0: number, x1: number, y1: number) => void
