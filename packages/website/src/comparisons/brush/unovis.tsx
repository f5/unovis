import React, { useEffect, useMemo, useState } from 'react'
import { Arrangement, FreeBrushMode, FreeBrushSelection, Scale } from '@unovis/ts'
import { VisXYContainer, VisArea, VisAxis, VisBrush, VisCrosshair, VisFreeBrush, VisTooltip } from '@unovis/react'

import type { ChartProps } from '../types'
import { LAST_30_DAYS, READOUT_STYLE } from './constants'
import { DataRecord, formatDate, formatDay, formatMonth, formatSelection, formatValue } from './data'

const x = (d: DataRecord): number => d.date.getTime()
const y = (d: DataRecord): number => d.requests
const tooltipTemplate = (d: DataRecord): string => `<b>${formatDate(d.date)}</b><div>${formatValue(d.requests)} requests</div>`

export default function UnovisBrushChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const brushXScale = useMemo(() => Scale.scaleTime(), [])
  // The selected days zoom the main chart through its `xDomain`; the zoom box sets the `yDomain` too
  const [xDomain, setXDomain] = useState<[number, number] | undefined>()
  const [yDomain, setYDomain] = useState<[number, number] | undefined>()
  // The main chart follows the brush without a transition while you drag it, and animates everything else
  const [brushing, setBrushing] = useState(false)

  useEffect(() => {
    setXDomain(preset === 'window' ? [LAST_30_DAYS[0].getTime(), LAST_30_DAYS[1].getTime()] : undefined)
    setYDomain(undefined)
  }, [preset])

  const onBrush = (selection: [number, number], _: unknown, userDriven: boolean): void => {
    if (!userDriven) return
    setXDomain(selection)
    setYDomain(undefined)
  }

  const onZoomBox = (selection: FreeBrushSelection | undefined, _: unknown, userDriven: boolean): void => {
    if (!userDriven || !selection) return
    const [xRange, yRange] = selection as [[number, number], [number, number]]
    setXDomain(xRange)
    setYDomain(yRange)
  }

  return (
    <>
      <div style={READOUT_STYLE}>{formatSelection(data, xDomain)}</div>
      <VisXYContainer data={data} height={320} xScale={xScale} xDomain={xDomain} yDomain={yDomain} scaleByDomain duration={brushing ? 0 : undefined}>
        <VisArea x={x} y={y}/>
        <VisAxis type="x" tickFormat={(t: Date) => formatDay(t)}/>
        <VisAxis type="y" tickFormat={formatValue}/>
        {preset === 'zoom-box' && <VisFreeBrush mode={FreeBrushMode.XY} onBrushEnd={onZoomBox}/>}
        <VisCrosshair template={tooltipTemplate}/>
        <VisTooltip container={document.body}/>
      </VisXYContainer>
      {/* The left margin lines the brush up with the chart above; outside handles need room on the right too */}
      <VisXYContainer data={data} height={96} xScale={brushXScale} margin={{ left: 44, right: preset === 'handles' ? 14 : 0 }}>
        <VisArea x={x} y={y}/>
        <VisBrush
          // Without a selection the brush keeps its last range, so the whole year is passed instead
          selection={xDomain ?? [x(data[0]), x(data[data.length - 1])]}
          onBrush={onBrush}
          onBrushStart={(_, __, userDriven) => userDriven && setBrushing(true)}
          onBrushEnd={(_, __, userDriven) => userDriven && setBrushing(false)}
          draggable={preset === 'window'}
          {...(preset === 'handles' && { handlePosition: Arrangement.Outside, handleWidth: 14 })}
        />
        <VisAxis type="x" tickFormat={(t: Date) => formatMonth(t)}/>
      </VisXYContainer>
    </>
  )
}
