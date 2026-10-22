import React, { useState } from 'react'
import { VisSingleContainer, VisDonut, VisDonutSelectors, VisTooltip } from '@unovis/react'
import { DONUT_HALF_ANGLE_RANGE_TOP, DonutArcDatum } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Donut: Icons'
export const subTitle = 'Icon font glyphs, SVG symbols and data updates'

type DataRecord = { key: string; value: number; glyph: string; symbol: string }

// Font Awesome 6 solid glyphs (the dev app loads the Font Awesome stylesheet globally) and SVG symbols from `iconDefs`.
// The last segment is too small to fit an icon
const records: DataRecord[] = [
  { key: 'Mindfulness', value: 12, glyph: '&#xf5dc;', symbol: '#heart' },
  { key: 'Nutrition', value: 9, glyph: '&#xf5d1;', symbol: '#sun' },
  { key: 'Activity', value: 8, glyph: '&#xf554;', symbol: '#drop' },
  { key: 'Heart', value: 7, glyph: '&#xf004;', symbol: '#bolt' },
  { key: 'Body', value: 5, glyph: '&#xf1ae;', symbol: '#moon' },
  { key: 'Sleep', value: 3, glyph: '&#xf236;', symbol: '#star' },
  { key: 'Hearing', value: 0.4, glyph: '&#xf2a2;', symbol: '#leaf' },
]

const iconDefs = `
  <symbol id="heart" viewBox="0 0 24 24"><path d="M12 21.5s-7.8-4.7-10.3-9.6C0 8.5 2.1 3.5 6.6 3.5c2.4 0 4 1.4 5.4 3.5 1.4-2.1 3-3.5 5.4-3.5 4.5 0 6.6 5 4.9 8.4-2.5 4.9-10.3 9.6-10.3 9.6z"/></symbol>
  <symbol id="sun" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5.5"/>
    <path d="M12 1v3.5M12 19.5V23M1 12h3.5M19.5 12H23M4.2 4.2l2.5 2.5M17.3 17.3l2.5 2.5M4.2 19.8l2.5-2.5M17.3 6.7l2.5-2.5"
      stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  </symbol>
  <symbol id="drop" viewBox="0 0 24 24"><path d="M12 1.5S4.5 10 4.5 15.5a7.5 7.5 0 0 0 15 0C19.5 10 12 1.5 12 1.5z"/></symbol>
  <symbol id="bolt" viewBox="0 0 24 24"><path d="M14 1 3.5 14H11l-1.5 9L20.5 9.5H13L14 1z"/></symbol>
  <symbol id="moon" viewBox="0 0 24 24"><path d="M21.5 15.5A10 10 0 0 1 8.5 2.5a10 10 0 1 0 13 13z"/></symbol>
  <symbol id="star" viewBox="0 0 24 24"><path d="M12 1.5l3.2 6.9 7.5.8-5.6 5.1 1.6 7.4L12 17.9l-6.7 3.8 1.6-7.4-5.6-5.1 7.5-.8z"/></symbol>
  <symbol id="leaf" viewBox="0 0 24 24">
    <path d="M21.5 2.5C10 2.5 3.5 8 3.5 15.5c0 2 .5 3.8 1.3 5.3 1.7-5.2 5.4-8.8 10.2-10.3-3.8 2.3-6.8 6-8.2 10.9 1.3.7 2.8 1.1 4.4 1.1 7.5 0 10.3-7.5 10.3-20z"/>
  </symbol>
`

// Font Awesome's stylesheet maps the solid glyphs to the 900 font weight
const iconFontStyle = {
  '--vis-donut-icon-font-family': '"Font Awesome 6 Free"',
  '--vis-donut-icon-font-weight': 900,
} as React.CSSProperties

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data, setData] = useState(records)
  const [isPie, setIsPie] = useState(false)
  const hasAllSegments = data.length === records.length

  const randomizeValues = (): void => setData(data.map(d => ({ ...d, value: d.value * (0.3 + Math.random()) })))
  const toggleSegments = (): void => setData(hasAllSegments ? data.slice(2) : records)

  return (
    <div>
      <button onClick={randomizeValues}>Randomize values</button>
      <button onClick={toggleSegments}>{hasAllSegments ? 'Remove' : 'Add'} the first two segments</button>
      <button onClick={() => setIsPie(!isPie)}>{isPie ? 'Donut' : 'Pie'}</button>
      <div style={{ display: 'flex', marginTop: 16 }}>
        <VisSingleContainer height={400} style={{ flex: 1, minWidth: 0, ...iconFontStyle }}>
          <VisDonut<DataRecord>
            id={d => d.key}
            value={d => d.value}
            data={data}
            icon={d => d.glyph}
            arcWidth={isPie ? 0 : 70}
            padAngle={0.02}
            cornerRadius={6}
            duration={props.duration}
          />
          <VisTooltip triggers={{
            [VisDonutSelectors.segment]: (d: DonutArcDatum<DataRecord>) => `<strong>${d.data.key}</strong>: ${d.data.value.toFixed(1)}`,
          }}
          />
        </VisSingleContainer>
        <VisSingleContainer height={400} svgDefs={iconDefs} style={{ flex: 1, minWidth: 0 }}>
          <VisDonut<DataRecord>
            id={d => d.key}
            value={d => d.value}
            data={data}
            icon={d => d.symbol}
            iconSize={20}
            angleRange={DONUT_HALF_ANGLE_RANGE_TOP}
            arcWidth={isPie ? 0 : 50}
            centralLabel={isPie ? undefined : 'SVG symbols'}
            duration={props.duration}
          />
        </VisSingleContainer>
      </div>
    </div>
  )
}
