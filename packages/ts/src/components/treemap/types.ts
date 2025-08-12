import { HierarchyRectangularNode } from 'd3-hierarchy'

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
}

export interface TreemapNode<Datum> extends HierarchyRectangularNode<TreemapDatum<Datum>> {
  _id: string;
  _fill?: string;
  _fillOpacity?: number | null;
}
