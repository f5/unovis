// Config
import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Types
import { TrimMode } from 'types/text'
import { GraphInputLink, GraphInputNode } from 'types/graph'
import { BooleanAccessor, ColorAccessor, NumericAccessor, StringAccessor, GenericAccessor } from 'types/accessor'

// Local Types
import {
  GraphLayoutType,
  GraphCircleLabel,
  GraphLinkStyle,
  GraphLinkArrowStyle,
  GraphPanelConfig,
  GraphForceLayoutSettings,
  GraphElkLayoutSettings,
  GraphNodeShape,
  GraphDagreLayoutSetting,
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
  onZoom?: (zoomScale: number, zoomScaleExtent: [number, number]) => void;

  // Layout general settings
  /** Type of the graph layout. Default: `GraphLayoutType.Force` */
  layoutType?: GraphLayoutType | string;
  /** Fit the graph to container on data or config updates, or on container resize. Default: `true` */
  layoutAutofit?: boolean;
  /** Tolerance constant defining whether the graph should be fitted to container
   * (on data or config update, or container resize) after a zoom / pan interaction or not.
   * `0` — Stop fitting after any pan or zoom
   * `Number.POSITIVE_INFINITY` — Always fit
   * Default: `8.0` */
  layoutAutofitTolerance?: number;
  /** Place non-connected nodes at the bottom of the graph. Default: `false` */
  layoutNonConnectedAside?: boolean;

  // Settings for Parallel and Concentric layouts
  /** Node group accessor function.
   * Only for `GraphLayoutType.Parallel`, `GraphLayoutType.ParallelHorizontal` and `GraphLayoutType.Concentric` layouts.
   * Default: `node => node.group` */
  layoutNodeGroup?: StringAccessor<N>;
  /** Order of the layout groups.
   * Only for `GraphLayoutType.Parallel`, `GraphLayoutType.ParallelHorizontal` and `GraphLayoutType.Concentric` layouts.
   * Default: `[]` */
  layoutGroupOrder?: string[];

  // Setting for Parallel layouts only
  /** Sets the number of nodes in a sub-group after which they'll continue on the next column (or row if `layoutType` is
   * `GraphLayoutType.ParallelHorizontal`).
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `6` */
  layoutParallelNodesPerColumn?: number;
  /** Node sub-group accessor function.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `node => node.subgroup` */
  layoutParallelNodeSubGroup?: StringAccessor<N>;
  /** Number of sub-groups per row (or column if `layoutType` is `GraphLayoutType.ParallelHorizontal`) in a group.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `1` */
  layoutParallelSubGroupsPerRow?: number;
  /** Spacing between groups.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  layoutParallelGroupSpacing?: number;
  /** Set a group by name to have priority in sorting the graph links.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  layoutParallelSortConnectionsByGroup?: string;

  // Force layout
  /** Force Layout settings, see the `d3-force` package for more details */
  forceLayoutSettings?: GraphForceLayoutSettings;

  // Dagre layout
  /** Darge Layout settings, see the `dagrejs` package
   * for more details: https://github.com/dagrejs/dagre/wiki#configuring-the-layout
  */
  dagreLayoutSettings?: GraphDagreLayoutSetting;

  // ELK layout
  /** ELK layout options, see the `elkjs` package for more details: https://github.com/kieler/elkjs.
   * If you want to specify custom layout option for each node group, you can provide an accessor function that
   * receives group name ('root' for the top-level configuration) as the first argument and returns an object containing
   * layout options. Default: `undefined`
  */
  layoutElkSettings?: GenericAccessor<GraphElkLayoutSettings, string> | undefined;
  /** Array of accessor functions to define nested node groups for the ELK Layered layout.
   * E.g.: `[n => n.group, n => n.subGroup]`.
   * Default: `undefined` */
  layoutElkNodeGroups?: StringAccessor<N>[];

  // Links
  /** Link width accessor function ot constant value. Default: `1` */
  linkWidth?: NumericAccessor<L>;
  /** Link style accessor function or constant value. Default: `GraphLinkStyle.Solid`  */
  linkStyle?: GenericAccessor<GraphLinkStyle, L>;
  /** Link band width accessor function or constant value. Default: `0` */
  linkBandWidth?: NumericAccessor<L>;
  /** Link arrow accessor function or constant value. Default: `undefined` */
  linkArrow?: GenericAccessor<GraphLinkArrowStyle | string | boolean, L> | undefined;
  /** Link stroke color accessor function or constant value. Default: `undefined` */
  linkStroke?: ColorAccessor<L>;
  /** Link disabled state accessor function or constant value. Default: `false` */
  linkDisabled?: BooleanAccessor<L>;
  /** Link flow animation accessor function or constant value. Default: `false` */
  linkFlow?: BooleanAccessor<L>;
  /** Animation duration of the flow (traffic) circles. Default: `20000` */
  linkFlowAnimDuration?: number;
  /** Size of the moving particles that represent traffic flow. Default: `2` */
  linkFlowParticleSize?: number;
  /** Link label accessor function or constant value. Default: `undefined` */
  linkLabel?: GenericAccessor<GraphCircleLabel, L> | undefined;
  /** Shift label along the link center a little bit to avoid overlap with the link arrow. Default: `true` */
  linkLabelShiftFromCenter?: BooleanAccessor<L>;
  /** Spacing between neighboring links. Default: `8` */
  linkNeighborSpacing?: number;
  /** Curvature of the link. Recommended value range: [0:1.5].
   * `0` - straight line,
   * `1` - nice curvature,
   * `1.5` - very curve.
   * Default: `0` */
  linkCurvature?: NumericAccessor<L>;
  /** Set selected link by its unique id. Default: `undefined` */
  selectedLinkId?: number | string;

  // Nodes
  /** Node size accessor function or constant value. Default: `30` */
  nodeSize?: NumericAccessor<N>;
  /** Node stroke width accessor function or constant value. Default: `3` */
  nodeStrokeWidth?: NumericAccessor<N>;
  /** Node shape accessor function or constant value. Default: `GraphNodeShape.Circle` */
  nodeShape?: GenericAccessor<GraphNodeShape | string, N>;
  /** Node gauge outline accessor function or constant value in the range [0,100]. Default: `0` */
  nodeGaugeValue?: NumericAccessor<N>;
  /** Node gauge outline fill color accessor function or constant value. Default: `undefined` */
  nodeGaugeFill?: ColorAccessor<N>;
  /** Animation duration of the node gauge outline. Default: `1500` */
  nodeGaugeAnimDuration?: number;
  /** Node central icon accessor function or constant value. Default: `node => node.icon` */
  nodeIcon?: StringAccessor<N>;
  /** Node central icon size accessor function or constant value. Default: `undefined` */
  nodeIconSize?: NumericAccessor<N>;
  /** Node label accessor function or constant value. Default: `node => node.label` */
  nodeLabel?: StringAccessor<N>;
  /** Defines whether to trim the node labels or not. Default: `true` */
  nodeLabelTrim?: BooleanAccessor<N>;
  /** Node label trimming mode. Default: `TrimMode.Middle` */
  nodeLabelTrimMode?: GenericAccessor<TrimMode | string, N>;
  /** Node label maximum allowed text length above which the label will be trimmed. Default: `15` */
  nodeLabelTrimLength?: NumericAccessor<N>;
  /** Node sub-label accessor function or constant value: Default: `''` */
  nodeSubLabel?: StringAccessor<N>;
  /** Defines whether to trim the node sub-labels or not. Default: `true` */
  nodeSubLabelTrim?: BooleanAccessor<N>;
  /** Node sub-label trimming mode. Default: `TrimMode.Middle` */
  nodeSubLabelTrimMode?: GenericAccessor<TrimMode | string, N>;
  /** Node sub-label maximum allowed text length above which the label will be trimmed. Default: `15` */
  nodeSubLabelTrimLength?: NumericAccessor<N>;
  /** Node circular side labels accessor function. The function should return an array of GraphCircleLabel objects. Default: `undefined` */
  nodeSideLabels?: GenericAccessor<GraphCircleLabel[], N>;
  /** Node bottom icon accessor function. Default: `undefined` */
  nodeBottomIcon?: StringAccessor<N>;
  /** Node disabled state accessor function or constant value. Default: `false` */
  nodeDisabled?: BooleanAccessor<N>;
  /** Node fill color accessor function or constant value. Default: `node => node.fill` */
  nodeFill?: ColorAccessor<N>;
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

  /** Panels configuration. An array of `GraphPanelConfig` objects. Default: `[]` */
  panels?: GraphPanelConfig[] | undefined;
}

export const GraphDefaultConfig: GraphConfigInterface<GraphInputNode, GraphInputLink> = {
  ...ComponentDefaultConfig,
  duration: 1000,
  zoomScaleExtent: [0.35, 1.25],
  disableZoom: false,
  disableDrag: false,
  zoomThrottledUpdateNodeThreshold: 100,
  onZoom: undefined,
  layoutType: GraphLayoutType.Force,
  layoutAutofit: true,
  layoutAutofitTolerance: 8.0,
  layoutNonConnectedAside: false,

  layoutGroupOrder: [],
  layoutParallelSubGroupsPerRow: 1,
  layoutParallelNodesPerColumn: 6,
  layoutParallelGroupSpacing: undefined,
  layoutParallelSortConnectionsByGroup: undefined,
  layoutNodeGroup: (n: GraphInputNode): string => (n as { group: string }).group,
  layoutParallelNodeSubGroup: (n: GraphInputNode): string => (n as { subgroup: string }).subgroup,

  forceLayoutSettings: {
    linkDistance: 60,
    linkStrength: 0.45,
    charge: -500,
    forceXStrength: 0.15,
    forceYStrength: 0.25,
  },

  dagreLayoutSettings: {
    rankdir: 'BT',
    ranker: 'longest-path',
  },

  layoutElkSettings: undefined,
  layoutElkNodeGroups: undefined,

  linkFlowAnimDuration: 20000,
  linkFlowParticleSize: 2,
  linkWidth: 1,
  linkStyle: GraphLinkStyle.Solid,
  linkBandWidth: 0,
  linkArrow: undefined,
  linkStroke: undefined,
  linkFlow: false,
  linkLabel: undefined,
  linkLabelShiftFromCenter: true,
  linkNeighborSpacing: 8,
  linkDisabled: false,
  linkCurvature: 0,
  selectedLinkId: undefined,
  nodeGaugeAnimDuration: 1500,

  nodeSize: 30,
  nodeStrokeWidth: 3,
  nodeShape: GraphNodeShape.Circle,
  nodeGaugeValue: 0,
  nodeIcon: (n: GraphInputNode): string => (n as { icon: string }).icon,
  nodeIconSize: undefined,
  nodeLabel: (n: GraphInputNode): string => (n as { label: string }).label,
  nodeLabelTrim: true,
  nodeLabelTrimLength: 15,
  nodeLabelTrimMode: TrimMode.Middle,
  nodeSubLabel: '',
  nodeSubLabelTrim: true,
  nodeSubLabelTrimLength: 15,
  nodeSubLabelTrimMode: TrimMode.Middle,
  nodeSideLabels: undefined,
  nodeBottomIcon: undefined,
  nodeDisabled: false,
  nodeFill: (n: GraphInputNode): string => (n as { fill: string }).fill,
  nodeGaugeFill: undefined,
  nodeStroke: (n: GraphInputNode): string => (n as { stroke: string }).stroke,
  nodeEnterPosition: undefined,
  nodeEnterScale: 0.75,
  nodeExitPosition: undefined,
  nodeExitScale: 0.75,
  nodeSort: undefined,

  selectedNodeId: undefined,
  panels: undefined,
}
