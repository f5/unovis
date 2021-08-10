/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Graph,
  GraphConfigInterface,
  GraphInputNode,
  GraphInputLink,
  GraphLayoutType,
  StringAccessor,
  NumericAccessor,
  GraphLinkArrow,
  ColorAccessor,
  BooleanAccessor,
  GraphCircleLabel,
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
  /** Animation duration */
  @Input() duration: number

  /** Events */
  @Input() events: {
    [selector: string]: {
      [eventName: string]: (data: any, event?: Event, i?: number, els?: SVGElement[] | HTMLElement[]) => void;
    };
  }

  /** Custom attributes */
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Zoom level constraints, default: [0.35, 1.25] */
  @Input() zoomScaleExtent: [number, number]

  /** Disable zooming */
  @Input() disableZoom: boolean

  /** Disable node dragging */
  @Input() disableDrag: boolean

  /** Interval to re-render the graph when zooming */
  @Input() zoomThrottledUpdateNodeThreshold: number

  /** On zoom callback */
  @Input() onZoom: (zoomScale: number, zoomScaleExtent: number) => any

  /** Type of graph layout */
  @Input() layoutType: GraphLayoutType | string

  /** Refit the layout on data or configuration update */
  @Input() layoutAutofit: boolean

  /** Place non-connected nodes to the bottom of the graph */
  @Input() layoutNonConnectedAside: boolean

  /** Order of the layout groups, for parallel and concentric layouts */
  @Input() layoutGroupOrder: any[]

  /** Number of rows per group. Default: 1 */
  @Input() layoutGroupRows: number

  /**  */
  @Input() layoutSubgroupMaxNodes: number

  /**  */
  @Input() layoutSortConnectionsByGroup: string

  /** Node Group accessor function or value */
  @Input() nodeGroup: StringAccessor<N>

  /** Node Sub Group accessor function or value */
  @Input() nodeSubGroup: StringAccessor<N>

  /** Force Layout settings, see d3.force */
  @Input() forceLayoutSettings: {
    linkDistance?: number;
    linkStrength?: number;
    charge?: number;
    forceXStrength?: number;
    forceYStrength?: number;
  }

  /** Darge Layout settings, see dagrejs */
  @Input() dagreLayoutSettings: {
    rankdir: string;
    ranker: string;
  }

  /** Animation duration of the flow (traffic) circles */
  @Input() flowAnimDuration: number

  /** Flow circle size */
  @Input() flowCircleSize: number

  /** Link width accessor function or value */
  @Input() linkWidth: NumericAccessor<L>

  /** Link style accessor function or value: 'solid' or 'dashed'. Default: 'solid' */
  @Input() linkStyle: StringAccessor<L>

  /** Link band width accessor function or value. Default: 0 */
  @Input() linkBandWidth: NumericAccessor<L>

  /** Link arrow accessor function or undefined */
  @Input() linkArrow: ((d: L, i?: number, ...rest) => GraphLinkArrow) | undefined

  /** Link stroke color accessor function or value */
  @Input() linkStroke: ColorAccessor<L>

  /** Link flow display accessor or boolean value */
  @Input() linkFlow: BooleanAccessor<L>

  /** Link side Label accessor function or undefined */
  @Input() linkLabel: ((d: L, i?: number, ...rest) => GraphCircleLabel | undefined) | undefined

  /** Shift or not link side Label from center */
  @Input() linkLabelShiftFromCenter: BooleanAccessor<L>

  /** Set selected link by id */
  @Input() selectedLinkId: number | string

  /** Animation duration of the Node Score circle */
  @Input() scoreAnimDuration: number

  /** Node size accessor function or value */
  @Input() nodeSize: NumericAccessor<N>

  /** Node border width accessor function or value */
  @Input() nodeBorderWidth: NumericAccessor<N>

  /** Node shape accessor function or value */
  @Input() nodeShape: StringAccessor<N>

  /** Node Score accessor function or value, in the range [0,100] */
  @Input() nodeStrokeSegmentValue: NumericAccessor<N>

  /** Node Icon accessor function or value */
  @Input() nodeIcon: StringAccessor<N>

  /** Node Icon size accessor function or value */
  @Input() nodeIconSize: NumericAccessor<N>

  /** Node Label accessor function or value */
  @Input() nodeLabel: StringAccessor<N>

  /** Node Sublabel accessor function or value */
  @Input() nodeSubLabel: StringAccessor<N>

  /** Node Side Label accessor function or undefined */
  @Input() nodeSideLabels: ((d: N, i?: number, ...rest) => GraphCircleLabel[] | undefined) | undefined

  /** Node Bottom Icon accessor function. Default: `undefined` */
  @Input() nodeBottomIcon: StringAccessor<N>

  /** Node disabled accessor function or value */
  @Input() nodeDisabled: BooleanAccessor<N>

  /** Node fill color accessor function or value */
  @Input() nodeFill: ColorAccessor<N>

  /** Node stroke segment fill color accessor function or value */
  @Input() nodeStrokeSegmentFill: ColorAccessor<N>

  /** Node stroke color accessor function or value */
  @Input() nodeStroke: ColorAccessor<N>

  /** Node Sorting Function. Default: `undefined` */
  @Input() nodeSort: ((a: N, b: N) => number)

  /** Set selected node by Id */
  @Input() selectedNodeId: number | string

  /**  */
  @Input() panels: GraphPanelConfigInterface[]
  @Input() data: any

  component: Graph<N, L> | undefined

  ngAfterViewInit (): void {
    this.component = new Graph<N, L>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): GraphConfigInterface<N, L> {
    const { duration, events, attributes, zoomScaleExtent, disableZoom, disableDrag, zoomThrottledUpdateNodeThreshold, onZoom, layoutType, layoutAutofit, layoutNonConnectedAside, layoutGroupOrder, layoutGroupRows, layoutSubgroupMaxNodes, layoutSortConnectionsByGroup, nodeGroup, nodeSubGroup, forceLayoutSettings, dagreLayoutSettings, flowAnimDuration, flowCircleSize, linkWidth, linkStyle, linkBandWidth, linkArrow, linkStroke, linkFlow, linkLabel, linkLabelShiftFromCenter, selectedLinkId, scoreAnimDuration, nodeSize, nodeBorderWidth, nodeShape, nodeStrokeSegmentValue, nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeBottomIcon, nodeDisabled, nodeFill, nodeStrokeSegmentFill, nodeStroke, nodeSort, selectedNodeId, panels } = this
    const config = { duration, events, attributes, zoomScaleExtent, disableZoom, disableDrag, zoomThrottledUpdateNodeThreshold, onZoom, layoutType, layoutAutofit, layoutNonConnectedAside, layoutGroupOrder, layoutGroupRows, layoutSubgroupMaxNodes, layoutSortConnectionsByGroup, nodeGroup, nodeSubGroup, forceLayoutSettings, dagreLayoutSettings, flowAnimDuration, flowCircleSize, linkWidth, linkStyle, linkBandWidth, linkArrow, linkStroke, linkFlow, linkLabel, linkLabelShiftFromCenter, selectedLinkId, scoreAnimDuration, nodeSize, nodeBorderWidth, nodeShape, nodeStrokeSegmentValue, nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeBottomIcon, nodeDisabled, nodeFill, nodeStrokeSegmentFill, nodeStroke, nodeSort, selectedNodeId, panels }
    const keys = Object.keys(config) as (keyof GraphConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
