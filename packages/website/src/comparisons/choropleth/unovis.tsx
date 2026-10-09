import React, { useMemo } from 'react'
import { Scale, TopoJSONMap } from '@unovis/ts'
import { VisSingleContainer, VisTopoJSONMap, VisTooltip, VisRollingPinLegend } from '@unovis/react'

import { ChoroplethData, AreaDatum, PointDatum, LinkDatum, worldMap, usersDomain, formatUsers, formatTraffic } from './data'
import { BLUES } from './constants'

const colorScale = Scale.scaleQuantize<string>().domain(usersDomain).range(BLUES)

const tooltipTriggers = {
  [TopoJSONMap.selectors.feature]: (d: { properties: { name: string }; data?: AreaDatum }) =>
    `<b>${d.properties.name}</b><br/>${d.data ? formatUsers(d.data.users) : 'No data'}`,
  [TopoJSONMap.selectors.point]: (d: { properties: PointDatum }) => `<b>${d.properties.name}</b> data center`,
  [TopoJSONMap.selectors.link]: (l: { source: PointDatum; target: PointDatum; traffic: number }) =>
    `${l.source.name} → ${l.target.name}<br/>${formatTraffic(l.traffic)}`,
}

export default function UnovisChoroplethMap ({ data }: { data: ChoroplethData }): JSX.Element {
  const points = useMemo(() => new Map(data.points.map(p => [p.id, p])), [data])

  return (
    <>
      <VisRollingPinLegend rects={BLUES} leftLabelText={`${usersDomain[0]}M`} rightLabelText={`${usersDomain[1]}M users`}/>
      <VisSingleContainer data={data} height={416}>
        <VisTopoJSONMap
          topojson={worldMap}
          areaColor={(a: AreaDatum) => colorScale(a.users)}
          pointBottomLabel={(p: PointDatum) => p.name}
          linkWidth={(l: LinkDatum) => 1 + l.traffic / 100}
          enableFlowAnimation
          sourceLongitude={(l: LinkDatum) => points.get(l.source).longitude}
          sourceLatitude={(l: LinkDatum) => points.get(l.source).latitude}
          targetLongitude={(l: LinkDatum) => points.get(l.target).longitude}
          targetLatitude={(l: LinkDatum) => points.get(l.target).latitude}
        />
        <VisTooltip triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </>
  )
}
