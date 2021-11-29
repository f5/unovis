/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Graph,
  GraphConfigInterface,
  GraphInputNode,
  GraphInputLink,
  VisEventType,
  VisEventCallback,
  GraphLayoutType,
  StringAccessor,
  NumericAccessor,
  GenericAccessor,
  GraphLinkStyle,
  GraphLinkArrow,
  ColorAccessor,
  BooleanAccessor,
  GraphCircleLabel,
  Shape,
  GraphPanelConfigInterface,
} from '@volterra/vis'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-graph',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisGraphComponent }],
})
export class VisGraphComponent<N extends GraphInputNode, L extends GraphInputLink> implements GraphConfigInterface<N, L>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration: number

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
  @Input() events: {
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
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Zoom level constraints. Default: [0.35, 1.25] */
  @Input() zoomScaleExtent: [number, number]

  /** Disable zooming. Default: `false` */
  @Input() disableZoom: boolean

  /** Disable node dragging. Default: `false` */
  @Input() disableDrag: boolean

  /** Interval to re-render the graph when zooming. Default: `100` */
  @Input() zoomThrottledUpdateNodeThreshold: number

  /** Zoom event callback. Default: `undefined` */
  @Input() onZoom: (zoomScale: number, zoomScaleExtent: number) => void

  /** Type of the graph layout. Default: `GraphLayoutType.Force` */
  @Input() layoutType: GraphLayoutType | string

  /** Refit the layout on data or config updates. Default: `true` */
  @Input() layoutAutofit: boolean

  /** Place non-connected nodes to the bottom of the graph. Default: `false` */
  @Input() layoutNonConnectedAside: boolean

  /** Order of the layout groups.
   * Only for `GraphLayoutType.Parallel`, `GraphLayoutType.ParallelHorizontal` and `GraphLayoutType.Concentric` layouts.
   * Default: `[]` */
  @Input() layoutGroupOrder: string[]

  /** Number of rows per group.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `1` */
  @Input() layoutGroupRows: number

  /** Set the number of nodes in a sub-group after which they'll continue from the next line or column.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `6` */
  @Input() layoutSubgroupMaxNodes: number

  /** Set the spacing between the groups.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  @Input() layoutGroupSpacing: number

  /** Set a group by name to have priority in sorting the graph links.
   * Only for `GraphLayoutType.Parallel` and `GraphLayoutType.ParallelHorizontal` layouts.
   * Default: `undefined` */
  @Input() layoutSortConnectionsByGroup: string

  /** Node group accessor function. Default: `node => node.group` */
  @Input() nodeGroup: StringAccessor<N>

  /** Node sub-group accessor function. Default: `node => node.subgroup` */
  @Input() nodeSubGroup: StringAccessor<N>

  /** Force Layout settings, see the `d3-force` package for more details */
  @Input() forceLayoutSettings: {
    linkDistance?: number;
    linkStrength?: number;
    charge?: number;
    forceXStrength?: number;
    forceYStrength?: number;
  }

  /** Darge Layout settings, see the `dagrejs` package fore more details */
  @Input() dagreLayoutSettings: {
    rankdir: string;
    ranker: string;
    [key: string]: any;
  }

  /** Animation duration of the flow (traffic) circles. Default: `20000` */
  @Input() flowAnimDuration: number

  /** Size of the moving circles that represent traffic flow. Default: `2` */
  @Input() flowCircleSize: number

  /** Link width accessor function ot constant value. Default: `1` */
  @Input() linkWidth: NumericAccessor<L>

  /** Link style accessor function or constant value. Default: `GraphLinkStyle.Solid` */
  @Input() linkStyle: GenericAccessor<GraphLinkStyle, L>

  /** Link band width accessor function or constant value. Default: `0` */
  @Input() linkBandWidth: NumericAccessor<L>

  /** Link arrow accessor function or constant value. Default: `undefined` */
  @Input() linkArrow: GenericAccessor<GraphLinkArrow, L> | undefined

  /** Link stroke color accessor function or constant value. Default: `undefined` */
  @Input() linkStroke: ColorAccessor<L>

  /** Link flow animation accessor function or constant value. Default: `false` */
  @Input() linkFlow: BooleanAccessor<L>

  /** Link  abel accessor function or constant value. Default: `undefined` */
  @Input() linkLabel: GenericAccessor<GraphCircleLabel, L> | undefined

  /** Shift label along the link center a little bit to avoid overlap with the link arrow. Default: `true` */
  @Input() linkLabelShiftFromCenter: BooleanAccessor<L>

  /** Set selected link by its unique id. Default: `undefined` */
  @Input() selectedLinkId: number | string

  /** Animation duration of the node score outline. Default: `1500` */
  @Input() scoreAnimDuration: number

  /** Node size accessor function or constant value. Default: `30` */
  @Input() nodeSize: NumericAccessor<N>

  /** Node border width accessor function or constant value. Default: `3` */
  @Input() nodeBorderWidth: NumericAccessor<N>

  /** Node shape accessor function or constant value. Default: `Shape.Circle` */
  @Input() nodeShape: GenericAccessor<Shape | string, N>

  /** Node score outline accessor function or constant value in the range [0,100]. Default: `0` */
  @Input() nodeStrokeSegmentValue: NumericAccessor<N>

  /** Node central icon accessor function or constant value. Default: `node => node.icon` */
  @Input() nodeIcon: StringAccessor<N>

  /** Node central icon size accessor function or constant value. Default: `undefined` */
  @Input() nodeIconSize: NumericAccessor<N>

  /** Node label accessor function or constant value. Default: `node => node.label` */
  @Input() nodeLabel: StringAccessor<N>

  /** Node sub-label accessor function or constant value: Default: `''` */
  @Input() nodeSubLabel: StringAccessor<N>

  /** Node circular side labels accessor function. The function should return an array of GraphCircleLabel objects. Default: `undefined` */
  @Input() nodeSideLabels: GenericAccessor<GraphCircleLabel[], N>

  /** Node bottom icon accessor function. Default: `undefined` */
  @Input() nodeBottomIcon: StringAccessor<N>

  /** Node disabled state accessor function or constant value. Default: `false` */
  @Input() nodeDisabled: BooleanAccessor<N>

  /** Node fill color accessor function or constant value. Default: `node => node.fill` */
  @Input() nodeFill: ColorAccessor<N>

  /** Node score outline fill color accessor function or constant value. Default: `undefined` */
  @Input() nodeStrokeSegmentFill: ColorAccessor<N>

  /** Node stroke color accessor function or constant value. Default: `node => node.stroke` */
  @Input() nodeStroke: ColorAccessor<N>

  /** Sorting function to determine node placement. Default: `undefined` */
  @Input() nodeSort: ((a: N, b: N) => number)

  /** Set selected node by unique id. Default: `undefined` */
  @Input() selectedNodeId: number | string

  /** Panels configuration. An array of GraphPanelConfigInterface objects. Default: `[]` */
  @Input() panels: GraphPanelConfigInterface[]
  @Input() data: any

  component: Graph<N, L> | undefined

  ngAfterViewInit (): void {
    this.component = new Graph<N, L>(this.getConfig())
    if (this.data) this.component.setData(this.data)
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
    this.component?.render()
  }

  private getConfig (): GraphConfigInterface<N, L> {
    const { duration, events, attributes, zoomScaleExtent, disableZoom, disableDrag, zoomThrottledUpdateNodeThreshold, onZoom, layoutType, layoutAutofit, layoutNonConnectedAside, layoutGroupOrder, layoutGroupRows, layoutSubgroupMaxNodes, layoutGroupSpacing, layoutSortConnectionsByGroup, nodeGroup, nodeSubGroup, forceLayoutSettings, dagreLayoutSettings, flowAnimDuration, flowCircleSize, linkWidth, linkStyle, linkBandWidth, linkArrow, linkStroke, linkFlow, linkLabel, linkLabelShiftFromCenter, selectedLinkId, scoreAnimDuration, nodeSize, nodeBorderWidth, nodeShape, nodeStrokeSegmentValue, nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeBottomIcon, nodeDisabled, nodeFill, nodeStrokeSegmentFill, nodeStroke, nodeSort, selectedNodeId, panels } = this
    const config = { duration, events, attributes, zoomScaleExtent, disableZoom, disableDrag, zoomThrottledUpdateNodeThreshold, onZoom, layoutType, layoutAutofit, layoutNonConnectedAside, layoutGroupOrder, layoutGroupRows, layoutSubgroupMaxNodes, layoutGroupSpacing, layoutSortConnectionsByGroup, nodeGroup, nodeSubGroup, forceLayoutSettings, dagreLayoutSettings, flowAnimDuration, flowCircleSize, linkWidth, linkStyle, linkBandWidth, linkArrow, linkStroke, linkFlow, linkLabel, linkLabelShiftFromCenter, selectedLinkId, scoreAnimDuration, nodeSize, nodeBorderWidth, nodeShape, nodeStrokeSegmentValue, nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeBottomIcon, nodeDisabled, nodeFill, nodeStrokeSegmentFill, nodeStroke, nodeSort, selectedNodeId, panels }
    const keys = Object.keys(config) as (keyof GraphConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
