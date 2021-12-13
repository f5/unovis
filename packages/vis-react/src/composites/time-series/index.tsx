// Copyright (c) Volterra, Inc. All rights reserved.
import { useState, useMemo } from 'react'
import { cx } from 'emotion'
import { Spacing, TextAlign, Scale } from '@volterra/vis'
import { VisXYContainer } from '@volterra/vis-react/containers/xy-container'
import { VisArea } from '@volterra/vis-react/components/area'
import { VisAxis } from '@volterra/vis-react/components/axis'
import { VisCrosshair } from '@volterra/vis-react/components/crosshair'
import { VisTooltip } from '@volterra/vis-react/components/tooltip'
import { VisBrush } from '@volterra/vis-react/components/brush'

import * as s from './style'

export type VisTimeSeriesDatum = {
  timestamp: number;
  value: number;
  id?: string;
  color?: string;
}

export type VisTimeSeriesProps<Datum> = {
  data: Datum[];
  margin: Spacing;
  autoMargin: boolean;

  x: (d: Datum, i: number) => number;
  y: (d: Datum, i: number) => number;
  id: (d: Datum, i: number) => string;
  color: (d: Datum, i: number) => string;
  cursor: string | ((d: Datum, i: number) => string);
  formatXTicks?: (timestamp: number) => string;
  formatYTicks?: (timestamp: number) => string;

  selectionMinLength: number;
  onBrushStart?: (selection: [number, number], e?: { sourceEvent: MouseEvent }, userDriven?: boolean) => void;
  onBrushMove?: (selection: [number, number], e?: { sourceEvent: MouseEvent }, userDriven?: boolean) => void;
  onBrushEnd?: (selection: [number, number], e?: { sourceEvent: MouseEvent }, userDriven?: boolean) => void;
  formatNavXTicks?: (timestamp: number) => string;

  xLabel?: string;
  yLabel?: string;

  crosshairTemplate?: (d: Datum) => string | HTMLElement;

  className?: string;
  height?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTimeSeries<Datum> (props: VisTimeSeriesProps<Datum>): JSX.Element {
  const [selectedRange, setSelectedRange] = useState<[number, number] | undefined>(undefined)
  const [animationDuration, setAnimationDuration] = useState<number | undefined>(0)
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const xScaleNav = useMemo(() => Scale.scaleTime(), [])

  // On Mount
  // useEffect(() => {}, [])

  // On Props Update
  // useEffect(() => {})

  // Brush callbacks
  const onBrushStart = useMemo(() => (selection: [number, number], e?: { sourceEvent: MouseEvent }, userDriven?: boolean): void => {
    if (userDriven) setAnimationDuration(0)
    props.onBrushStart?.(selection, e, userDriven)
  }, [])

  const onBrushMove = useMemo(() => (selection: [number, number], e?: { sourceEvent: MouseEvent }, userDriven?: boolean): void => {
    if (userDriven && selectedRange?.[0] !== selection[0] && selectedRange?.[1] !== selection[1]) setSelectedRange(selection)
    props.onBrushMove?.(selection, e, userDriven)
  }, [])

  const onBrushEnd = useMemo(() => (selection: [number, number], e?: { sourceEvent: MouseEvent }, userDriven?: boolean): void => {
    if (userDriven && selectedRange?.[0] !== selection[0] && selectedRange?.[1] !== selection[1]) setSelectedRange(selection)
    setAnimationDuration(undefined)
    props.onBrushEnd?.(selection, e, userDriven)
  }, [])

  return (
    <div className={cx(s.timeSeriesContainer, props.className)} style={{ height: props.height }}>
      <VisXYContainer
        className={s.timeSeriesModule}
        data={props.data}
        xScale={xScale}
        xDomain={selectedRange}
        duration={animationDuration}
        scaleByDomain={true}
      >
        <VisArea
          x={props.x}
          y={props.y}
          color={props.color}
        />
        <VisAxis type='x' numTicks={5} tickFormat={props.formatXTicks} tickTextAlign={TextAlign.Center}/>
        <VisAxis type='y' tickFormat={props.formatYTicks} label={props.yLabel}/>
        <VisTooltip />
        <VisCrosshair template={props.crosshairTemplate}/>
      </VisXYContainer>
      <VisXYContainer className={s.navigationModule} duration={0} xScale={xScaleNav} data={props.data}>
        <VisArea x={props.x} y={props.y} />
        <VisBrush draggable={true} onBrushStart={onBrushStart} onBrushMove={onBrushMove} onBrushEnd={onBrushEnd} />
        <VisAxis type='x' numTicks={5} tickFormat={props.formatXTicks ?? props.formatNavXTicks} tickTextAlign={TextAlign.Right} label={props.xLabel}/>
        <VisAxis type='y' tickFormat={props.formatYTicks} minMaxTicksOnly={true} label={props.yLabel ? ' ' : undefined}/>
      </VisXYContainer>
    </div>
  )
}

VisTimeSeries.defaultProps = {
  margin: { top: 10, bottom: 10, left: 10, right: 10 },
  autoMargin: true,
  padding: {},

  x: (d: VisTimeSeriesDatum) => d.timestamp,
  y: (d: VisTimeSeriesDatum) => d.value,
  id: (d: VisTimeSeriesDatum) => d.id,
  color: (d: VisTimeSeriesDatum) => d.color,

  formatYTicks: (d: number) => d.toFixed(1),

  crosshairTemplate: (d: VisTimeSeriesDatum) => `<div>Date: ${new Date(d.timestamp).toLocaleDateString()}</div><div>Value: ${d.value?.toFixed(1)}</div>`,
}
