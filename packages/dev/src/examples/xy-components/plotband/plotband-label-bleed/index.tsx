import React, { useState } from 'react'
import { AxisType, PlotbandLabelOrientation, PlotbandLabelPosition, UnovisText } from '@unovis/ts'
import { VisLine, VisPlotband, VisXYContainer } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import s from './style.module.css'

export const title = 'Plotband Label Bleed'
export const subTitle = 'Every label position, orientation and axis combination'

const data = generateXYDataRecords(15)
const xDomain: [number, number] = [0, 14]
const yDomain: [number, number] = [0, 10]

const axes: AxisType[] = [AxisType.Y, AxisType.X]
const positions = Object.values(PlotbandLabelPosition)
const orientations = Object.values(PlotbandLabelOrientation)

// The band is placed at the edges of the domain to make the label overflow the chart area:
// without the bleed calculated by the Plotband component, such labels get clipped
const bandPlacements = ['domain start', 'domain middle', 'domain end', 'beyond the domain'] as const
type BandPlacement = typeof bandPlacements[number]

function getBandExtent (axis: AxisType, placement: BandPlacement): [number, number] {
  const [domainStart, domainEnd] = axis === AxisType.Y ? yDomain : xDomain
  const bandSize = (domainEnd - domainStart) / 4

  switch (placement) {
    case 'domain start': return [domainStart, domainStart + bandSize]
    case 'domain end': return [domainEnd - bandSize, domainEnd]
    case 'beyond the domain': return [domainEnd - bandSize, domainEnd + bandSize]
    default: return [(domainStart + domainEnd) / 2 - bandSize / 2, (domainStart + domainEnd) / 2 + bandSize / 2]
  }
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [labelText, setLabelText] = useState('Threshold')
  const [labelSize, setLabelSize] = useState(12)
  const [labelOffsetX, setLabelOffsetX] = useState(14)
  const [labelOffsetY, setLabelOffsetY] = useState(14)
  const [bandPlacement, setBandPlacement] = useState<BandPlacement>('domain end')
  const [styledLabel, setStyledLabel] = useState(false)

  // Styled multi-line label defined as `UnovisText` blocks: the block-level font size,
  // weight and color take priority over the `labelSize` / `labelColor` options
  const styledLabelBlocks: UnovisText[] = [
    { text: labelText, fontWeight: 600 },
    { text: 'styled sub-label', fontSize: 10, color: '#888888', marginTop: 2 },
  ]

  return (
    <>
      <div className={s.controls}>
        <label>
          Label Text:
          <input type='text' value={labelText} onChange={e => setLabelText(e.target.value)}/>
        </label>
        <label>
          Plotband Extent:
          <select value={bandPlacement} onChange={e => setBandPlacement(e.target.value as BandPlacement)}>
            {bandPlacements.map(placement => <option key={placement} value={placement}>{placement}</option>)}
          </select>
        </label>
        <label>
          Label Size ({labelSize}):
          <input type='range' min={8} max={32} value={labelSize} onChange={e => setLabelSize(Number(e.target.value))}/>
        </label>
        <label>
          Offset X ({labelOffsetX}):
          <input type='range' min={0} max={50} value={labelOffsetX} onChange={e => setLabelOffsetX(Number(e.target.value))}/>
        </label>
        <label>
          Offset Y ({labelOffsetY}):
          <input type='range' min={0} max={50} value={labelOffsetY} onChange={e => setLabelOffsetY(Number(e.target.value))}/>
        </label>
        <label>
          Styled Label (UnovisText):
          <input type='checkbox' checked={styledLabel} onChange={e => setStyledLabel(e.target.checked)}/>
        </label>
      </div>

      {axes.map(axis => (
        <div key={axis}>
          <h3>axis: {axis}</h3>
          {orientations.map(orientation => (
            <div key={orientation} className={s.grid}>
              {positions.map(position => (
                <div key={position} className={s.card}>
                  {position} / {orientation}
                  <VisXYContainer<XYDataRecord>
                    data={data}
                    height={240}
                    xDomain={xDomain}
                    yDomain={yDomain}
                    className={s.chart}
                  >
                    <VisLine x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} duration={props.duration}/>
                    <VisPlotband
                      axis={axis}
                      from={getBandExtent(axis, bandPlacement)[0]}
                      to={getBandExtent(axis, bandPlacement)[1]}
                      labelText={styledLabel ? styledLabelBlocks : labelText}
                      labelPosition={position}
                      labelOrientation={orientation}
                      labelOffsetX={labelOffsetX}
                      labelOffsetY={labelOffsetY}
                      labelSize={labelSize}
                      duration={props.duration}
                    />
                  </VisXYContainer>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
