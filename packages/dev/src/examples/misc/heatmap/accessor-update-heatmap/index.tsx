import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { VisSingleContainer, VisHeatmap, VisHeatmapSelectors } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Heatmap Accessor Update'
export const subTitle = 'A component-level accessor change must repaint on its own'

type Datum = { column: number; value: number }

const numRows = 7
const numColumns = 10

// Module scope: `data` and every accessor except `color` keep a stable reference across
// re-renders, so a repaint can only be attributed to the new `color` accessor identity.
const data: Datum[] = Array.from({ length: numRows * numColumns }, (_, i) => ({
  column: Math.floor(i / numRows),
  value: (i % numRows) + 1,
}))

const value = (d: Datum): number => d.value

const selections = [
  { label: 'A', color: 'rgb(233, 71, 60)' },
  { label: 'B', color: 'rgb(58, 123, 232)' },
  { label: 'C', color: 'rgb(238, 174, 39)' },
]

const dimmed = 'rgb(217, 220, 225)'

// eslint-disable-next-line @typescript-eslint/naming-convention
const SelectionContext = createContext(0)

// The selection reaches the component through context, so `VisSingleContainer`'s own props
// (`height` and a `<HeatmapLayer/>` element with unchanged props) stay equal across the
// update. Only `VisHeatmap`'s `color` accessor changes identity.
// eslint-disable-next-line @typescript-eslint/naming-convention
const HeatmapLayer = ({ duration }: { duration?: number }): React.ReactNode => {
  const selection = useContext(SelectionContext)
  const color = useCallback(
    (d: Datum) => (d.column === selection ? selections[selection].color : dimmed),
    [selection]
  )

  return (
    <VisHeatmap<Datum>
      data={data}
      value={value}
      color={color}
      numRows={numRows}
      cellPadding={3}
      cellCornerRadius={3}
      duration={duration}
    />
  )
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [selection, setSelection] = useState(0)
  const [status, setStatus] = useState('measuring…')

  // Read the fills actually committed to the DOM and compare them to the expected ones. The container
  // defers its update by one frame and `render()` defers the paint by another, so poll rather than
  // sample once — the wall-clock length of a frame isn't something we can assume.
  useEffect(() => {
    const expected = selections[selection].color
    const deadline = 2000
    const step = 100
    let waited = 0

    setStatus('measuring…')
    const id = setInterval(() => {
      waited += step
      const cells = Array.from(document.querySelectorAll<SVGPathElement>(`.${VisHeatmapSelectors.cell}`))
      const highlighted = cells.filter(c => c.style.fill !== dimmed)
      const fills = Array.from(new Set(highlighted.map(c => c.style.fill)))
      const ok = fills.length === 1 && fills[0] === expected && highlighted.length === numRows

      if (ok) {
        clearInterval(id)
        setStatus(`PASS — ${highlighted.length} cells filled with ${expected} after ${waited}ms`)
      } else if (waited >= deadline) {
        clearInterval(id)
        setStatus(`FAIL — expected ${numRows}× ${expected}, got ${highlighted.length}× [${fills.join(', ') || 'none'}]`)
      }
    }, step)

    return () => clearInterval(id)
  }, [selection])

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {selections.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setSelection(i)}
            style={{ fontWeight: i === selection ? 700 : 400, borderLeft: `6px solid ${s.color}` }}
          >
            Selection {s.label}
          </button>
        ))}
        <span style={{ fontFamily: 'monospace' }}>{status}</span>
      </div>
      <SelectionContext.Provider value={selection}>
        <VisSingleContainer height={300}>
          <HeatmapLayer duration={props.duration} />
        </VisSingleContainer>
      </SelectionContext.Provider>
    </>
  )
}
