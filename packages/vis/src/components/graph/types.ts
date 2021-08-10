// Copyright (c) Volterra, Inc. All rights reserved.
// Types
import { Shape } from 'types/shape'
import { Position } from 'types/position'
import { GraphInputLink, GraphInputNode, GraphNodeCore, GraphLinkCore } from 'types/graph'

export type GraphNode<
  N extends GraphInputNode = GraphInputNode,
  L extends GraphInputLink = GraphInputLink,
> = GraphNodeCore<N, L> & {
  x?: number;
  y?: number;

  _id?: number | string;
  _index?: number;
  _state?: {
    isDragged?: boolean;
    fx?: number;
    fy?: number;
    selected?: boolean;
    greyout?: boolean;
  };

  _panels?: GraphNode<N>[][];
  _isConnected?: boolean;
}

export type GraphLink<
  N extends GraphInputNode = GraphInputNode,
  L extends GraphInputLink = GraphInputLink,
> = GraphLinkCore<N, L> & {
  id?: number | string;
  source: number | string | GraphNode<N>;
  target: number | string | GraphNode<N>;

  _id?: number | string;
  _direction?: number;
  _index?: number;
  _neighbours?: number;

  _state?: {
    flowAnimTime?: number;
    hovered?: boolean;
    selected?: boolean;
    greyout?: boolean;
  };
}

export enum GraphLayoutType {
  Circular = 'circular',
  Concentric = 'concentric',
  Parallel = 'parallel',
  ParallelHorizontal = 'parallel horizontal',
  Dagre = 'dagre',
  Force = 'force',
}

export type GraphCircleLabel = {
  text: string;
  color?: string | null;
  cursor?: string | null;
}

export enum GraphLinkStyle {
  Dashed = 'dashed',
  Solid = 'solid',
}

export enum GraphLinkArrow {
  Single = 'single',
  Double = 'double',
}

export interface GraphPanelConfigInterface<
  N extends GraphInputNode = GraphInputNode,
  L extends GraphInputLink = GraphInputLink,
> {
  nodes: (string|number)[];
  label?: string;
  labelPosition?: Position.Top | Position.Bottom;
  color?: string;
  borderWidth?: number;
  padding?: number;
  selectionOutline?: boolean;
  sideLabelIcon?: string;
  sideLabelShape?: Shape;
  sideLabelColor?: string;
  sideLabelCursor?: string;
  _numNodes?: number;
  _x?: number;
  _y?: number;
  _width?: number;
  _height?: number;
  _data?: GraphNode<N, L>[];
}

export type GraphNodeAnimationState = {
  endAngle: number;
  nodeSize?: number;
  borderWidth?: number;
}

export type GraphNodeAnimatedElement<T = SVGElement> = T & {
  _animState: GraphNodeAnimationState;
}
