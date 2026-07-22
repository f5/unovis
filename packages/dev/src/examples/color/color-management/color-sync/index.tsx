import React from 'react'
import { Scale } from '@unovis/ts'
import { VisXYContainer, VisArea, VisAxis, VisStackedBar, VisBulletLegend, VisCrosshair, VisLine, VisGroupedBar, VisScatter } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Color Synchronization'
export const subTitle = 'Multiple Charts'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  type Datum = { x: number; azure: number; aws: number; google: number; github: number; apple: number };
  const data: Datum[] = Array(75).fill(0).map((_, i) => {
    const t = i / 15
    return {
      x: i,
      azure: 80 + 15 * Math.sin(t) * t + i * 2,
      aws: 150 + 80 * Math.sin(t * 0.7) + i * 1.5,
      google: 200 + 60 * Math.cos(t * 1.2) + i * 3,
      github: 90 + 40 * Math.sin(t * 2) + i * 0.8,
      apple: 120 + 70 * Math.cos(t * 0.5 + 1) + i * 2.2,
    }
  })

  // Left Block
  const leftBlockChartKeys = ['azure', 'aws', 'github']
  const accessorsLeftBlockCharts = leftBlockChartKeys.map(key => (d: Datum) => d[key as keyof Datum])
  const leftBlockColorScale = Scale.scaleOrdinal<string | number, string>()
    .range(['#ff8CFD', '#126B7E', '#FF5450', '#23cc00', '#0000FF', '#FFFF00'])

  // Right Block
  const rightBlockChartKeys = ['aws', 'google', 'github', 'apple']
  const accessorsRightBlockCharts = rightBlockChartKeys.map(key => (d: Datum) => d[key as keyof Datum])

  const colorMap = {
    aws: '#f0a8b4',
    google: '#7eb8d4',
    github: '#b89ef0',
  } as Record<string, string>

  const unknownColor = '#ccc'

  const rightBlockColorFunction = (key: string | number): string => {
    const valueFromMap = colorMap[key]
    return valueFromMap ?? unknownColor
  }

  // Styles
  const blockStyle = { display: 'flex', flexDirection: 'column', gap: 24, flex: 1, minWidth: 0 } as const
  const wrapperStyle = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' } as const

  return (
    <div style={wrapperStyle}>
      <div style={blockStyle}>
        <p>This block of charts uses a color function defined with <code>scaleOrdinal</code> from D3</p>
        <VisBulletLegend
          colorFunction={leftBlockColorScale}
          items={leftBlockChartKeys.map(key => ({ name: key, colorKey: key }))}
        />
        <VisXYContainer<Datum> data={data} colorFunction={leftBlockColorScale}>
          <VisLine x={d => d.x} y={accessorsLeftBlockCharts} colorKeys={leftBlockChartKeys}/>
          <VisGroupedBar x={d => d.x} y={accessorsLeftBlockCharts} colorKeys={leftBlockChartKeys} barPadding={0.3}/>
          <VisAxis type='x'/>
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
        <VisXYContainer<Datum> data={data.slice(0, 10)} colorFunction={leftBlockColorScale}>
          <VisGroupedBar x={d => d.x} y={accessorsLeftBlockCharts} colorKeys={leftBlockChartKeys} barPadding={0.1}/>
          <VisAxis type='x'/>
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
        <VisXYContainer<Datum> data={data} colorFunction={leftBlockColorScale}>
          <VisArea x={d => d.x} y={accessorsLeftBlockCharts} colorKeys={leftBlockChartKeys}/>
          <VisAxis type='x'/>
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
      </div>
      <div style={blockStyle}>
        <p>This block defines a custom color function that assigns the colors using a color map</p>
        <VisBulletLegend
          colorFunction={rightBlockColorFunction}
          items={rightBlockChartKeys.map(key => ({ name: key, colorKey: key }))}
        />
        <VisXYContainer<Datum> data={data} colorFunction={rightBlockColorFunction}>
          <VisStackedBar x={d => d.x} y={accessorsRightBlockCharts} colorKeys={rightBlockChartKeys} barPadding={0.05}/>
          <VisAxis type='x' />
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
        <VisXYContainer<Datum> data={data.slice(0, 15)} colorFunction={rightBlockColorFunction}>
          <VisScatter x={d => d.x} y={accessorsRightBlockCharts} colorKeys={rightBlockChartKeys}/>
          <VisAxis type='x' />
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
      </div>
    </div>
  )
}
