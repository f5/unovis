import React, { useState } from 'react'
import { VisXYContainer, VisAxis, VisGroupedBar } from '@unovis/react'
import { TextAlign, TrimMode } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Tick Label Max Lines'
export const subTitle = 'Wrapped labels capped and trimmed'

type Datum = {
  index: number;
  label: string;
  value: number;
}

const data: Datum[] = [
  { index: 0, label: 'Northwest Regional Distribution Center', value: 42 },
  { index: 1, label: 'Downtown Flagship Retail Store', value: 35 },
  { index: 2, label: 'Airport Duty Free Concession', value: 28 },
  { index: 3, label: 'Online Marketplace Storefront', value: 61 },
  { index: 4, label: 'Wholesale Partner Network', value: 19 },
  { index: 5, label: 'Seasonal Pop-Up Locations', value: 12 },
]

const tickValues = data.map(d => d.index)
const tickFormat = (tick: number | Date): string => data[tick as number]?.label ?? ''

// Labels ending in words too long for a rotated label on a short chart
const rotatedData: Datum[] = [
  { index: 0, label: 'FA_06 (TX FAIL WET2_ALIGNMENT)', value: 8.95 },
  { index: 1, label: 'FAA_11 (RX RESPONSIVITY LOW)', value: 5.72 },
  { index: 2, label: 'FAA_41 (TX_INSUFFICIENT EPOXY 3410)', value: 3.88 },
  { index: 3, label: 'FAA_33 (LENS CONTAMINATION)', value: 5.5 },
  { index: 4, label: 'FAA_19 (SUBMOUNT SOLDER VOID)', value: 3.78 },
  { index: 5, label: 'FAA_52 (PD DARK CURRENT HIGH)', value: 2.15 },
]
const rotatedTickFormat = (tick: number | Date): string => rotatedData[tick as number]?.label ?? ''
const labelStyle: React.CSSProperties = { font: '11px monospace', color: '#888', margin: '12px 0 2px' }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [tickTextMaxLines, setTickTextMaxLines] = useState(2)
  const [tickTextBalanced, setTickTextBalanced] = useState(false)

  return (
    <div style={{ marginLeft: 8 }}>
      <p>
        Labels wrap at a fixed 80px width. <code>tickTextMaxLines</code> caps the lines they can take; longer
        labels are trimmed to fit, where <code>tickTextTrimType</code> says.
      </p>
      <div style={{ marginBottom: 10 }}>
        <input type="range" min={1} max={4} value={tickTextMaxLines} onChange={e => setTickTextMaxLines(Number(e.target.value))} style={{ marginRight: 10, width: 300 }}/>
        <label>tickTextMaxLines: {tickTextMaxLines}</label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" checked={tickTextBalanced} onChange={e => setTickTextBalanced(e.target.checked)} style={{ marginRight: 6 }}/>
          tickTextBalanced
        </label>
      </div>
      {Object.values(TrimMode).map(trimMode => (
        <div key={trimMode}>
          <div style={labelStyle}>tickTextTrimType: {trimMode}</div>
          <VisXYContainer<Datum> data={data} height={220} xDomain={[-0.5, data.length - 0.5]}>
            <VisGroupedBar x={d => d.index} y={d => d.value} duration={props.duration}/>
            <VisAxis
              type='x'
              tickValues={tickValues}
              tickFormat={tickFormat}
              tickTextWidth={80}
              tickTextMaxLines={tickTextMaxLines}
              tickTextTrimType={trimMode}
              tickTextBalanced={tickTextBalanced}
              duration={props.duration}
            />
            <VisAxis type='y' duration={props.duration}/>
          </VisXYContainer>
        </div>
      ))}
      <div style={labelStyle}>-90°, 220px high chart, tickTextTrimType: middle — no line deeper than a third of the height</div>
      <VisXYContainer<Datum> data={rotatedData} width={500} height={220} xDomain={[-0.5, rotatedData.length - 0.5]}>
        <VisGroupedBar x={d => d.index} y={d => d.value} duration={props.duration}/>
        <VisAxis
          type='x'
          tickValues={tickValues}
          tickFormat={rotatedTickFormat}
          tickTextAngle={-90}
          tickTextAlign={TextAlign.Right}
          tickTextSeparator={[' ', '-', '.', ',', '_']}
          tickTextMaxLines={tickTextMaxLines}
          tickTextTrimType={TrimMode.Middle}
          tickTextBalanced={tickTextBalanced}
          duration={props.duration}
        />
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </div>
  )
}
