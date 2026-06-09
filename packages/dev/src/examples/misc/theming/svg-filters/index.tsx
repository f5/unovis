import React from 'react'
import { Line, Scatter, StackedBar } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisStackedBar, VisBulletLegend, VisCrosshair, VisLine, VisScatter } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Visual Effects (SVG Filters)'
export const subTitle = 'Glow & bevel via svgDefs + attributes'

// Custom SVG filters injected into the container via `svgDefs`.
// Both are built on `SourceGraphic`, so they're a pure rendering overlay that enhances
// the rendered shapes without changing their colors.
const svgDefs = `
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <filter id="bevel" x="-20%" y="-20%" width="140%" height="140%">
    <!-- Inner shadow for depth -->
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
    <feOffset in="blur" dx="0" dy="2" result="offsetBlur"/>
    <feComposite in="SourceAlpha" in2="offsetBlur" operator="out" result="innerShadowMask"/>
    <feFlood flood-color="black" flood-opacity="0.4" result="shadowColor"/>
    <feComposite in="shadowColor" in2="innerShadowMask" operator="in" result="shadow"/>
    <!-- Top highlight for the embossed look -->
    <feOffset in="SourceAlpha" dx="0" dy="-2" result="highlightOffset"/>
    <feComposite in="SourceAlpha" in2="highlightOffset" operator="out" result="highlightMask"/>
    <feFlood flood-color="white" flood-opacity="0.5" result="highlightColor"/>
    <feComposite in="highlightColor" in2="highlightMask" operator="in" result="highlight"/>
    <!-- Merge source + shadow + highlight, then clip everything to the shape -->
    <feMerge result="merged">
      <feMergeNode in="SourceGraphic"/>
      <feMergeNode in="shadow"/>
      <feMergeNode in="highlight"/>
    </feMerge>
    <feComposite in="merged" in2="SourceGraphic" operator="in"/>
  </filter>
`

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  type Datum = { x: number; azure: number; aws: number; google: number };
  const data: Datum[] = Array(20).fill(0).map((_, i) => {
    const t = i / 5
    return {
      x: i,
      azure: 80 + 15 * Math.sin(t) * t + i * 2,
      aws: 150 + 80 * Math.sin(t * 0.7) + i * 1.5,
      google: 200 + 60 * Math.cos(t * 1.2) + i * 3,
    }
  })

  const keys = ['azure', 'aws', 'google']
  const accessors = keys.map(key => (d: Datum) => d[key as keyof Datum])

  // Styles
  const blockStyle = { display: 'flex', flexDirection: 'column', gap: 24, flex: 1, minWidth: 0 } as const
  const wrapperStyle = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' } as const

  return (
    <div style={wrapperStyle}>
      <div style={blockStyle}>
        <p>A <code>bevel</code> filter (inner shadow + top highlight) applied to bars via{' '}
          <code>attributes</code>. The filter is a pure overlay — it adds depth without
          changing the chart&apos;s colors.</p>
        <VisXYContainer<Datum> data={data} svgDefs={svgDefs}>
          <VisStackedBar
            x={d => d.x}
            y={accessors}
            barPadding={0.1}
            attributes={{ [StackedBar.selectors.bar]: { filter: 'url(#bevel)' } }}
            duration={props.duration}
          />
          <VisAxis type='x'/>
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
      </div>
      <div style={blockStyle}>
        <p>A <code>glow</code> filter applied to lines and scatter points via{' '}
          <code>attributes</code> for a neon dashboard look.</p>
        <VisBulletLegend
          items={keys.map(key => ({ name: key }))}
        />
        <VisXYContainer<Datum> data={data} svgDefs={svgDefs}>
          <VisLine
            x={d => d.x}
            y={accessors}
            attributes={{ [Line.selectors.line]: { filter: 'url(#glow)' } }}
            duration={props.duration}
          />
          <VisScatter
            x={d => d.x}
            y={accessors}
            attributes={{ [Scatter.selectors.point]: { filter: 'url(#glow)' } }}
            duration={props.duration}
          />
          <VisAxis type='x'/>
          <VisCrosshair template={(d: Datum) => `x: ${d.x}`} />
        </VisXYContainer>
      </div>
    </div>
  )
}
