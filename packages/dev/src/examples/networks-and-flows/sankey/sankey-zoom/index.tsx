import React, { useRef, useState } from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import {
  Position,
  Sankey,
  SankeyEnterTransitionType,
  SankeyNode,
  SankeyNodeAlign,
  SankeySubLabelPlacement,
  SankeyZoomMode,
  Sizing,
  VerticalAlign,
} from '@unovis/ts'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

import apiRawData from '../sankey-api-endpoints/apieplist.json'
import { getSankeyData, ApiEndpointNode, ApiEndpointLink, linkSort, nodeSort } from '../sankey-api-endpoints/data'

import s from './style.module.css'

export const title = 'Sankey with Zoom'
export const subTitle = 'Collapsible nodes'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const collapsedStateRef = useRef<{ [key: string]: boolean }>({})
  const rawData = apiRawData
  const [data, setData] = useState(getSankeyData(rawData))
  const sankeyRef = useRef<{ component?: Sankey<ApiEndpointNode, ApiEndpointLink> }>(null)

  const nodeWidth = 30
  const nodeHorizontalSpacing = 260

  const zoomStep = 1.2

  // State for config properties
  const [zoomMode, setZoomMode] = useState<SankeyZoomMode>(SankeyZoomMode.Y)
  const [zoomExtent] = useState<[number, number]>([1, 5])
  const [configZoomScale, setConfigZoomScale] = useState<[number, number] | undefined>(undefined)
  const [configZoomPan, setConfigZoomPan] = useState<[number, number] | undefined>(undefined)

  const getCurrentScales = (): [number, number] => {
    const c = sankeyRef.current?.component
    const [h, v] = c?.getZoomScale() ?? [1, 1]

    return [h, v]
  }

  const onZoom = (factor: number): void => {
    const c = sankeyRef.current?.component
    if (!c) return

    const [h, v] = getCurrentScales()
    const nextH = h
    const nextV = v * factor
    c.setZoomScale(nextH, nextV)
  }

  const onFit = (): void => {
    const c = sankeyRef.current?.component
    c?.fitView?.(600)
  }

  const toggleZoomMode = (): void => {
    const modes = [SankeyZoomMode.XY, SankeyZoomMode.X, SankeyZoomMode.Y]
    const currentIndex = modes.indexOf(zoomMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setZoomMode(nextMode)
  }

  const setConfigScale = (h: number, v: number): void => {
    setConfigZoomScale([h, v])
  }

  const setConfigPanOffset = (x: number, y: number): void => {
    setConfigZoomPan([x, y])
  }

  const resetConfigScaleAndPan = (): void => {
    setConfigZoomScale(undefined)
    setConfigZoomPan(undefined)
  }

  const setPanOffset = (x: number, y: number): void => {
    const c = sankeyRef.current?.component
    c?.setPan(x, y)
  }

  const shouldDisableApiControls = configZoomScale !== undefined || configZoomPan !== undefined
  return (
    <>
      <VisSingleContainer data={data} height="95vh" sizing={Sizing.Fit}>
        <VisSankey<ApiEndpointNode, ApiEndpointLink>
          ref={sankeyRef}
          labelPosition={Position.Right}
          labelVerticalAlign={VerticalAlign.Middle}
          labelMaxWidthTakeAvailableSpace={true}
          labelMaxWidth={240}
          nodeHorizontalSpacing={nodeHorizontalSpacing}
          nodeWidth={nodeWidth}
          nodeAlign={SankeyNodeAlign.Left}
          nodeIconColor={'#e9edfe'}
          nodePadding={10}
          nodeMinHeight={5}
          labelBackground={false}
          labelColor={'#0D1C5B'}
          labelCursor={'pointer'}
          label={d => d.isLeafNode ? d.method : `${d.leafs} ${d.leafs === 1 ? 'Leaf' : 'Leaves'}`}
          subLabel={d => d.label}
          nodeColor={d => d.isLeafNode ? '#0D1C5B' : null}
          subLabelFontSize={14}
          labelFontSize={14}
          subLabelPlacement={SankeySubLabelPlacement.Below}
          nodeCursor={'pointer'}
          linkCursor={'pointer'}
          nodeIcon={d => (d.sourceLinks?.[0] || (!d.sourceLinks?.[0] && d.collapsed)) ? (d.collapsed ? '+' : '') : null}
          enterTransitionType={SankeyEnterTransitionType.FromAncestor}
          highlightSubtreeOnHover={false}
          duration={props.duration}
          zoomMode={zoomMode}
          zoomExtent={zoomExtent}
          zoomScale={configZoomScale}
          zoomPan={configZoomPan}
          enableZoom={true}
          nodeSort={nodeSort}
          linkSort={linkSort}
          events={{
            [Sankey.selectors.background]: {
              // eslint-disable-next-line no-console
              click: () => { console.log('Background click!') },
            },
            [Sankey.selectors.nodeGroup]: {
              click: (d: SankeyNode<ApiEndpointNode, ApiEndpointLink>) => {
                if (!d.targetLinks?.[0] || (!collapsedStateRef.current[d.id] && !d.sourceLinks?.[0])) return
                collapsedStateRef.current[d.id] = !collapsedStateRef.current[d.id]
                setData(getSankeyData(rawData, collapsedStateRef.current))
              },
            },
          }}
        />
      </VisSingleContainer>

      <div className={s.controlPanel}>
        {/* Basic Zoom Controls */}
        <div className={s.buttonRow}>
          <button onClick={() => onZoom(zoomStep)} disabled={shouldDisableApiControls}>
            Zoom In
          </button>
          <button onClick={() => onZoom(1 / zoomStep)} disabled={shouldDisableApiControls}>
            Zoom Out
          </button>
          <button onClick={onFit} disabled={shouldDisableApiControls}>
            Fit View
          </button>
        </div>


        {/* API Methods */}
        <div className={s.controlRow}>
          <span className={s.label}>Set Pan:</span>
          <button
            onClick={() => setPanOffset(100, 50)}
            className={s.smallButton}
            disabled={shouldDisableApiControls}
          >
            [100, 50]
          </button>
          <button
            onClick={() => setPanOffset(0, 0)}
            className={s.smallButton}
            disabled={shouldDisableApiControls}
          >
            Reset
          </button>
        </div>

        {/* Zoom Mode */}
        <div className={s.buttonRow}>
          <span className={s.label}>Mode: {zoomMode}</span>
          <button onClick={toggleZoomMode}>Toggle Mode</button>
        </div>

        {/* Config Scale */}
        <div className={s.controlRow}>
          <span className={s.label}>Config Scale:</span>
          <button onClick={() => setConfigScale(1.5, 2.0)} className={s.smallButton}>[1.5, 2.0]</button>
          <button onClick={() => setConfigScale(2, 1)} className={s.smallButton}>[2, 1]</button>
        </div>

        {/* Config Pan */}
        <div className={s.controlRow}>
          <span className={s.label}>Config Pan:</span>
          <button onClick={() => setConfigPanOffset(50, 100)} className={s.smallButton}>[50, 100]</button>
          <button onClick={() => setConfigPanOffset(-50, -50)} className={s.smallButton}>[-50, -50]</button>
        </div>

        {/* Reset */}
        <button onClick={resetConfigScaleAndPan}>Reset Config Scale & Pan</button>
      </div>
    </>
  )
}

