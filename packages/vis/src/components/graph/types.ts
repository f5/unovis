// Copyright (c) Volterra, Inc. All rights reserved.
// Types
import { Shape } from 'types/shape'
import { Position } from 'types/position'

export type NodeDatumCore = {
  id?: number | string;
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

  _panels?: NodeDatumCore[][];
  _isConnected?: boolean;
}

export type LinkDatumCore = {
  id?: number | string;
  source: number | string | NodeDatumCore;
  target: number | string | NodeDatumCore;

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

export enum LayoutType {
  Circular = 'circular',
  Concentric = 'concentric',
  Parallel = 'parallel',
  ParallelHorizontal = 'parallel horizontal',
  Dagre = 'dagre',
  Force = 'force',
}

export type CircleLabel = {
  text: string;
  color?: string | null;
  cursor?: string | null;
}

export enum LinkStyle {
  Dashed = 'dashed',
  Solid = 'solid',
}

export enum LinkArrow {
  Single = 'single',
  Double = 'double',
}

export interface PanelConfigInterface {
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
  _data?: NodeDatumCore[];
}
