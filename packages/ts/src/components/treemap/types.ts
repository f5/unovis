import { HierarchyRectangularNode } from 'd3-hierarchy'

export type TreemapDatum<Datum> = {
  datum: Datum;
  index: number;
}

export interface TreemapNode<Datum> extends HierarchyRectangularNode<TreemapDatum<Datum>> {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
