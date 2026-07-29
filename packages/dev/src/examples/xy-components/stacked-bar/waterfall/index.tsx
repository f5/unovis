import React, { useRef } from 'react'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Stacked Bar: Waterfall'
export const subTitle = 'Baseline as a running total'

type WaterfallStep = {
  label: string;
  /** Signed contribution of the step. Omitted for totals, which take the running total instead. */
  value?: number;
  isTotal?: boolean;
}

type WaterfallDatum = {
  index: number;
  label: string;
  /** The signed length of the bar */
  value: number;
  /** The value the bar starts from */
  start: number;
  isTotal: boolean;
}

const steps: WaterfallStep[] = [
  { label: 'Q3 ARR', value: 412, isTotal: true },
  { label: 'New business', value: 148 },
  { label: 'Expansion', value: 87 },
  { label: 'Price uplift', value: 24 },
  { label: 'FX impact', value: 0 },
  { label: 'Downgrades', value: -39 },
  { label: 'Churn', value: -96 },
  { label: 'Q4 ARR', isTotal: true },
]

/** Turns signed steps into floating bars: every step starts where the previous one ended,
 *  while totals are absolute and get drawn from zero. */
function buildWaterfall (steps: WaterfallStep[]): WaterfallDatum[] {
  let running = 0
  return steps.map((step, index) => {
    if (step.isTotal) {
      running = step.value ?? running
      return { index, label: step.label, value: running, start: 0, isTotal: true }
    }

    const start = running
    running += step.value ?? 0
    return { index, label: step.label, value: step.value ?? 0, start, isTotal: false }
  })
}

/** Slate for totals, green for gains, red for losses */
const stepColor = (d: WaterfallDatum): string =>
  d.isTotal ? '#6d7f9d' : (d.value >= 0 ? '#1acb9a' : '#FF4F4E')

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = buildWaterfall(steps)

  return (
    <VisXYContainer<WaterfallDatum> data={data} margin={{ top: 5, left: 5 }} height={400}>
      <VisStackedBar
        x={(d: WaterfallDatum) => d.index}
        y={(d: WaterfallDatum) => d.value}
        baseline={(d: WaterfallDatum) => d.start}
        color={stepColor}
        barPadding={0.3}
        barMinHeight1Px
        roundedCorners={2}
        duration={props.duration}
      />
      <VisAxis
        type='x'
        tickValues={data.map(d => d.index)}
        tickFormat={(tick: number | Date) => data[+tick]?.label ?? ''}
        duration={props.duration}
      />
      <VisAxis
        type='y'
        tickFormat={(tick: number | Date) => `$${+tick}k`}
        duration={props.duration}
      />
      {/* Crosshair keeps its own `color` accessor — without it the snapped circle falls back to
          the default palette and doesn't match the bar it's sitting on */}
      <VisCrosshair
        color={stepColor}
        template={(d: WaterfallDatum) => `${d.label}: ${!d.isTotal && d.value >= 0 ? '+' : ''}$${d.value}k`}
      />
      <VisTooltip ref={tooltipRef} />
    </VisXYContainer>
  )
}
