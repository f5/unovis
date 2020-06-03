// Copyright (c) Volterra, Inc. All rights reserved.
import { HierarchyRectangularNode, HierarchyNode } from 'd3-hierarchy'

export interface Hierarchy {
  key?: string;
  id?: string;
  values: Hierarchy[];
}

export interface Link<T> {
  source: HierarchyRectangularNode<T>;
  target: HierarchyRectangularNode<T>;
  points?: [];
}

export interface HNode<T> extends HierarchyRectangularNode<T> {
  _state?: { hovered?: boolean };
  _prevX1?: number;
}

export interface HLink<T> {
  source: HierarchyNode<T>;
  target: HierarchyNode<T>;
  _state?: { hovered?: boolean; points?: [] };
}

export interface Ribbon<H> {
  source: HierarchyRectangularNode<H>;
  target: HierarchyRectangularNode<H>;
  points: [];
}

export enum LabelType {
  ALONG = 'along',
  PERPENDICULAR = 'perpendicular',
}
