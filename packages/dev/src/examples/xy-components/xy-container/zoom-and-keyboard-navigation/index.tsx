import React, { useCallback, useMemo, useState } from 'react'
import { Scale } from '@unovis/ts'
import { VisXYContainer, VisLine, VisArea, VisStackedBar, VisAxis, VisCrosshair, VisTooltip, VisBrush, VisZoom } from '@unovis/react'
import { generateTimeSeriesDataRecords, TimeSeriesDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Zoom and Keyboard Navigation'
export const subTitle = 'Wheel, pinch, drag, keys'

const data = generateTimeSeriesDataRecords(3, 200, 1000 * 60 * 60 * 24)
const formatDate = (t: number | Date): string => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | undefined>()
  const [brushDomain, setBrushDomain] = useState<[number, number] | undefined>()
  const [onCrosshairMoveEvent, setOnCrosshairMoveEvent] = useState<string>()
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const xScaleOverview = useMemo(() => Scale.scaleTime(), [])

  const x = useCallback((d: TimeSeriesDataRecord) => d.time, [])
  const y = [0, 1, 2].map(i => (d: TimeSeriesDataRecord) => d.values[i])
  const template = useCallback((d: TimeSeriesDataRecord) => `<b>${formatDate(d.time)}</b><br/>${d.values.map(v => v.toFixed(2)).join(', ')}`, [])

  // The Brush and the zoomed chart drive each other: zooming moves the Brush selection,
  // and brushing sets `xDomain`, which replaces the zoomed domain
  const onZoom = useCallback((domain: [number, number] | undefined) => setZoomDomain(domain), [])
  const onBrushMove = useCallback((selection: [number, number] | undefined, _: unknown, userDriven: boolean) => {
    if (userDriven) {
      setBrushDomain(selection)
      setZoomDomain(selection)
    }
  }, [])

  return (
    <>
      <p>
        Click the chart (or focus it with <kbd>Tab</kbd>) and scroll to zoom, scroll horizontally or drag to pan, double click to reset.
        Pinch on a trackpad or a touch screen. With the keyboard: <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd> <kbd>PgUp</kbd> <kbd>PgDn</kbd>,{' '}
        <kbd>↑</kbd> <kbd>↓</kbd> for the series, <kbd>+</kbd> <kbd>-</kbd> to zoom, <kbd>Esc</kbd> to hide.
      </p>
      <div>
        Zoomed domain: {zoomDomain ? zoomDomain.map(formatDate).join(' – ') : 'none'}.{' '}
        <code>onCrosshairMove</code>: {onCrosshairMoveEvent ?? '–'}
      </div>
      <VisXYContainer<TimeSeriesDataRecord>
        data={data}
        height={300}
        xScale={xScale}
        xDomain={brushDomain}
        scaleByDomain
        ariaLabel='Three random time series'
      >
        <VisLine x={x} y={y} duration={props.duration}/>
        <VisAxis type='x' tickFormat={formatDate} duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
        <VisCrosshair template={template} onCrosshairMove={(_x, _d, i, e) => setOnCrosshairMoveEvent(e ? `${e.type} ${i ?? ''}` : undefined)}/>
        <VisTooltip/>
        <VisZoom onZoom={onZoom}/>
      </VisXYContainer>
      <VisXYContainer<TimeSeriesDataRecord> data={data} height={60} xScale={xScaleOverview}>
        <VisArea x={x} y={y[0]} duration={0}/>
        <VisBrush selection={zoomDomain ?? null} onBrushMove={onBrushMove} draggable/>
      </VisXYContainer>

      <h3>Stacked bars, Y domain from the whole dataset</h3>
      <VisXYContainer<TimeSeriesDataRecord> data={data} height={250}>
        <VisStackedBar x={x} y={y} duration={props.duration}/>
        <VisAxis type='x' tickFormat={formatDate} duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
        <VisCrosshair template={template}/>
        <VisTooltip/>
        <VisZoom/>
      </VisXYContainer>
    </>
  )
}
