/** A single line of the bridge. */
export type BridgeStep = {
  label: string;
  /** Signed contribution of the step. For totals and subtotals it's derived from the running sum,
   *  unless an absolute value is given (as for the opening figure). */
  value?: number;
  /** Totals and subtotals are absolute — they get drawn from zero rather than from the previous step. */
  isTotal?: boolean;
}

export type WaterfallDatum = {
  index: number;
  label: string;
  /** The signed length of the bar */
  value: number;
  /** The value the bar starts from, i.e. the running total before this step */
  start: number;
  isTotal: boolean;
}

/** Illustrative full-year income statement, in millions of dollars. */
export const steps: BridgeStep[] = [
  { label: 'Revenue', value: 1240, isTotal: true },
  { label: 'Cost of revenue', value: -310 },
  { label: 'Gross profit', isTotal: true },
  { label: 'R&D', value: -268 },
  { label: 'Sales & marketing', value: -352 },
  { label: 'General & admin', value: -145 },
  { label: 'Operating income', isTotal: true },
  { label: 'Other income', value: 18 },
  { label: 'Income tax', value: -41 },
  { label: 'Net income', isTotal: true },
]

/**
 * Turns signed steps into floating bars. Every regular step starts where the previous one ended,
 * which is exactly what `StackedBar`'s `baseline` accessor consumes. Totals and subtotals are
 * absolute, so they start at zero and run up to the accumulated value.
 */
export function toWaterfall (steps: BridgeStep[]): WaterfallDatum[] {
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

export const data = toWaterfall(steps)

export const colors = {
  total: '#64748b',
  increase: '#1acb9a',
  decrease: '#FF4F4E',
}

export function stepColor (d: WaterfallDatum): string {
  if (d.isTotal) return colors.total
  return d.value >= 0 ? colors.increase : colors.decrease
}

export function formatValue (d: WaterfallDatum): string {
  const sign = !d.isTotal && d.value >= 0 ? '+' : d.value < 0 ? '−' : ''
  return `${sign}$${Math.abs(d.value).toLocaleString()}M`
}

/**
 * `Tooltip` triggers keyed on `StackedBar.selectors.bar` receive the bar's internal render record
 * rather than the data row, so the row has to be read off `.datum`.
 */
export function barTooltip (bar: { datum: WaterfallDatum }): string {
  const d = bar.datum
  const range = d.isTotal ? '' : `<div style="color: #666">from $${d.start}M to $${d.start + d.value}M</div>`
  return `<div style="font-size: 12px"><b>${d.label}</b>: ${formatValue(d)}${range}</div>`
}
