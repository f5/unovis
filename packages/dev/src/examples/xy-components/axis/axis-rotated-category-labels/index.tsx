import React, { useState } from 'react'
import { VisXYContainer, VisAxis, VisGroupedBar } from '@unovis/react'
import { Axis, TextAlign, TrimMode } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Rotated Category Labels'
export const subTitle = 'Long labels wrapped and fitted at an angle'

type FailureMode = {
  index: number;
  label: string;
  share: number;
}

const data: FailureMode[] = [
  { index: 0, label: 'FA_06 (TX FAIL WET2_ALIGNMENT)', share: 8.95 },
  { index: 1, label: 'FAA_11 (RX RESPONSIVITY LOW)', share: 5.72 },
  { index: 2, label: 'FAA_26 (TX_FAU CHIP)', share: 5.72 },
  { index: 3, label: 'FAA_33 (LENS CONTAMINATION)', share: 5.5 },
  { index: 4, label: 'FAA_41 (TX_INSUFFICIENT EPOXY 3410)', share: 3.88 },
  { index: 5, label: 'FAA_19 (SUBMOUNT SOLDER VOID)', share: 3.78 },
  { index: 6, label: 'FAA_25 (WIRE BOND DAMAGE)', share: 3.55 },
  { index: 7, label: 'FAA_07 (TEC OPEN CIRCUIT)', share: 3.32 },
  { index: 8, label: 'FAA_28 (FIBER CABLE DAMAGE)', share: 2.8 },
  { index: 9, label: 'FAA_52 (PD DARK CURRENT HIGH)', share: 2.15 },
]

const tickValues = data.map(d => d.index)
const tickFormat = (tick: number | Date): string => data[tick as number]?.label ?? ''

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [tickTextAngle, setTickTextAngle] = useState(-90)
  const [width, setWidth] = useState(728)
  const [tickTextOverlapTolerance, setTickTextOverlapTolerance] = useState(0)
  const [tickTextWidth, setTickTextWidth] = useState(0)
  const [tickTextMaxLines, setTickTextMaxLines] = useState(0)
  const [tickTextTrimType, setTickTextTrimType] = useState<TrimMode>(TrimMode.Middle)
  const [tickTextBalanced, setTickTextBalanced] = useState(true)
  const [labeledCount, setLabeledCount] = useState(data.length)

  const onRenderComplete = (svg: SVGSVGElement): void => {
    const labels = svg.querySelectorAll(`[axis-type="x"] .${Axis.selectors.tickLabel}`)
    const hidden = svg.querySelectorAll(`[axis-type="x"] .${Axis.selectors.tickTextHidden}`)
    setLabeledCount(labels.length - hidden.length)
  }

  return (
    <div style={{ marginLeft: 8 }}>
      <p>
        Ten bars with long category labels, rotated and wrapped. Every bar should stay labeled at -90° with
        the label block centred on its bar, at any chart width. Steeper labels wrap into fewer, longer lines.
      </p>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={-90} max={0} step={15} value={tickTextAngle} onChange={e => setTickTextAngle(Number(e.target.value))} style={{ marginRight: 10, width: 300 }}/>
        <label>tickTextAngle: {tickTextAngle}°</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={500} max={1000} step={4} value={width} onChange={e => setWidth(Number(e.target.value))} style={{ marginRight: 10, width: 300 }}/>
        <label>width: {width}px</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={-15} max={30} value={tickTextOverlapTolerance} onChange={e => setTickTextOverlapTolerance(Number(e.target.value))} style={{ marginRight: 10, width: 300 }}/>
        <label>tickTextOverlapTolerance: {tickTextOverlapTolerance}px</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={0} max={300} step={10} value={tickTextWidth} onChange={e => setTickTextWidth(Number(e.target.value))} style={{ marginRight: 10, width: 300 }}/>
        <label>tickTextWidth: {tickTextWidth ? `${tickTextWidth}px` : 'auto'}</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={0} max={4} value={tickTextMaxLines} onChange={e => setTickTextMaxLines(Number(e.target.value))} style={{ marginRight: 10, width: 300 }}/>
        <label>tickTextMaxLines: {tickTextMaxLines || 'unlimited'}</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <select value={tickTextTrimType} onChange={e => setTickTextTrimType(e.target.value as TrimMode)} style={{ marginRight: 10 }}>
          {Object.values(TrimMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
        </select>
        <label>tickTextTrimType</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" checked={tickTextBalanced} onChange={e => setTickTextBalanced(e.target.checked)} style={{ marginRight: 6 }}/>
          tickTextBalanced
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>Labeled bars: {labeledCount} of {data.length}</b>
      </div>
      <VisXYContainer<FailureMode> data={data} width={width} height={300} xDomain={[-0.5, data.length - 0.5]} onRenderComplete={onRenderComplete}>
        <VisGroupedBar x={d => d.index} y={d => d.share} duration={props.duration}/>
        <VisAxis
          type='x'
          label='Failure Mode'
          tickValues={tickValues}
          tickFormat={tickFormat}
          tickTextAngle={tickTextAngle || undefined}
          tickTextAlign={tickTextAngle ? TextAlign.Right : undefined}
          tickTextHideOverlapping={true}
          tickTextAdaptiveSets={true}
          tickTextOverlapTolerance={tickTextOverlapTolerance}
          tickTextWidth={tickTextWidth || undefined}
          tickTextMaxLines={tickTextMaxLines || undefined}
          tickTextTrimType={tickTextTrimType}
          tickTextBalanced={tickTextBalanced}
          duration={props.duration}
        />
        <VisAxis type='y' label='% of Failures' duration={props.duration}/>
      </VisXYContainer>
    </div>
  )
}
