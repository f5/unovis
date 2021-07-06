// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NodeDatumCore, LinkDatumCore, LayoutType, CircleLabel, LinkStyle, LinkArrow, PanelConfigInterface } from 'types/graph'
import { NumericAccessor, StringAccessor, BooleanAccessor, ColorAccessor } from 'types/misc'
import { SHAPE } from 'types/shape'

export interface GraphConfigInterface<N extends NodeDatumCore, L extends LinkDatumCore> extends ComponentConfigInterface {
  // Zoom and drag
  /** Zoom level constraints, default: [0.35, 1.25] */
  zoomScaleExtent?: [number, number];
  /** Disable zooming */
  disableZoom?: boolean;
  /** Disable node dragging */
  disableDrag?: boolean;
  /** Interval to re-render the graph when zooming */
  zoomThrottledUpdateNodeThreshold?: number;
  /** On zoom callback */
  onZoom?: (zoomScale: number, zoomScaleExtent: number) => any;

  // Layout
  /** Type of graph layout */
  layoutType?: LayoutType | string;
  /** Refit the layout on data or configuration update */
  layoutAutofit?: boolean;
  /** Place non-connected nodes to the bottom of the graph */
  layoutNonConnectedAside?: boolean;

  // Settings for Parallel and Concentric Layouts
  /** Order of the layout groups, for parallel and concentric layouts */
  layoutGroupOrder?: any[];
  /** Number of rows per group. Default: 1 */
  layoutGroupRows?: number;
  /** */
  layoutSubgroupMaxNodes?: number;
  /** */
  layoutSortConnectionsByGroup?: string;
  /** Node Group accessor function or value */
  nodeGroup?: StringAccessor<N>;
  /** Node Sub Group accessor function or value */
  nodeSubGroup?: StringAccessor<N>;

  /** Force Layout settings, see d3.force */
  forceLayoutSettings?: {
    /** Preferred Link Distance, default 60 */
    linkDistance?: number;
    /** Link Strength [0:1], default 0.45 */
    linkStrength?: number;
    /** Charge Force (<0 repulsion, >0 attraction), default -350 */
    charge?: number;
    /** X-centring force, default 0.15 */
    forceXStrength?: number;
    /** Y-centring force, default 0.25 */
    forceYStrength?: number;
  };

  /** Darge Layout settings, see dagrejs */
  dagreLayoutSettings?: {
    rankdir: string;
    ranker: string;
  };

  // Links
  /** Animation duration of the flow (traffic) circles */
  flowAnimDuration?: number;
  /** Flow circle size */
  flowCircleSize?: number;
  /** Link width accessor function or value */
  linkWidth?: NumericAccessor<L>;
  /** Link style accessor function or value: 'solid' or 'dashed'. Default: 'solid'  */
  linkStyle?: StringAccessor<L>;
  /** Link band width accessor function or value. Default: 0 */
  linkBandWidth?: NumericAccessor<L>;
  /** Link arrow accessor function or undefined */
  linkArrow?: ((d: L, i?: number, ...any) => LinkArrow) | undefined;
  /** Link stroke color accessor function or value */
  linkStroke?: ColorAccessor<L>;
  /** Link flow display accessor or boolean value */
  linkFlow?: BooleanAccessor<L>;
  /** Link side Label accessor function or undefined */
  linkLabel?: ((d: L, i?: number, ...any) => CircleLabel | undefined) | undefined;
  /** Shift or not link side Label from center */
  linkLabelShiftFromCenter?: BooleanAccessor<L>;
  /** Set selected link by id */
  selectedLinkId?: number | string;

  // Nodes
  /** Animation duration of the Node Score circle */
  scoreAnimDuration?: number;
  /** Node size accessor function or value */
  nodeSize?: NumericAccessor<N>;
  /** Node border width accessor function or value */
  nodeBorderWidth?: NumericAccessor<N>;
  /** Node shape accessor function or value */
  nodeShape?: StringAccessor<N>;
  /** Node Score accessor function or value, in the range [0,100] */
  nodeStrokeSegmentValue?: NumericAccessor<N>;
  /** Node Icon accessor function or value */
  nodeIcon?: StringAccessor<N>;
  /** Node Icon size accessor function or value */
  nodeIconSize?: NumericAccessor<N>;
  /** Node Label accessor function or value */
  nodeLabel?: StringAccessor<N>;
  /** Node Sublabel accessor function or value */
  nodeSubLabel?: StringAccessor<N>;
  /** Node Side Label accessor function or undefined */
  nodeSideLabels?: ((d: N, i?: number, ...any) => CircleLabel[] | undefined) | undefined;
  /** Node Bottom Icon accessor function. Default: `undefined` */
  nodeBottomIcon?: StringAccessor<N>;
  /** Node disabled accessor function or value */
  nodeDisabled?: BooleanAccessor<N>;
  /** Node fill color accessor function or value */
  nodeFill?: ColorAccessor<N>;
  /** Node stroke segment fill color accessor function or value */
  nodeStrokeSegmentFill?: ColorAccessor<N>;
  /** Node stroke color accessor function or value */
  nodeStroke?: ColorAccessor<N>;
  /** Node Sorting Function. Default: `undefined` */
  nodeSort?: ((a: N, b: N) => number);
  /** Set selected node by Id  */
  selectedNodeId?: number | string;

  // Panels
  panels?: PanelConfigInterface[];
}

export class GraphConfig<N extends NodeDatumCore, L extends LinkDatumCore> extends ComponentConfig implements GraphConfigInterface<N, L> {
  duration = 1000
  zoomScaleExtent: [number, number] = [0.35, 1.25]
  disableZoom = false
  disableDrag = false
  zoomThrottledUpdateNodeThreshold = 100
  onZoom = undefined
  layoutType = LayoutType.FORCE
  layoutAutofit = true
  layoutNonConnectedAside: true

  layoutGroupOrder = []
  layoutGroupRows = 1
  layoutSubgroupMaxNodes = 6
  layoutSortConnectionsByGroup = ''
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
  linkStyle = LinkStyle.SOLID
  linkBandWidth = 0
  linkArrow = undefined
  linkStroke = undefined
  linkFlow = false
  linkLabel = undefined
  linkLabelShiftFromCenter = true
  selectedLinkId = undefined
  scoreAnimDuration = 1500
  nodeSize = 30
  nodeBorderWidth = 3
  nodeShape = SHAPE.CIRCLE
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
  nodeSort = undefined

  selectedNodeId = undefined
  panels = undefined
}
