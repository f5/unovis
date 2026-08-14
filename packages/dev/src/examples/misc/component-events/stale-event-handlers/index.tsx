import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Scatter } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisScatter } from '@unovis/react'

export const title = 'Component Events: Stale Handlers'
export const subTitle = 'Handler freshness after a config update'

type Datum = { x: number; y: number }

/** How often the surrounding app re-renders, emulating a dashboard-wide cross-filter.
 * Any interval below `ComponentCore`'s 500ms event re-bind throttle keeps the throttle window
 * permanently occupied, which is when a stale handler becomes observable. */
const RE_RENDER_INTERVAL_MS = 100

/** Kept at module scope so the point test ids stay stable across re-renders. */
const pointAttributes = {
  [Scatter.selectors.point]: {
    visScatterPointE2eTestId: (d: Datum) => `stale-events-point-${d.x}`,
  },
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }

export const component = (): React.ReactNode => {
  const data = useMemo<Datum[]>(() => Array.from({ length: 6 }, (_, i) => ({ x: i, y: 1 })), [])

  const [renderCount, setRenderCount] = useState(0)
  const [reRenderBurst, setReRenderBurst] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [maxHandlerLag, setMaxHandlerLag] = useState(0)
  const [log, setLog] = useState<string[]>([])

  // Always holds the values of the most recent render, so that a handler can compare what it
  // captured against what is actually current at the moment of the click.
  const currentRef = useRef({ renderCount, selected })
  useEffect(() => { currentRef.current = { renderCount, selected } })

  useEffect(() => {
    if (!reRenderBurst) return
    const timer = setInterval(() => setRenderCount(c => c + 1), RE_RENDER_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [reRenderBurst])

  // Re-created on every render, capturing `renderCount` and `selected` from *this* render.
  // A fresh closure is handed to Unovis through `config.events` on every config update, so the
  // handler that actually runs should always be the newest one.
  const onPointClick = (d: Datum, event: MouseEvent, i: number): void => {
    const current = currentRef.current
    const handlerLag = current.renderCount - renderCount
    setMaxHandlerLag(m => Math.max(m, handlerLag))

    // Read-modify-write against the captured `selected`: when the handler that runs is stale it
    // compares against a selection that has already changed, so clicking an already selected
    // point re-selects it instead of clearing the selection.
    const next = selected === i ? null : i
    setSelected(next)

    setLog(prev => [
      `point ${i} — handler built on render #${renderCount}, current render #${current.renderCount} ` +
      `(lag ${handlerLag}); it saw selected=${String(selected)} while the real value was ` +
      `${String(current.selected)}, so it set selected=${String(next)}`,
      ...prev,
    ].slice(0, 6))
  }

  const reset = (): void => {
    setMaxHandlerLag(0)
    setLog([])
    setSelected(null)
  }

  return (
    <div>
      <p>
        Every render passes a brand new <code>click</code> closure through the <code>events</code> config.
        The closure reports which render built it, so a non-zero lag means Unovis invoked a handler from an
        earlier config. Click a point a few times while the re-render burst is running.
      </p>

      <div style={rowStyle}>
        <label>
          <input
            type='checkbox'
            checked={reRenderBurst}
            onChange={e => setReRenderBurst(e.target.checked)}
          />
          {` Re-render every ${RE_RENDER_INTERVAL_MS}ms (emulates a dashboard-wide cross-filter)`}
        </label>
        <button onClick={reset}>Reset</button>
      </div>

      <div style={rowStyle}>
        <span>render #<b data-test-id='render-count'>{renderCount}</b></span>
        <span>selected: <b data-test-id='selected'>{String(selected)}</b></span>
        <span style={{ color: maxHandlerLag > 0 ? '#e74c3c' : '#2ecc71' }}>
          worst handler lag: <b data-test-id='max-handler-lag'>{maxHandlerLag}</b>
          {maxHandlerLag > 0 ? ' renders behind — stale handler' : ' — handler is current'}
        </span>
      </div>

      <VisXYContainer<Datum> data={data} height={200} yDomain={[0, 2]}>
        <VisScatter
          x={(d: Datum) => d.x}
          y={(d: Datum) => d.y}
          size={40}
          color={(d: Datum) => (d.x === selected ? '#e74c3c' : '#3498db')}
          attributes={pointAttributes}
          events={{
            [Scatter.selectors.point]: {
              click: onPointClick,
            },
          }}
          duration={0}
        />
        <VisAxis type='x' />
      </VisXYContainer>

      <ol style={{ fontFamily: 'monospace', fontSize: 12 }}>
        {log.map((entry, i) => <li key={`${log.length}-${i}`}>{entry}</li>)}
      </ol>
    </div>
  )
}
