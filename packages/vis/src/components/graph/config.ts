/* eslint-disable dot-notation */
// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'
import { BooleanAccessor, ColorAccessor, NumericAccessor, StringAccessor, GenericAccessor } from 'types/accessor'

// Local Types
import {
  GraphLayoutType,
  GraphCircleLabel,
  GraphLinkStyle,
  GraphLinkArrow,
  GraphPanelConfigInterface,
  GraphForceLayoutSettings,
  GraphNodeShape,
} from './types'

export interface GraphConfigInterface<N extends GraphInputNode, L extends GraphInputLink> extends ComponentConfigInterface {
  // Zoom and drag
  /** Zoom level constraints. Default: [0.35, 1.25] */
  zoomScaleExtent?: [number, number];
  /** Disable zooming. Default: `false` */
  disableZoom?: boolean;
  /** Disable node dragging. Default: `false` */
  disableDrag?: boolean;
  /** Interval to re-render the graph when zooming. Default: `100` */
  zoomThrottledUpdateNodeThreshold?: number;
  /** Zoom event callback. Default: `undefined` */
  onZoom?: (zoomScale: number, zoomScaleExtent: number) => void;

  // Layout
  /** Type of the graph layout. Default: `GraphLayoutType.Force` */
  layoutType?: GraphLayoutType | string;
  /** Fit the graph to container on data or config updates, or on container resize. Default: `true` */
  layoutAutofit?: boolean;
  /** Tolerance constant defining whether the graph should be fitted to container
   * (on data or config update, or container resize) after a zoom / pan interaction or not.
   * `0` — Stop fitting after any pan or zoom
   * `Number.POSITIVE_INFINITY` — Always fit
   * Default: `8.0`
  */
  layoutAutofitTolerance?: number;
  /** Place non-connected nodes to the bottom of the graph. Default: `false` */
  layoutNonConnectedAside?: boolean;

  // Settings for Parallel and Concentric Layouts
  /** Order of the layout groups.
   * Only for `GraphLayoutType.Parallel`, `GraphLayoutType.ParallelHorizontal` and `GraphLayoutType.Concentric` layouts.
   * Default: `[]` */
  layoutGroupOrder?: string[];
  /** Number of rows per group.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `1` */
  layoutGroupRows?: number;
  /** Set the number of nodes in a sub-group after which they'll continue from the next line or column.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `6` */
  layoutSubgroupMaxNodes?: number;
  /** Set the spacing between the groups.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  layoutGroupSpacing?: number;
  /** Set a group by name to have priority in sorting the graph links.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  layoutSortConnectionsByGroup?: string;
  /** Node group accessor function. Default: `node => node.group` */
  nodeGroup?: StringAccessor<N>;
  /** Node sub-group accessor function. Default: `node => node.subgroup` */
  nodeSubGroup?: StringAccessor<N>;

  /** Force Layout settings, see the `d3-force` package for more details */
  forceLayoutSettings?: GraphForceLayoutSettings;

  /** Darge Layout settings, see the `dagrejs` package fore more details */
  dagreLayoutSettings?: {
    /** Direction for rank node. `TB`, `BT`, `LR`, or `RL`. Default: `BT` */
    rankdir: string;
    /** Type of algorithm to assigns a rank to each node in the input graph.
     * `network-simplex`, `tight-tree` or `longest-path`.
     * Default: `longest-path` */
    ranker: string;
    /** Other configurable Dagre settings. https://github.com/dagrejs/dagre/wiki */
    [key: string]: any;
  };

  // Links
  /** Animation duration of the flow (traffic) circles. Default: `20000` */
  flowAnimDuration?: number;
  /** Size of the moving circles that represent traffic flow. Default: `2` */
  flowCircleSize?: number;
  /** Link width accessor function ot constant value. Default: `1` */
  linkWidth?: NumericAccessor<L>;
  /** Link style accessor function or constant value. Default: `GraphLinkStyle.Solid`  */
  linkStyle?: GenericAccessor<GraphLinkStyle, L>;
  /** Link band width accessor function or constant value. Default: `0` */
  linkBandWidth?: NumericAccessor<L>;
  /** Link arrow accessor function or constant value. Default: `undefined` */
  linkArrow?: GenericAccessor<GraphLinkArrow, L> | undefined;
  /** Link stroke color accessor function or constant value. Default: `undefined` */
  linkStroke?: ColorAccessor<L>;
  /** Link disabled state accessor function or constant value. Default: `false` */
  linkDisabled?: BooleanAccessor<L>;
  /** Link flow animation accessor function or constant value. Default: `false` */
  linkFlow?: BooleanAccessor<L>;
  /** Link label accessor function or constant value. Default: `undefined` */
  linkLabel?: GenericAccessor<GraphCircleLabel, L> | undefined;
  /** Shift label along the link center a little bit to avoid overlap with the link arrow. Default: `true` */
  linkLabelShiftFromCenter?: BooleanAccessor<L>;
  /** Spacing between neighboring links. Default: `8` */
  linkNeighborSpacing?: number;
  /** Set selected link by its unique id. Default: `undefined` */
  selectedLinkId?: number | string;

  // Nodes
  /** Animation duration of the node score outline. Default: `1500` */
  scoreAnimDuration?: number;
  /** Node size accessor function or constant value. Default: `30` */
  nodeSize?: NumericAccessor<N>;
  /** Node border width accessor function or constant value. Default: `3` */
  nodeBorderWidth?: NumericAccessor<N>;
  /** Node shape accessor function or constant value. Default: `Shape.Circle` */
  nodeShape?: GenericAccessor<GraphNodeShape | `${GraphNodeShape}`, N>;
  /** Node score outline accessor function or constant value in the range [0,100]. Default: `0` */
  nodeStrokeSegmentValue?: NumericAccessor<N>;
  /** Node central icon accessor function or constant value. Default: `node => node.icon` */
  nodeIcon?: StringAccessor<N>;
  /** Node central icon size accessor function or constant value. Default: `undefined` */
  nodeIconSize?: NumericAccessor<N>;
  /** Node label accessor function or constant value. Default: `node => node.label` */
  nodeLabel?: StringAccessor<N>;
  /** Node sub-label accessor function or constant value: Default: `''` */
  nodeSubLabel?: StringAccessor<N>;
  /** Node circular side labels accessor function. The function should return an array of GraphCircleLabel objects. Default: `undefined` */
  nodeSideLabels?: GenericAccessor<GraphCircleLabel[], N>;
  /** Node bottom icon accessor function. Default: `undefined` */
  nodeBottomIcon?: StringAccessor<N>;
  /** Node disabled state accessor function or constant value. Default: `false` */
  nodeDisabled?: BooleanAccessor<N>;
  /** Node fill color accessor function or constant value. Default: `node => node.fill` */
  nodeFill?: ColorAccessor<N>;
  /** Node score outline fill color accessor function or constant value. Default: `undefined` */
  nodeStrokeSegmentFill?: ColorAccessor<N>;
  /** Node stroke color accessor function or constant value. Default: `node => node.stroke` */
  nodeStroke?: ColorAccessor<N>;
  /** Sorting function to determine node placement. Default: `undefined` */
  nodeSort?: ((a: N, b: N) => number);
  /** Specify the initial position for entering nodes as [x, y]. Default: `undefined` */
  nodeEnterPosition?: GenericAccessor<[number, number], N> | undefined;
  /** Specify the initial scale for entering nodes in the range [0,1]. Default: `0.75` */
  nodeEnterScale?: NumericAccessor<N> | undefined;
  /** Specify the destination position for exiting nodes as [x, y]. Default: `undefined` */
  nodeExitPosition?: GenericAccessor<[number, number], N> | undefined;
  /** Specify the destination scale for exiting nodes in the range [0,1]. Default: `0.75` */
  nodeExitScale?: NumericAccessor<N> | undefined;
  /** Set selected node by unique id. Default: `undefined` */
  selectedNodeId?: number | string;

  /** Panels configuration. An array of GraphPanelConfigInterface objects. Default: `[]` */
  panels?: GraphPanelConfigInterface[];
}

export class GraphConfig<N extends GraphInputNode, L extends GraphInputLink> extends ComponentConfig implements GraphConfigInterface<N, L> {
  duration = 1000
  zoomScaleExtent: [number, number] = [0.35, 1.25]
  disableZoom = false
  disableDrag = false
  zoomThrottledUpdateNodeThreshold = 100
  onZoom = undefined
  layoutType = GraphLayoutType.Force
  layoutAutofit = true
  layoutAutofitTolerance = 8.0
  layoutNonConnectedAside = false

  layoutGroupOrder = []
  layoutGroupRows = 1
  layoutSubgroupMaxNodes = 6
  layoutGroupSpacing = undefined
  layoutSortConnectionsByGroup = undefined
  nodeGroup = (n: N): string => n['group']
  nodeSubGroup = (n: N): string => n['subgroup']

  forceLayoutSettings = {
    linkDistance: 60,
    linkStrength: 0.45,
    charge: -500,
    forceXStrength: 0.15,
    forceYStrength: 0.25,
  }

  dagreLayoutSettings = {
    rankdir: 'BT',
    ranker: 'longest-path',
  }

  flowAnimDuration = 20000
  flowCircleSize = 2
  linkWidth = 1
  linkStyle = GraphLinkStyle.Solid
  linkBandWidth = 0
  linkArrow = undefined
  linkStroke = undefined
  linkFlow = false
  linkLabel = undefined
  linkLabelShiftFromCenter = true
  linkNeighborSpacing = 8
  linkDisabled = false
  selectedLinkId = undefined
  scoreAnimDuration = 1500

  nodeSize = 30
  nodeBorderWidth = 3
  nodeShape = GraphNodeShape.Circle
  nodeStrokeSegmentValue = 0
  nodeIcon = (n: N): string => n['icon']
  nodeIconSize = undefined
  nodeLabel = (n: N): string => n['label']
  nodeSubLabel = ''
  nodeSideLabels = undefined
  nodeBottomIcon = undefined
  nodeDisabled = false
  nodeFill = (n: N): string => n['fill']
  nodeStrokeSegmentFill = undefined
  nodeStroke = (n: N): string => n['stroke']
  nodeEnterPosition = undefined
  nodeEnterScale = 0.75
  nodeExitPosition = undefined
  nodeExitScale = 0.75
  nodeSort = undefined

  selectedNodeId = undefined
  panels = undefined
}
