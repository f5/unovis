import { JSX } from 'solid-js'
import { VisAxis, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/solid'
import { FitMode, StackedBar } from '@unovis/ts'

import { barTooltip, data, stepColor, WaterfallDatum } from './data'

const WaterfallChart = (): JSX.Element => {
  // Every bar starts where the previous one ended, so `baseline` carries the running total
  const x = (d: WaterfallDatum): number => d.index
  const y = (d: WaterfallDatum): number => d.value
  const baseline = (d: WaterfallDatum): number => d.start

  return (
    <div>
      <h3>FY Income Statement Bridge</h3>
      <VisXYContainer data={data} height={480}>
        <VisStackedBar
          x={x}
          y={y}
          baseline={baseline}
          color={stepColor}
          barPadding={0.3}
          barMinHeight1Px
        />
        <VisTooltip triggers={{ [StackedBar.selectors.bar]: barTooltip }}/>
        <VisAxis
          type='x'
          tickValues={data.map(d => d.index)}
          tickFormat={(tick: number | Date) => data[+tick]?.label ?? ''}
          tickTextWidth={80}
          tickTextFitMode={FitMode.Wrap}
        />
        <VisAxis
          type='y'
          label='$ millions'
          tickFormat={(tick: number | Date) => `${+tick}`}
        />
      </VisXYContainer>
    </div>
  )
}

export default WaterfallChart
