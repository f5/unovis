import React from 'react'
import { VisSingleContainer, VisHeatmap } from '@unovis/react'
import { Sizing } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Fixed Cell Size & Extend Sizing'
export const subTitle = 'Set `cellSize` and `Sizing.Extend` on the container to size the grid intrinsically'

const NUM_ROWS = 7
const NUM_COLUMNS = 16
const CELL_SIZE = 14
const CELL_PADDING = 3

const rnd = (i: number): number => {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const data: number[] = Array.from({ length: NUM_ROWS * NUM_COLUMNS }, (_, i) => Math.round(rnd(i) * 20))

const panelStyle: React.CSSProperties = {
  padding: 12,
  border: '1px dashed var(--vis-color-grey)',
  borderRadius: 6,
}

const captionStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 13,
  opacity: 0.75,
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 320 }}>
      <section style={panelStyle}>
        <p style={captionStyle}>
          Stretch (default) — cells fill a fixed 300×96 container
        </p>
        <VisSingleContainer height={96} width={300}>
          <VisHeatmap<number>
            data={data}
            value={d => d}
            numRows={NUM_ROWS}
            cellPadding={CELL_PADDING}
            cellCornerRadius={2}
            duration={props.duration}
          />
        </VisSingleContainer>
      </section>

      <section style={panelStyle}>
        <p style={captionStyle}>
          {`Fixed cellSize={${CELL_SIZE}} with Sizing.Extend — container grows to fit the grid`}
        </p>
        <VisSingleContainer sizing={Sizing.Extend}>
          <VisHeatmap<number>
            data={data}
            value={d => d}
            numRows={NUM_ROWS}
            cellSize={CELL_SIZE}
            cellPadding={CELL_PADDING}
            cellCornerRadius={2}
            duration={props.duration}
          />
        </VisSingleContainer>
      </section>

      <section style={panelStyle}>
        <p style={captionStyle}>
          Rectangular cells `[18, 10]` with `Sizing.FitWidth` — scales down inside the panel
        </p>
        <VisSingleContainer sizing={Sizing.FitWidth}>
          <VisHeatmap<number>
            data={data}
            value={d => d}
            numRows={NUM_ROWS}
            cellSize={[18, 10]}
            cellPadding={CELL_PADDING}
            cellCornerRadius={2}
            duration={props.duration}
          />
        </VisSingleContainer>
      </section>
    </div>
  )
}
