import React, { ForwardedRef, useCallback, useLayoutEffect, useRef } from 'react'
import { GraphInputNode, GraphInputLink } from '@unovis/ts'
import { VisGraphProps, VisGraphRef } from '../../../react/src/components/graph'
import { VisTopoJSONMapProps, VisTopoJSONMapRef } from '../../../react/src/components/topojson-map'
import * as Original from '../../../react/src'

import { arePropsEqual } from '../../../react/src/utils/react'

import { getInitialPlaying } from '../components/PlaybackControl'

import { getCaptureSettings } from './settings'
import { withDevConfig } from './withDevConfig'
import { CaptureLeafletMap } from './CaptureLeafletMap'

export * from '../../../react/src'

// eslint-disable-next-line @typescript-eslint/naming-convention
function CaptureGraph<N extends GraphInputNode, L extends GraphInputLink> (props: React.PropsWithChildren<VisGraphProps<N, L>>, ref: ForwardedRef<VisGraphRef<N, L>>): React.ReactElement {
  const status = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => { status.current?.setAttribute('aria-busy', 'true') })
  const onRenderComplete = useCallback<NonNullable<VisGraphProps<N, L>['onRenderComplete']>>((...args) => {
    props.onRenderComplete?.(...args)
    status.current?.setAttribute('aria-busy', 'false')
  }, [props.onRenderComplete])

  return <>
    <span ref={status} hidden aria-busy="true" data-capture-pending="Waiting for graph rendering" />
    <Original.VisGraph {...props} ref={ref} duration={0} linkFlow={getInitialPlaying() ? props.linkFlow : false} onRenderComplete={onRenderComplete} />
  </>
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function CaptureMap<A, P, L> (props: VisTopoJSONMapProps<A, P, L>, ref: ForwardedRef<VisTopoJSONMapRef<A, P, L>>): React.ReactElement {
  return <Original.VisTopoJSONMap {...props} ref={ref} duration={0} zoomDuration={0} enableFlowAnimation={getInitialPlaying() ? props.enableFlowAnimation : false} />
}

// Only the dev webpack build resolves @unovis/react through this adapter.
export const VisGraph = withDevConfig('graph', getCaptureSettings()
  ? (React.memo(React.forwardRef(CaptureGraph), arePropsEqual) as typeof Original.VisGraph)
  : Original.VisGraph)
export const VisTopoJSONMap = withDevConfig('topoJSONMap', getCaptureSettings()
  ? (React.forwardRef(CaptureMap) as typeof Original.VisTopoJSONMap)
  : Original.VisTopoJSONMap)
export const VisLine = withDevConfig('line', Original.VisLine)
export const VisArea = withDevConfig('area', Original.VisArea)
export const VisAxis = withDevConfig('axis', Original.VisAxis)
export const VisBoxplot = withDevConfig('boxplot', Original.VisBoxplot)
export const VisBrush = withDevConfig('brush', Original.VisBrush)
export const VisChordDiagram = withDevConfig('chordDiagram', Original.VisChordDiagram)
export const VisCrosshair = withDevConfig('crosshair', Original.VisCrosshair)
export const VisDonut = withDevConfig('donut', Original.VisDonut)
export const VisFreeBrush = withDevConfig('freeBrush', Original.VisFreeBrush)
export const VisGroupedBar = withDevConfig('groupedBar', Original.VisGroupedBar)
export const VisHeatmap = withDevConfig('heatmap', Original.VisHeatmap)
export const VisNestedDonut = withDevConfig('nestedDonut', Original.VisNestedDonut)
export const VisScatter = withDevConfig('scatter', Original.VisScatter)
export const VisSankey = withDevConfig('sankey', Original.VisSankey)
export const VisStackedBar = withDevConfig('stackedBar', Original.VisStackedBar)
export const VisTooltip = withDevConfig('tooltip', Original.VisTooltip)
export const VisTimeline = withDevConfig('timeline', Original.VisTimeline)
export const VisXYLabels = withDevConfig('xyLabels', Original.VisXYLabels)
export const VisAnnotations = withDevConfig('annotations', Original.VisAnnotations)
export const VisPlotband = withDevConfig('plotband', Original.VisPlotband)
export const VisTreemap = withDevConfig('treemap', Original.VisTreemap)
export const VisPlotline = withDevConfig('plotline', Original.VisPlotline)
export const VisRadialBar = withDevConfig('radialBar', Original.VisRadialBar)
export const VisCircularBar = withDevConfig('circularBar', Original.VisCircularBar)
export const VisBulletLegend = withDevConfig('bulletLegend', Original.VisBulletLegend)
export const VisRollingPinLegend = withDevConfig('rollingPinLegend', Original.VisRollingPinLegend)
export const VisLeafletMap = withDevConfig('leafletMap', getCaptureSettings() ? CaptureLeafletMap : Original.VisLeafletMap)
export const VisLeafletFlowMap = withDevConfig('leafletFlowMap', Original.VisLeafletFlowMap)
export const VisFlowLegend = withDevConfig('flowLegend', Original.VisFlowLegend)
