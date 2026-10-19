import React, { useEffect, useMemo, useState } from 'react'
import { VisXYContainer, VisLine, VisArea, VisAxis } from '@unovis/react'
import { CurveType } from '@unovis/ts'

// Constants
import {
  DEFAULT_SAMPLE_INTERVAL,
  DEFAULT_WINDOW_DURATION,
  FRAME_INTERVAL,
  CHART_HEIGHT,
  CHART_MARGIN,
  SERIES_COLORS,
  Y_DOMAIN,
  STREAMING_CONFIGURATIONS,
} from './constants'

// Styles
import s from './style.module.css'

type StreamingDatum = { time: number; value: number; secondary: number }
type StreamingChartProps = {
  elapsed: number;
  sampleInterval: number;
  windowDuration: number;
  smooth: boolean;
  curveType: CurveType;
  stacked: boolean;
  configuration: typeof STREAMING_CONFIGURATIONS[number];
}

export const title = 'Streaming Line and Area'
export const subTitle = 'Moving time windows, individual samples and batches'

function x (datum: StreamingDatum): number { return datum.time }
function y (datum: StreamingDatum): number { return datum.value }
function secondaryY (datum: StreamingDatum): number { return datum.secondary }
function formatTime (tick: number | Date): string { return `${(Number(tick) / 1000).toFixed(1)}s` }

export function StreamingChart (props: StreamingChartProps): React.ReactElement {
  const { elapsed, sampleInterval, windowDuration, smooth, curveType, stacked, configuration } = props
  const batchDuration = sampleInterval * configuration.batchSize
  const receivedIndex = Math.floor(elapsed / batchDuration) * configuration.batchSize
  const data = useMemo(() => {
    // Keep points outside both edges so clipping reveals the stream without changing its shape.
    const count = Math.ceil(windowDuration / sampleInterval) + configuration.batchSize + 3
    return Array.from({ length: count }, (_, i): StreamingDatum => {
      const time = (receivedIndex - count + i + 1) * sampleInterval
      const seconds = time / 1000
      return {
        time,
        value: 40 + 16 * Math.sin(seconds * 0.8) + 7 * Math.cos(seconds * 2.1),
        secondary: 20 + 8 * Math.sin(seconds * 0.5 + 1),
      }
    })
  }, [receivedIndex, sampleInterval, windowDuration, configuration.batchSize])

  // A one-batch delay keeps the next segment available as the smooth window reveals it.
  const end = smooth ? elapsed - batchDuration : receivedIndex * sampleInterval
  const xDomain: [number, number] = [end - windowDuration, end]
  const yAccessors = stacked ? [y, secondaryY] : y

  return (
    <section className={s.chart}>
      <h3>{configuration.title}</h3>
      <p>
        {configuration.batchSize} {configuration.batchSize === 1 ? 'point' : 'points'} every {batchDuration} ms
        {' · '}{smooth ? `${batchDuration} ms display buffer` : 'No display buffer'}
        {' · '}Latest received: {receivedIndex * sampleInterval / 1000}s
      </p>
      <VisXYContainer<StreamingDatum>
        data={data}
        height={CHART_HEIGHT}
        xDomain={xDomain}
        yDomain={Y_DOMAIN}
        autoMargin={false}
        margin={CHART_MARGIN}
        duration={0}
      >
        {configuration.area
          ? <VisArea x={x} y={yAccessors} curveType={curveType} color={SERIES_COLORS} opacity={0.3} line lineColor={SERIES_COLORS} duration={0}/>
          : <VisLine x={x} y={yAccessors} curveType={curveType} color={SERIES_COLORS} duration={0}/>
        }
        <VisAxis type='x' numTicks={5} tickFormat={formatTime} duration={0}/>
        <VisAxis type='y' numTicks={3} duration={0}/>
      </VisXYContainer>
    </section>
  )
}

export const component = (): React.ReactNode => {
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sampleInterval, setSampleInterval] = useState(DEFAULT_SAMPLE_INTERVAL)
  const [windowDuration, setWindowDuration] = useState(DEFAULT_WINDOW_DURATION)
  const [smooth, setSmooth] = useState(true)
  const [curveType, setCurveType] = useState(CurveType.MonotoneX)
  const [stacked, setStacked] = useState(false)

  useEffect(() => {
    if (paused) return
    let previous = performance.now()
    let frame: number
    const advance = (now: number): void => {
      const delta = now - previous
      if (delta >= FRAME_INTERVAL) {
        setElapsed(current => current + delta)
        previous = now
      }
      frame = requestAnimationFrame(advance)
    }
    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [paused])

  return (
    <div className={s.example}>
      <h2>Streaming Line and Area</h2>
      <p>Fixed timestamps and a moving X domain carry the data from right to left. Smooth scrolling buffers one batch; discrete scrolling displays each arrival immediately.</p>
      <div className={s.controls}>
        <label>Sample interval{' '}
          <select value={sampleInterval} onChange={event => setSampleInterval(Number(event.target.value))}>
            <option value={250}>250 ms</option>
            <option value={500}>500 ms</option>
            <option value={1000}>1 second</option>
          </select>
        </label>
        <label>Visible window{' '}
          <select value={windowDuration} onChange={event => setWindowDuration(Number(event.target.value))}>
            <option value={10000}>10 seconds</option>
            <option value={20000}>20 seconds</option>
            <option value={40000}>40 seconds</option>
          </select>
        </label>
        <label>Motion{' '}
          <select value={smooth ? 'smooth' : 'discrete'} onChange={event => setSmooth(event.target.value === 'smooth')}>
            <option value='smooth'>Smooth scrolling</option>
            <option value='discrete'>Discrete updates</option>
          </select>
        </label>
        <label>Curve{' '}
          <select value={curveType} onChange={event => setCurveType(event.target.value as CurveType)}>
            <option value={CurveType.MonotoneX}>Monotone X</option>
            <option value={CurveType.Linear}>Linear</option>
            <option value={CurveType.StepAfter}>Step after</option>
          </select>
        </label>
        <label><input type='checkbox' checked={stacked} onChange={event => setStacked(event.target.checked)}/> Two series / stacked areas</label>
        <button onClick={() => setPaused(current => !current)}>{paused ? 'Resume' : 'Pause'}</button>
        <button onClick={() => setElapsed(0)}>Reset</button>
      </div>
      <div className={s.charts}>
        {STREAMING_CONFIGURATIONS.map(configuration => (
          <StreamingChart
            key={configuration.title}
            configuration={configuration}
            elapsed={elapsed}
            sampleInterval={sampleInterval}
            windowDuration={windowDuration}
            smooth={smooth}
            curveType={curveType}
            stacked={stacked}
          />
        ))}
      </div>
    </div>
  )
}
