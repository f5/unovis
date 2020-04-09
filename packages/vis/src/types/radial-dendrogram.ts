// Copyright (c) Volterra, Inc. All rights reserved.
import { HierarchyRectangularNode } from 'd3-hierarchy'

export interface Hierarchy {
  key?: string;
  values: Hierarchy[];
}

export interface Link<T> {
  source: HierarchyRectangularNode<T>;
  target: HierarchyRectangularNode<T>;
}
