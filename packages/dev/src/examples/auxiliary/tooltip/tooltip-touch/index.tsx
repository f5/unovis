import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Donut, Line, Scatter, StackedBar } from '@unovis/ts'
import {
  VisSingleContainer,
  VisDonut,
  VisXYContainer,
  VisArea,
  VisStackedBar,
  VisLine,
  VisScatter,
  VisAxis,
  VisCrosshair,
  VisTooltip,
} from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Tooltip: Touch'
export const subTitle = 'Hold to show, drag to scrub'

type DonutSegment = { data: number; index: number }

const LOG_LENGTH = 3
const LOG_LINE_HEIGHT = 14
const sectionStyle: React.CSSProperties = { marginBottom: 32 }
// The log has a fixed height to not move the charts under the pointer when it updates
const logStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  margin: 0,
  padding: 4,
  fontSize: 11,
  lineHeight: `${LOG_LINE_HEIGHT}px`,
  height: (2 * LOG_LENGTH + 1) * LOG_LINE_HEIGHT,
  overflow: 'hidden',
  background: 'var(--vis-tooltip-background-color, #fff)',
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const donutData = useMemo(() => [3, 2, 5, 4, 1], [])
  const xyData = useMemo(() => generateXYDataRecords(30), [])
  const barData = useMemo(() => xyData.slice(0, 12), [xyData])
  const [clickLog, setClickLog] = useState<string[]>([])
  const [crosshairX, setCrosshairX] = useState<number | undefined>()
  const [gestureLog, setGestureLog] = useState<string[]>([])
  const [followTouchMove, setFollowTouchMove] = useState(true)
  const [tooltipFollowTouchMove, setTooltipFollowTouchMove] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  // Summarize the pointer events of every gesture (e.g. "touch: down move×12 up") to see what the browser delivers
  useEffect(() => {
    let gesture: string[] = []
    const onPointerEvent = (e: PointerEvent): void => {
      const type = e.type.replace('pointer', '')
      if (type === 'down') gesture = []
      const last = gesture[gesture.length - 1]
      if (type === 'move' && last?.startsWith('move')) gesture[gesture.length - 1] = `move×${(+last.split('×')[1] || 1) + 1}`
      else gesture.push(type)
      if (type === 'up' || type === 'cancel') setGestureLog(log => [`${e.pointerType}: ${gesture.join(' ')}`, ...log].slice(0, LOG_LENGTH))
    }
    const root = rootRef.current
    const types = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as const
    types.forEach(t => root?.addEventListener(t, onPointerEvent, { capture: true, passive: true }))
    return () => types.forEach(t => root?.removeEventListener(t, onPointerEvent, { capture: true }))
  }, [])

  const logClick = useCallback((label: string): void => {
    setClickLog(log => [`${new Date().toLocaleTimeString()}: ${label}`, ...log].slice(0, LOG_LENGTH))
  }, [])

  const donutEvents = useMemo(() => ({
    [Donut.selectors.segment]: {
      click: (d: DonutSegment) => logClick(`Donut segment ${d.index} (${d.data}) clicked`),
    },
  }), [logClick])

  const barEvents = useMemo(() => ({
    [StackedBar.selectors.bar]: {
      click: (d: XYDataRecord) => logClick(`Bar ${d.x} clicked`),
    },
  }), [logClick])

  return (
    <div ref={rootRef} style={{ paddingBottom: '50vh' }}>
      <p>
        On a touchscreen (or in DevTools device emulation) the tooltip and the crosshair are shown only while the finger is down.
        Hold a segment or a bar, drag across the chart, lift the finger. A drag that starts on a chart should move the tooltip or the crosshair.
        Turn <code>followTouchMove</code> off to let a swipe that starts on the chart scroll the page instead.
      </p>
      <label>
        <input type='checkbox' checked={followTouchMove} onChange={e => setFollowTouchMove(e.target.checked)}/>
        Crosshair <code>followTouchMove</code>
      </label>
      <br/>
      <label>
        <input type='checkbox' checked={tooltipFollowTouchMove} onChange={e => setTooltipFollowTouchMove(e.target.checked)}/>
        Tooltip <code>followTouchMove</code>
      </label>
      <pre data-testid='touch-log' style={logStyle}>{`Crosshair x: ${crosshairX ?? '—'}\n${gestureLog.join('\n')}\n${clickLog.join('\n')}`}</pre>

      <div style={sectionStyle}>
        <h4>Donut, segment triggers and click events</h4>
        <VisSingleContainer height={260} data={donutData}>
          <VisDonut value={(d: number) => d} arcWidth={60} duration={props.duration} events={donutEvents}/>
          <VisTooltip followTouchMove={tooltipFollowTouchMove} triggers={{ [Donut.selectors.segment]: (d: DonutSegment) => `Segment ${d.index}: ${d.data}` }}/>
        </VisSingleContainer>
      </div>

      <div style={sectionStyle}>
        <h4>Area, crosshair</h4>
        <VisXYContainer<XYDataRecord> data={xyData} height={260}>
          <VisArea x={(d: XYDataRecord) => d.x} y={[(d: XYDataRecord) => d.y, (d: XYDataRecord) => d.y1]} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
          <VisCrosshair
            template={(d: XYDataRecord) => `x: ${d.x}, y: ${d.y.toFixed(2)}`}
            onCrosshairMove={(x?: number | Date) => setCrosshairX(x as number)}
            followTouchMove={followTouchMove}
          />
          <VisTooltip/>
        </VisXYContainer>
      </div>

      <div style={sectionStyle}>
        <h4>Stacked Bar, bar triggers with a crosshair and click events</h4>
        <VisXYContainer<XYDataRecord> data={barData} height={260}>
          <VisStackedBar x={(d: XYDataRecord) => d.x} y={[(d: XYDataRecord) => d.y, (d: XYDataRecord) => d.y1]} duration={props.duration} events={barEvents}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
          <VisCrosshair template={(d: XYDataRecord) => `Crosshair x: ${d.x}`} followTouchMove={followTouchMove}/>
          <VisTooltip hideDelay={300} followTouchMove={tooltipFollowTouchMove} triggers={{ [StackedBar.selectors.bar]: (d: { datum: XYDataRecord }) => `Bar ${d.datum.x}: ${d.datum.y.toFixed(2)}` }}/>
        </VisXYContainer>
      </div>

      <div style={sectionStyle}>
        <h4>Line and Scatter, triggers on both components</h4>
        <VisXYContainer<XYDataRecord> data={barData} height={260}>
          <VisLine x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y1} lineWidth={8} duration={props.duration}/>
          <VisScatter x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} size={20} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisTooltip followTouchMove={tooltipFollowTouchMove} triggers={{
            [Line.selectors.line]: () => 'Line',
            [Scatter.selectors.point]: (d: XYDataRecord) => `Point ${d.x}`,
          }}/>
        </VisXYContainer>
      </div>
    </div>
  )
}
