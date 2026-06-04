import React, { useEffect, useMemo, useState } from 'react'
import { VisXYContainer, VisBoxplot, VisAxis } from '@unovis/react'

import { BoxplotDataRecord, generateBoxplotDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { WithOptional } from '@unovis/ts/types/misc'

export const title = 'Partial Data & Updates'
export const subTitle = 'Missing median / quartiles / whiskers'

// Parts can be absent, so every accessor field is optional here
type PartialBoxplotRecord = WithOptional<BoxplotDataRecord, 'median' | 'quartiles' | 'whiskers'>

const base = generateBoxplotDataRecords(6)

// Fixed Y domain so the scale stays put and you can watch the individual parts fade in/out
const yDomain: [number, number] = [
  Math.min(...base.map(d => d.whiskers[0])),
  Math.max(...base.map(d => d.whiskers[1])),
]

// Each phase strips different parts from some of the boxes
const phases: { label: string; fn: (d: BoxplotDataRecord, i: number) => PartialBoxplotRecord }[] = [
  { label: 'Full data', fn: d => d },
  { label: 'Even boxes: no whiskers', fn: (d, i) => (i % 2 === 0 ? { ...d, whiskers: undefined } : d) },
  { label: 'Odd boxes: no median', fn: (d, i) => (i % 2 === 1 ? { ...d, median: undefined } : d) },
  { label: 'Every 3rd box: hidden (no quartiles)', fn: (d, i) => (i % 3 === 0 ? { x: d.x } : d) },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setPhase(p => (p + 1) % phases.length), 1600)
    return () => clearInterval(timer)
  }, [])

  const data = useMemo<PartialBoxplotRecord[]>(() => base.map((d, i) => phases[phase].fn(d, i)), [phase])

  return (
    <div>
      <p style={{ marginBottom: 8 }}><b>Phase:</b> {phases[phase].label}</p>
      <VisXYContainer data={data} height={400} yDomain={yDomain} margin={{ top: 5, left: 5 }}>
        <VisBoxplot<PartialBoxplotRecord>
          x={d => d.x}
          median={d => d.median}
          quartiles={d => d.quartiles}
          whiskers={d => d.whiskers}
          duration={props.duration}
        />
        <VisAxis type='x' numTicks={6} duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </div>
  )
}
