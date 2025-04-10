// Types
import { Position } from 'types/position'
import { GraphInputLink, GraphInputNode, GraphNodeCore, GraphLinkCore } from 'types/graph'
import { Spacing } from 'types/spacing'
import { TrimMode } from 'types/text'

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
    brushed?: boolean;
  };

  _panels?: GraphPanel<N, L>[];
  _isConnected?: boolean;
}

export type GraphForceSimulationNode<
  N extends GraphInputNode = GraphInputNode,
  L extends GraphInputLink = GraphInputLink,
> = GraphNode<N, L> & {
  fx?: number;
  fy?: number;
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
  Elk = 'elk',
  Precalculated = 'precalculated',
}

export type GraphCircleLabel = {
  text: string;
  textColor?: string | null;
  color?: string | null;
  cursor?: string | null;
  fontSize?: string | null;
  radius?: number;
}

export type GraphLinkLabel = GraphCircleLabel

export enum GraphLinkStyle {
  Dashed = 'dashed',
  Solid = 'solid',
}

export enum GraphLinkArrowStyle {
  Single = 'single',
  Double = 'double',
}

export enum GraphNodeShape {
  Circle = 'circle',
  Square = 'square',
  Hexagon = 'hexagon',
  Triangle = 'triangle',
}

export type GraphPanelConfig = {
  /** Panel nodes references by unique ids */
  nodes: (string|number)[];
  /** Panel label */
  label?: string;
  /** Trim label if it's longer than this number of characters */
  labelTrimLength?: number;
  /** Trim mode of the label */
  labelTrimMode?: TrimMode;
  /** Position of the label */
  labelPosition?: Position.Top | Position.Bottom | string;
  /** Fill color of the panel */
  fillColor?: string;
  /** Color of the panel's border */
  borderColor?: string;
  /** Border width of the panel in pixels */
  borderWidth?: number;
  /** Inner padding */
  padding?: number | Spacing;
  /** Dashed outline showing that the panel is selected */
  dashedOutline?: boolean;
  /** Side icon symbol */
  sideIconSymbol?: string;
  /** Size of the icon as a CSS string. e.g.: `12pt` or `12px` */
  sideIconFontSize?: string;
  /** Color of the icon */
  sideIconSymbolColor?: string;
  /** Shape of the icon's background */
  sideIconShape?: GraphNodeShape | string;
  /** Size of the icon's background shape */
  sideIconShapeSize?: number;
  /** Stroke color of the icon's background shape */
  sideIconShapeStroke?: string;
  /** Cursor, when hovering over the icon */
  sideIconCursor?: string;
}

export type GraphPanel<
  N extends GraphInputNode = GraphInputNode,
  L extends GraphInputLink = GraphInputLink,
> = GraphPanelConfig & {
  _numNodes?: number;
  _x?: number;
  _y?: number;
  _width?: number;
  _height?: number;
  _disabled?: boolean;
  _padding?: Spacing;
}

export type GraphNodeAnimationState = {
  endAngle: number;
  nodeIndex: number;
  nodeSize?: number;
  borderWidth?: number;
}

export type GraphNodeAnimatedElement<T = SVGElement> = T & {
  _animState: GraphNodeAnimationState;
}

export type GraphForceLayoutSettings<
  N extends GraphInputNode = GraphInputNode,
  L extends GraphInputLink = GraphInputLink,
> = {
  /** Preferred Link Distance. Default: `60` */
  linkDistance?: number | ((l: GraphLink<N, L>, i: number) => number);
  /** Link Strength [0:1]. Default: `0.45` */
  linkStrength?: number | ((l: GraphLink<N, L>, i: number) => number);
  /** Charge Force (<0 repulsion, >0 attraction). Default: `-500` */
  charge?: number | ((l: GraphNode<N, L>, i: number) => number);
  /** X-centring force. Default: `0.15` */
  forceXStrength?: number;
  /** Y-centring force. Default: `0.25` */
  forceYStrength?: number;
  /** Number if simulation iterations. Default: automatic */
  numIterations?: number;
  /** Set to true if you want to fix the node positions after the simulation
   * Helpful when you want to update graph settings without re-calculating the layout.
   * Default: `false` */
  fixNodePositionAfterSimulation?: boolean;
}

export type GraphElkLayoutSettings = Record<string, string>

/**
 * Settings for configuring the layout of a Dagre graph.
 */
export type GraphDagreLayoutSetting = {
  /**
   * Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
   * Additional custom values can also be provided as a string.
   */
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL' | string;

  /**
   * Alignment for rank nodes. Can be UL, UR, DL, or DR, where U = up, D = down, L = left, and R = right.
   * Additional custom values can also be provided as a string.
   */
  align?: 'UL' | 'UR' | 'DL' | 'DR' | string;

  /**
   * Number of pixels that separate nodes horizontally in the layout.
   */
  nodesep?: number;

  /**
   * Number of pixels that separate edges horizontally in the layout.
   */
  edgesep?: number;

  /**
   * Number of pixels between each rank in the layout.
   */
  ranksep?: number;

  /**
   * Number of pixels to use as a margin around the left and right of the graph.
   */
  marginx?: number;

  /**
   * Number of pixels to use as a margin around the top and bottom of the graph.
   */
  marginy?: number;

  /**
   * If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
   * A feedback arc set is a set of edges that can be removed to make a graph acyclic.
   */
  acyclicer?: 'greedy' | undefined;

  /**
   * Type of algorithm to assign a rank to each node in the input graph.
   * Possible values are 'network-simplex', 'tight-tree', or 'longest-path'.
   * Additional custom values can also be provided as a string.
   */
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path' | string;
}

export enum GraphNodeSelectionHighlightMode {
  None = 'none',
  Greyout ='greyout',
  GreyoutNonConnected ='greyout-non-connected',
}

export enum GraphFitViewAlignment {
  Center = 'center',
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}
