import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { VisAxis, VisLine, VisPlotband, VisPlotline, VisXYContainer } from '@unovis/react'
import { LabelOverflow, PlotbandLabelPosition, PlotlineLabelPosition } from '@unovis/ts'
import React, { useMemo, useState } from 'react'

export const title = 'Synced Auto-Positioned Labels'
export const subTitle = 'Stress-test for plotline + plotband label collision'

const data = generateXYDataRecords(40)

// Mirrors the production case where multiple `95th: …` labels collapse onto
// the same screen region — spacing slider drives them tighter or looser.
const labelTexts = [
  '95th: 81.34 kb/s',
  '95th: 808.67 kb/s',
  '95th: 3.55 Mb/s',
  '95th: 4.66 Mb/s',
  '95th: 10.83 Mb/s',
  '95th: 12.40 Mb/s',
  '95th: 15.20 Mb/s',
  '95th: 18.05 Mb/s',
  '99th: 22.10 Mb/s',
  '99th: 28.40 Mb/s',
  '99.9th: 35.60 Mb/s',
  '99.9th: 42.05 Mb/s',
]

const PLOTLINE_POSITIONS: PlotlineLabelPosition[] = [
  PlotlineLabelPosition.TopLeft,
  PlotlineLabelPosition.Top,
  PlotlineLabelPosition.TopRight,
  PlotlineLabelPosition.Right,
  PlotlineLabelPosition.BottomRight,
  PlotlineLabelPosition.Bottom,
  PlotlineLabelPosition.BottomLeft,
  PlotlineLabelPosition.Left,
]

const PLOTBAND_POSITIONS: PlotbandLabelPosition[] = [
  PlotbandLabelPosition.TopLeftOutside,
  PlotbandLabelPosition.TopLeftInside,
  PlotbandLabelPosition.TopOutside,
  PlotbandLabelPosition.TopInside,
  PlotbandLabelPosition.TopRightOutside,
  PlotbandLabelPosition.TopRightInside,
  PlotbandLabelPosition.RightOutside,
  PlotbandLabelPosition.RightInside,
  PlotbandLabelPosition.BottomRightOutside,
  PlotbandLabelPosition.BottomRightInside,
  PlotbandLabelPosition.BottomOutside,
  PlotbandLabelPosition.BottomInside,
  PlotbandLabelPosition.BottomLeftOutside,
  PlotbandLabelPosition.BottomLeftInside,
  PlotbandLabelPosition.LeftOutside,
  PlotbandLabelPosition.LeftInside,
]

const toolbarRow: React.CSSProperties = { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }
const fieldset: React.CSSProperties = { border: '1px solid #444', borderRadius: 4, padding: '8px 12px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }
const legendStyle: React.CSSProperties = { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 4px' }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [autoPosition, setAutoPosition] = useState(true)
  const [overflow, setOverflow] = useState<LabelOverflow>(LabelOverflow.Smart)
  const [count, setCount] = useState(5)
  const [spacing, setSpacing] = useState(0.06)
  const [linePos, setLinePos] = useState<PlotlineLabelPosition>(PlotlineLabelPosition.TopRight)
  const [bandPos, setBandPos] = useState<PlotbandLabelPosition>(PlotbandLabelPosition.TopLeftOutside)
  const [showBands, setShowBands] = useState(true)
  const base = 5.5

  const thresholds = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      value: base + i * spacing,
      label: labelTexts[i % labelTexts.length],
    })),
    [count, spacing]
  )

  return (
    <div>
      <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={toolbarRow}>
          <fieldset style={fieldset}>
            <legend style={legendStyle}>resolver</legend>
            <label>
              <input
                type='checkbox'
                checked={autoPosition}
                onChange={(e) => setAutoPosition(e.target.checked)}
              />
              {' '}labelAutoPosition
            </label>
            <label>
              labelOverflow:{' '}
              <select value={overflow} onChange={(e) => setOverflow(e.target.value as LabelOverflow)}>
                <option value={LabelOverflow.Smart}>smart</option>
                <option value={LabelOverflow.Hide}>hide</option>
                <option value={LabelOverflow.Stack}>stack</option>
              </select>
            </label>
          </fieldset>

          <fieldset style={fieldset}>
            <legend style={legendStyle}>data</legend>
            <label>
              plotlines:{' '}
              <input
                type='range'
                min={1}
                max={labelTexts.length}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              {' '}{count}
            </label>
            <label>
              spacing:{' '}
              <input
                type='range'
                min={0}
                max={0.5}
                step={0.005}
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
              />
              {' '}{spacing.toFixed(3)}
            </label>
          </fieldset>
        </div>

        <div style={toolbarRow}>
          <fieldset style={fieldset}>
            <legend style={legendStyle}>plotline</legend>
            <label>
              labelPosition:{' '}
              <select value={linePos} onChange={(e) => setLinePos(e.target.value as PlotlineLabelPosition)}>
                {PLOTLINE_POSITIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </label>
          </fieldset>

          <fieldset style={fieldset}>
            <legend style={legendStyle}>plotband</legend>
            <label>
              <input
                type='checkbox'
                checked={showBands}
                onChange={(e) => setShowBands(e.target.checked)}
              />
              {' '}show
            </label>
            {showBands && (
              <label>
                labelPosition:{' '}
                <select value={bandPos} onChange={(e) => setBandPos(e.target.value as PlotbandLabelPosition)}>
                  {PLOTBAND_POSITIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </label>
            )}
          </fieldset>
        </div>

        <span style={{ fontSize: '12px', color: '#888' }}>
          Drop spacing → 0 to force labels onto the same y. <code>hide</code> clears overflow, <code>stack</code> collapses to preferred, <code>smart</code> picks min-overlap. Plotbands participate in the same resolver.
        </span>
      </div>

      <VisXYContainer<XYDataRecord> data={data} height={400} duration={props.duration} margin={{ top: 10, right: 200, bottom: 30, left: 40 }} yDomain={[0, 20]}>
        <VisLine x={(d) => d.x} y={(d) => d.y} />
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        {showBands && (
          <>
            <VisPlotband
              from={2}
              to={4}
              labelText='warning band'
              labelPosition={bandPos}
              labelAutoPosition={autoPosition}
              labelOverflow={overflow}
              color='rgba(255, 200, 0, 0.15)'
            />
            <VisPlotband
              from={14}
              to={16}
              labelText='critical band'
              labelPosition={bandPos}
              labelAutoPosition={autoPosition}
              labelOverflow={overflow}
              color='rgba(255, 80, 80, 0.15)'
            />
          </>
        )}
        {thresholds.map((t, i) => (
          <VisPlotline
            key={i}
            value={t.value}
            labelText={t.label}
            labelPosition={linePos}
            labelAutoPosition={autoPosition}
            labelOverflow={overflow}
            color='#666'
            lineStyle='dash'
          />
        ))}
      </VisXYContainer>
    </div>
  )
}
