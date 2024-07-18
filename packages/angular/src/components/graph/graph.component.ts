// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Graph,
  GraphConfigInterface,
  ContainerCore,
  GraphInputNode,
  GraphInputLink,
  VisEventType,
  VisEventCallback,
  GraphLayoutType,
  StringAccessor,
  GraphForceLayoutSettings,
  GraphDagreLayoutSetting,
  GenericAccessor,
  GraphElkLayoutSettings,
  NumericAccessor,
  GraphLinkStyle,
  GraphLinkArrowStyle,
  ColorAccessor,
  BooleanAccessor,
  GraphCircleLabel,
  GraphNodeShape,
  TrimMode,
  GraphNode,
  GraphNodeSelectionHighlightMode,
  GraphPanelConfig,
  GraphLink,
} from '@unovis/ts'
import { Selection } from 'd3-selection'
import { D3DragEvent } from 'd3-drag'
import { D3ZoomEvent } from 'd3-zoom'
import { D3BrushEvent } from 'd3-brush'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-graph',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisGraphComponent }],
})
export class VisGraphComponent<N extends GraphInputNode, L extends GraphInputLink> implements GraphConfigInterface<N, L>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration?: number

  /** Events configuration. An object containing properties in the following format:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[eventType]: callbackFunction
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    click: (d) => console.log("Clicked Area", d)
   *  }
   * }
   * ``` */
  @Input() events?: {
    [selector: string]: {
      [eventType in VisEventType]?: VisEventCallback
    };
  }

  /** You can set every SVG and HTML visualization object to have a custom DOM attributes, which is useful
   * when you want to do unit or end-to-end testing. Attributes configuration object has the following structure:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[attributeName]: attribute constant value or accessor function
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    "test-value": d => d.value
   *  }
   * }
   * ``` */
  @Input() attributes?: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Zoom level constraints. Default: [0.35, 1.25] */
  @Input() zoomScaleExtent?: [number, number]

  /** Disable zooming. Default: `false` */
  @Input() disableZoom?: boolean

  /** Custom Zoom event filter to better control which actions should trigger zooming.
   * Learn more: https://d3js.org/d3-zoom#zoom_filter.
   * Default: `undefined` */
  @Input() zoomEventFilter?: (event: PointerEvent) => boolean

  /** Disable node dragging. Default: `false` */
  @Input() disableDrag?: boolean

  /** Disable brush for multiple node selection. Default: `false` */
  @Input() disableBrush?: boolean

  /** Interval to re-render the graph when zooming. Default: `100` */
  @Input() zoomThrottledUpdateNodeThreshold?: number

  /** Type of the graph layout. Default: `GraphLayoutType.Force` */
  @Input() layoutType?: GraphLayoutType | string

  /** Fit the graph to container on data or config updates, or on container resize. Default: `true` */
  @Input() layoutAutofit?: boolean

  /** Tolerance constant defining whether the graph should be fitted to container
   * (on data or config update, or container resize) after a zoom / pan interaction or not.
   * `0` — Stop fitting after any pan or zoom
   * `Number.POSITIVE_INFINITY` — Always fit
   * Default: `8.0` */
  @Input() layoutAutofitTolerance?: number

  /** Place non-connected nodes at the bottom of the graph. Default: `false` */
  @Input() layoutNonConnectedAside?: boolean

  /** Node group accessor function.
   * Only for `GraphLayoutType.Parallel`, `GraphLayoutType.ParallelHorizontal` and `GraphLayoutType.Concentric` layouts.
   * Default: `node => node.group` */
  @Input() layoutNodeGroup?: StringAccessor<N>

  /** Order of the layout groups.
   * Only for `GraphLayoutType.Parallel`, `GraphLayoutType.ParallelHorizontal` and `GraphLayoutType.Concentric` layouts.
   * Default: `[]` */
  @Input() layoutGroupOrder?: string[]

  /** Sets the number of nodes in a sub-group after which they'll continue on the next column (or row if `layoutType` is
   * `GraphLayoutType.ParallelHorizontal`).
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `6` */
  @Input() layoutParallelNodesPerColumn?: number

  /** Node sub-group accessor function.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `node => node.subgroup` */
  @Input() layoutParallelNodeSubGroup?: StringAccessor<N>

  /** Number of sub-groups per row (or column if `layoutType` is `GraphLayoutType.ParallelHorizontal`) in a group.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `1` */
  @Input() layoutParallelSubGroupsPerRow?: number

  /** Spacing between groups.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  @Input() layoutParallelGroupSpacing?: number

  /** Set a group by name to have priority in sorting the graph links.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  @Input() layoutParallelSortConnectionsByGroup?: string

  /** Force Layout settings, see the `d3-force` package for more details */
  @Input() forceLayoutSettings?: GraphForceLayoutSettings<N, L>

  /** Darge Layout settings, see the `dagrejs` package
   * for more details: https://github.com/dagrejs/dagre/wiki#configuring-the-layout */
  @Input() dagreLayoutSettings?: GraphDagreLayoutSetting

  /** ELK layout options, see the `elkjs` package for more details: https://github.com/kieler/elkjs.
   * If you want to specify custom layout option for each node group, you can provide an accessor function that
   * receives group name ('root' for the top-level configuration) as the first argument and returns an object containing
   * layout options. Default: `undefined` */
  @Input() layoutElkSettings?: GenericAccessor<GraphElkLayoutSettings, string> | undefined

  /** Array of accessor functions to define nested node groups for the ELK Layered layout.
   * E.g.: `[n => n.group, n => n.subGroup]`.
   * Default: `undefined` */
  @Input() layoutElkNodeGroups?: StringAccessor<N>[]

  /** Link width accessor function ot constant value. Default: `1` */
  @Input() linkWidth?: NumericAccessor<L>

  /** Link style accessor function or constant value. Default: `GraphLinkStyle.Solid` */
  @Input() linkStyle?: GenericAccessor<GraphLinkStyle, L>

  /** Link band width accessor function or constant value. Default: `0` */
  @Input() linkBandWidth?: NumericAccessor<L>

  /** Link arrow accessor function or constant value. Default: `undefined` */
  @Input() linkArrow?: GenericAccessor<GraphLinkArrowStyle | string | boolean, L> | undefined

  /** Link stroke color accessor function or constant value. Default: `undefined` */
  @Input() linkStroke?: ColorAccessor<L>

  /** Link disabled state accessor function or constant value. Default: `false` */
  @Input() linkDisabled?: BooleanAccessor<L>

  /** Link flow animation accessor function or constant value. Default: `false` */
  @Input() linkFlow?: BooleanAccessor<L>

  /** Animation duration of the flow (traffic) circles. Default: `20000` */
  @Input() linkFlowAnimDuration?: number

  /** Size of the moving particles that represent traffic flow. Default: `2` */
  @Input() linkFlowParticleSize?: number

  /** Link label accessor function or constant value. Default: `undefined` */
  @Input() linkLabel?: GenericAccessor<GraphCircleLabel, L> | undefined

  /** Shift label along the link center a little bit to avoid overlap with the link arrow. Default: `true` */
  @Input() linkLabelShiftFromCenter?: BooleanAccessor<L>

  /** Spacing between neighboring links. Default: `8` */
  @Input() linkNeighborSpacing?: number

  /** Curvature of the link. Recommended value range: [0:1.5].
   * `0` - straight line,
   * `1` - nice curvature,
   * `1.5` - very curve.
   * Default: `0` */
  @Input() linkCurvature?: NumericAccessor<L>

  /** Set selected link by its unique id. Default: `undefined` */
  @Input() selectedLinkId?: number | string

  /** Node size accessor function or constant value. Default: `30` */
  @Input() nodeSize?: NumericAccessor<N>

  /** Node stroke width accessor function or constant value. Default: `3` */
  @Input() nodeStrokeWidth?: NumericAccessor<N>

  /** Node shape accessor function or constant value. Default: `GraphNodeShape.Circle` */
  @Input() nodeShape?: GenericAccessor<GraphNodeShape | string, N>

  /** Node gauge outline accessor function or constant value in the range [0,100]. Default: `0` */
  @Input() nodeGaugeValue?: NumericAccessor<N>

  /** Node gauge outline fill color accessor function or constant value. Default: `undefined` */
  @Input() nodeGaugeFill?: ColorAccessor<N>

  /** Animation duration of the node gauge outline. Default: `1500` */
  @Input() nodeGaugeAnimDuration?: number

  /** Node central icon accessor function or constant value. Default: `node => node.icon` */
  @Input() nodeIcon?: StringAccessor<N>

  /** Node central icon size accessor function or constant value. Default: `undefined` */
  @Input() nodeIconSize?: NumericAccessor<N>

  /** Node label accessor function or constant value. Default: `node => node.label` */
  @Input() nodeLabel?: StringAccessor<N>

  /** Defines whether to trim the node labels or not. Default: `true` */
  @Input() nodeLabelTrim?: BooleanAccessor<N>

  /** Node label trimming mode. Default: `TrimMode.Middle` */
  @Input() nodeLabelTrimMode?: GenericAccessor<TrimMode | string, N>

  /** Node label maximum allowed text length above which the label will be trimmed. Default: `15` */
  @Input() nodeLabelTrimLength?: NumericAccessor<N>

  /** Node sub-label accessor function or constant value: Default: `''` */
  @Input() nodeSubLabel?: StringAccessor<N>

  /** Defines whether to trim the node sub-labels or not. Default: `true` */
  @Input() nodeSubLabelTrim?: BooleanAccessor<N>

  /** Node sub-label trimming mode. Default: `TrimMode.Middle` */
  @Input() nodeSubLabelTrimMode?: GenericAccessor<TrimMode | string, N>

  /** Node sub-label maximum allowed text length above which the label will be trimmed. Default: `15` */
  @Input() nodeSubLabelTrimLength?: NumericAccessor<N>

  /** Node circular side labels accessor function. The function should return an array of GraphCircleLabel objects. Default: `undefined` */
  @Input() nodeSideLabels?: GenericAccessor<GraphCircleLabel[], N>

  /** Node bottom icon accessor function. Default: `undefined` */
  @Input() nodeBottomIcon?: StringAccessor<N>

  /** Node disabled state accessor function or constant value. Default: `false` */
  @Input() nodeDisabled?: BooleanAccessor<N>

  /** Node fill color accessor function or constant value. Default: `node => node.fill` */
  @Input() nodeFill?: ColorAccessor<N>

  /** Node stroke color accessor function or constant value. Default: `node => node.stroke` */
  @Input() nodeStroke?: ColorAccessor<N>

  /** Sorting function to determine node placement. Default: `undefined` */
  @Input() nodeSort?: ((a: N, b: N) => number)

  /** Specify the initial position for entering nodes as [x, y]. Default: `undefined` */
  @Input() nodeEnterPosition?: GenericAccessor<[number, number], N> | undefined

  /** Specify the initial scale for entering nodes in the range [0,1]. Default: `0.75` */
  @Input() nodeEnterScale?: NumericAccessor<N> | undefined

  /** Specify the destination position for exiting nodes as [x, y]. Default: `undefined` */
  @Input() nodeExitPosition?: GenericAccessor<[number, number], N> | undefined

  /** Specify the destination scale for exiting nodes in the range [0,1]. Default: `0.75` */
  @Input() nodeExitScale?: NumericAccessor<N> | undefined

  /** Custom "enter" function for node rendering. Default: `undefined` */
  @Input() nodeEnterCustomRenderFunction?: (datum: GraphNode<N, L>, nodeGroupElementSelection: Selection<SVGGElement, GraphNode<N, L>, null, unknown>, config: GraphConfigInterface<N, L>, duration: number, zoomLevel: number) => void

  /** Custom "update" function for node rendering. Default: `undefined` */
  @Input() nodeUpdateCustomRenderFunction?: (datum: GraphNode<N, L>, nodeGroupElementSelection: Selection<SVGGElement, GraphNode<N, L>, null, unknown>, config: GraphConfigInterface<N, L>, duration: number, zoomLevel: number) => void

  /** Custom "exit" function for node rendering. Default: `undefined` */
  @Input() nodeExitCustomRenderFunction?: (datum: GraphNode<N, L>, nodeGroupElementSelection: Selection<SVGGElement, GraphNode<N, L>, null, unknown>, config: GraphConfigInterface<N, L>, duration: number, zoomLevel: number) => void

  /** Define the mode for highlighting selected nodes in the graph. Default: `GraphNodeSelectionHighlightMode.GreyoutNonConnected` */
  @Input() nodeSelectionHighlightMode?: GraphNodeSelectionHighlightMode

  /** Set selected node by unique id. Default: `undefined` */
  @Input() selectedNodeId?: number | string

  /** Set selected nodes by unique id. Default: `undefined` */
  @Input() selectedNodeIds?: number[] | string[]

  /** Panels configuration. An array of `GraphPanelConfig` objects. Default: `[]` */
  @Input() panels?: GraphPanelConfig[] | undefined

  /** Graph node drag start callback function. Default: `undefined` */
  @Input() onNodeDragStart?: (n: GraphNode<N, L>, event: D3DragEvent<SVGGElement, GraphNode<N, L>, unknown>) => void | undefined

  /** Graph node drag callback function. Default: `undefined` */
  @Input() onNodeDrag?: (n: GraphNode<N, L>, event: D3DragEvent<SVGGElement, GraphNode<N, L>, unknown>) => void | undefined

  /** Graph node drag end callback function. Default: `undefined` */
  @Input() onNodeDragEnd?: (n: GraphNode<N, L>, event: D3DragEvent<SVGGElement, GraphNode<N, L>, unknown>) => void | undefined

  /** Zoom event callback. Default: `undefined` */
  @Input() onZoom?: (zoomScale: number, zoomScaleExtent: [number, number], event: D3ZoomEvent<SVGGElement, unknown> | undefined) => void

  /** Callback function to be called when the graph layout is calculated. Default: `undefined` */
  @Input() onLayoutCalculated?: (n: GraphNode<N, L>[], links: GraphLink<N, L>[]) => void

  /** Graph node selection brush callback function. Default: `undefined` */
  @Input() onNodeSelectionBrush?: (selectedNodes: GraphNode<N, L>[], event: D3BrushEvent<SVGGElement> | undefined) => void

  /** Graph multiple node drag callback function. Default: `undefined` */
  @Input() onNodeSelectionDrag?: (selectedNodes: GraphNode<N, L>[], event: D3DragEvent<SVGGElement, GraphNode<N, L>, unknown>) => void

  /** Callback function to be called when the graph rendering is complete. Default: `undefined` */
  @Input() onRenderComplete?: (g: Selection<SVGGElement, unknown, null, undefined>, nodes: GraphNode<N, L>[], links: GraphLink<N, L>[], config: GraphConfigInterface<N, L>, duration: number, zoomLevel: number, width: number, height: number) => void
  @Input() data: { nodes: N[]; links?: L[] }

  component: Graph<N, L> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Graph<N, L>(this.getConfig())

    if (this.data) {
      this.component.setData(this.data)
      this.componentContainer?.render()
    }
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): GraphConfigInterface<N, L> {
    const { duration, events, attributes, zoomScaleExtent, disableZoom, zoomEventFilter, disableDrag, disableBrush, zoomThrottledUpdateNodeThreshold, layoutType, layoutAutofit, layoutAutofitTolerance, layoutNonConnectedAside, layoutNodeGroup, layoutGroupOrder, layoutParallelNodesPerColumn, layoutParallelNodeSubGroup, layoutParallelSubGroupsPerRow, layoutParallelGroupSpacing, layoutParallelSortConnectionsByGroup, forceLayoutSettings, dagreLayoutSettings, layoutElkSettings, layoutElkNodeGroups, linkWidth, linkStyle, linkBandWidth, linkArrow, linkStroke, linkDisabled, linkFlow, linkFlowAnimDuration, linkFlowParticleSize, linkLabel, linkLabelShiftFromCenter, linkNeighborSpacing, linkCurvature, selectedLinkId, nodeSize, nodeStrokeWidth, nodeShape, nodeGaugeValue, nodeGaugeFill, nodeGaugeAnimDuration, nodeIcon, nodeIconSize, nodeLabel, nodeLabelTrim, nodeLabelTrimMode, nodeLabelTrimLength, nodeSubLabel, nodeSubLabelTrim, nodeSubLabelTrimMode, nodeSubLabelTrimLength, nodeSideLabels, nodeBottomIcon, nodeDisabled, nodeFill, nodeStroke, nodeSort, nodeEnterPosition, nodeEnterScale, nodeExitPosition, nodeExitScale, nodeEnterCustomRenderFunction, nodeUpdateCustomRenderFunction, nodeExitCustomRenderFunction, nodeSelectionHighlightMode, selectedNodeId, selectedNodeIds, panels, onNodeDragStart, onNodeDrag, onNodeDragEnd, onZoom, onLayoutCalculated, onNodeSelectionBrush, onNodeSelectionDrag, onRenderComplete } = this
    const config = { duration, events, attributes, zoomScaleExtent, disableZoom, zoomEventFilter, disableDrag, disableBrush, zoomThrottledUpdateNodeThreshold, layoutType, layoutAutofit, layoutAutofitTolerance, layoutNonConnectedAside, layoutNodeGroup, layoutGroupOrder, layoutParallelNodesPerColumn, layoutParallelNodeSubGroup, layoutParallelSubGroupsPerRow, layoutParallelGroupSpacing, layoutParallelSortConnectionsByGroup, forceLayoutSettings, dagreLayoutSettings, layoutElkSettings, layoutElkNodeGroups, linkWidth, linkStyle, linkBandWidth, linkArrow, linkStroke, linkDisabled, linkFlow, linkFlowAnimDuration, linkFlowParticleSize, linkLabel, linkLabelShiftFromCenter, linkNeighborSpacing, linkCurvature, selectedLinkId, nodeSize, nodeStrokeWidth, nodeShape, nodeGaugeValue, nodeGaugeFill, nodeGaugeAnimDuration, nodeIcon, nodeIconSize, nodeLabel, nodeLabelTrim, nodeLabelTrimMode, nodeLabelTrimLength, nodeSubLabel, nodeSubLabelTrim, nodeSubLabelTrimMode, nodeSubLabelTrimLength, nodeSideLabels, nodeBottomIcon, nodeDisabled, nodeFill, nodeStroke, nodeSort, nodeEnterPosition, nodeEnterScale, nodeExitPosition, nodeExitScale, nodeEnterCustomRenderFunction, nodeUpdateCustomRenderFunction, nodeExitCustomRenderFunction, nodeSelectionHighlightMode, selectedNodeId, selectedNodeIds, panels, onNodeDragStart, onNodeDrag, onNodeDragEnd, onZoom, onLayoutCalculated, onNodeSelectionBrush, onNodeSelectionDrag, onRenderComplete }
    const keys = Object.keys(config) as (keyof GraphConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
