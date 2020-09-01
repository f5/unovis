// Copyright (c) Volterra, Inc. All rights reserved.
// Types
import { SHAPE } from 'types/shape'

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

export type SideLabel = {
  text: string;
  color?: string;
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
  color?: string;
  borderWidth?: number;
  padding?: number;
  selectionOutline?: boolean;
  sideLabelIcon?: string;
  sideLabelShape?: SHAPE;
  sideLabelColor?: string;
  _numNodes?: number;
  _x?: number;
  _y?: number;
  _width?: number;
  _height?: number;
  _data?: NodeDatumCore[];
}
