// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NodeDatumCore, LinkDatumCore, LayoutType, SideLabel, LinkStyle, LinkArrow, PanelConfigInterface } from 'types/graph'
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

  // Layout
  /** Type of graph layout */
  layoutType?: LayoutType | string;
  /** Refit the layout on data or configuration update */
  layoutAutofit?: boolean;
  /** Place non-connected nodes to the bottom of the graph */
  layoutNonConnectedAside?: boolean;
  /** Order of the layput groups, for paralllel and concentric layouts */
  layoutGroupOrder?: any[];
  /** */
  layoutSubgroupMaxNodes?: number;
  /** */
  layoutSortConnectionsByGroup?: string;

  /** Force Layout settings, see d3.force */
  forceLayoutSettings?: {
    linkDistance?: number;
    linkStrength?: number;
    charge?: number;
    forceXStrength?: number;
    forceYStrength?: number;
  };

  /** Darge Layout settings, see dagrejs */
  dagreSettings?: { rankdir: string; ranker: string };

  // Links
  /** Animation duration of the flow (traffic) circles */
  flowAnimDuration?: number;
  /** Flow circle size */
  flowCircleSize?: number;
  /** Link width accessor function or value */
  linkWidth?: NumericAccessor<L>;
  /** Link style accessor function or value */
  linkStyle?: StringAccessor<L>;
  /** Link band width accessor function or value */
  linkBandWidth?: NumericAccessor<L>;
  /** Link arrow accessor function or undefined */
  linkArrow?: ((d: L, i?: number, ...any) => LinkArrow) | undefined;
  /** Link stroke color accessor function or value */
  linkStroke?: ColorAccessor<L>;
  /** Link flow display accessor or boolean value */
  linkFlow?: BooleanAccessor<L>;
  /** Link side Label accessor function or undefined */
  linkLabel?: ((d: L, i?: number, ...any) => SideLabel) | undefined;
  /** Shift or not link side Label from center */
  linkLabelShiftFromCenter?: BooleanAccessor<L>;
  /** Set selected link by Id */
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
  /** Node Group accessor function or value */
  nodeGroup?: StringAccessor<N>;
  /** Node Side Label accessor function or undefined */
  nodeSideLabels?: ((d: N, i?: number, ...any) => SideLabel) | undefined;
  /** Node disabled accessor function or value */
  nodeDisabled?: BooleanAccessor<N>;
  /** Node fill color accessor function or value */
  nodeFill?: ColorAccessor<N>;
  /** Node stroke segment fill color accessor function or value */
  nodeStrokeSegmentFill?: ColorAccessor<N>;
  /** Node stroke color accessor function or value */
  nodeStroke?: ColorAccessor<N>;
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
  layoutType = LayoutType.FORCE
  layoutAutofit = true
  layoutNonConnectedAside = true
  layoutGroupOrder = []
  layoutSubgroupMaxNodes = 6
  layoutSortConnectionsByGroup = ''
  forceLayoutSettings = {
    linkDistance: 75,
    linkStrength: 0.15,
    charge: -350,
    forceXStrength: 0.07,
    forceYStrength: 0.1,
  }

  dagreSettings = { rankdir: 'BT', ranker: 'longest-path' }
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
  nodeIcon = ''
  nodeIconSize = undefined
  nodeLabel = ''
  nodeSubLabel = ''
  nodeGroup = ''
  nodeSideLabels = undefined
  nodeDisabled = false
  nodeFill = undefined
  nodeStrokeSegmentFill = undefined
  nodeStroke = undefined
  selectedNodeId = undefined
  panels = undefined
}
