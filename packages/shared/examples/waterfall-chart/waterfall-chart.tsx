import React from 'react'
import { VisAxis, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/react'
import { FitMode, StackedBar } from '@unovis/ts'

import { barTooltip, data, stepColor, WaterfallDatum } from './data'

export default function WaterfallChart (): JSX.Element {
  return (
    <>
      <h3>FY Income Statement Bridge</h3>
      <VisXYContainer<WaterfallDatum> data={data} height={480}>
        <VisStackedBar
          x={(d: WaterfallDatum) => d.index}
          y={(d: WaterfallDatum) => d.value}
          baseline={(d: WaterfallDatum) => d.start}
          color={stepColor}
          barPadding={0.3}
          barMinHeight1Px
        />
        <VisTooltip triggers={{ [StackedBar.selectors.bar]: barTooltip }}/>
        <VisAxis
          type="x"
          tickValues={data.map(d => d.index)}
          tickFormat={(tick: number | Date) => data[+tick]?.label ?? ''}
          tickTextWidth={80}
          tickTextFitMode={FitMode.Wrap}
        />
        <VisAxis
          type="y"
          label="$ millions"
          tickFormat={(tick: number | Date) => `${+tick}`}
        />
      </VisXYContainer>
    </>
  )
}
