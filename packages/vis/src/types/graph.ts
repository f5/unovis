// Copyright (c) Volterra, Inc. All rights reserved.
// Types
import { SHAPE } from 'types/shape'
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
  CIRCULAR = 'circular',
  CONCENTRIC = 'concentric',
  PARALLEL = 'parallel',
  PARALLEL_HORIZONTAL = 'parallel horizontal',
  DAGRE = 'dagre',
  FORCE = 'force',
}

export type CircleLabel = {
  text: string;
  color?: string | null;
  cursor?: string | null;
}

export enum LinkStyle {
  DASHED = 'dashed',
  SOLID = 'solid',
}

export enum LinkArrow {
  SINGLE = 'single',
  DOUBLE = 'double',
}

export interface PanelConfigInterface {
  nodes: (string|number)[];
  label?: string;
  labelPosition?: Position.TOP | Position.BOTTOM;
  color?: string;
  borderWidth?: number;
  padding?: number;
  selectionOutline?: boolean;
  sideLabelIcon?: string;
  sideLabelShape?: SHAPE;
  sideLabelColor?: string;
  sideLabelCursor?: string;
  _numNodes?: number;
  _x?: number;
  _y?: number;
  _width?: number;
  _height?: number;
  _data?: NodeDatumCore[];
}
