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
  fontSize?: string;
  radius?: number;
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
  /** Panel nodes references by unique ids */
  nodes: (string|number)[];
  /** Panel label */
  label?: string;
  /** Position of the label */
  labelPosition?: Position.Top | Position.Bottom;
  /** Color of the panel */
  color?: string;
  /** Border width of the panel in pixels */
  borderWidth?: number;
  /** Inner padding */
  padding?: number;
  /** Dashed outline showing that the panel is selected */
  selectionOutline?: boolean;
  /** Icon of the side label */
  sideLabelIcon?: string;
  /** Size of the label icon as a CSS string. e.g.: `12pt` or `12px` */
  sideLabelIconFontSize?: string;
  /** Shape of the side label */
  sideLabelShape?: Shape;
  /** Color of the side label */
  sideLabelColor?: string;
  /** Cursor of when hovering over the side label */
  sideLabelCursor?: string;
  /** Custom size for the node panel side label in pixels */
  sideLabelSize?: number;
  /** Private property */
  _numNodes?: number;
  /** Private property */
  _x?: number;
  /** Private property */
  _y?: number;
  /** Private property */
  _width?: number;
  /** Private property */
  _height?: number;
  /** Private property */
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
