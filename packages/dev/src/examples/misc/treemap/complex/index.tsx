import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { FitMode, TrimMode } from '@unovis/ts'

import data from './data.json'

export const title = 'Treemap: SaaS Events Data'
export const subTitle = 'Event types and names by count'

type EventDatum = {
  eventType: string;
  eventName: string;
  numEvents: number;
}

export const component = (): React.ReactElement => (
  <VisSingleContainer height={600}>
    <VisTreemap<EventDatum>
      data={data as EventDatum[]}
      value={(d: EventDatum) => d.numEvents}
      layers={[
        (d: EventDatum) => d.eventType,
        (d: EventDatum) => d.eventName,
      ]}
      duration={600}
      tilePadding={2}
      tilePaddingTop={20}
      tileShowHtmlTooltip={false}
      labelInternalNodes
      labelOffsetX={4}
      labelOffsetY={4}
      labelFit={FitMode.Wrap}
      labelTrimMode={TrimMode.Middle}
      tileBorderRadius={2}
      tileBorderRadiusFactor={0.125}
      enableLightnessVariance={false}
      enableTileLabelFontSizeVariation={false}
      tileLabelSmallFontSize={8}
      tileLabelMediumFontSize={12}
      tileLabelLargeFontSize={22}
      lightnessVariationAmount={0.08}
      minTileSizeForLabel={10}
    />
  </VisSingleContainer>
)
