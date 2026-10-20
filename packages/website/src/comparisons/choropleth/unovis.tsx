import React, { useMemo } from 'react'
import { MapProjection, Scale, TopoJSONMap } from '@unovis/ts'
import { VisSingleContainer, VisTopoJSONMap, VisTooltip, VisRollingPinLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import {
  ChoroplethData,
  AreaDatum,
  PointDatum,
  LinkDatum,
  worldMap,
  usersDomain,
  formatUsers,
  formatTraffic,
  getTraffic,
  trafficRadius,
} from './data'
import { BLUES } from './constants'

const colorScale = Scale.scaleQuantize<string>().domain(usersDomain).range(BLUES)

const tooltipTriggers = {
  [TopoJSONMap.selectors.feature]: (d: { properties: { name: string }; data?: AreaDatum }) =>
    `<b>${d.properties.name}</b><br/>${d.data ? formatUsers(d.data.users) : 'No data'}`,
  [TopoJSONMap.selectors.point]: (d: { properties: PointDatum }) => `<b>${d.properties.name}</b> data center`,
  [TopoJSONMap.selectors.link]: (l: { source: PointDatum; target: PointDatum; traffic: number }) =>
    `${l.source.name} → ${l.target.name}<br/>${formatTraffic(l.traffic)}`,
}

export default function UnovisChoroplethMap ({ data, preset }: ChartProps<ChoroplethData>): JSX.Element {
  const points = useMemo(() => new Map(data.points.map(p => [p.id, p])), [data])
  const projection = useMemo(() => preset === 'mercator' ? MapProjection.Mercator() : undefined, [preset])

  return (
    <>
      <VisRollingPinLegend rects={BLUES} leftLabelText={`${usersDomain[0]}M`} rightLabelText={`${usersDomain[1]}M users`}/>
      {/* The map fits its projection on the first render only, so a new projection needs a new container */}
      <VisSingleContainer key={preset === 'mercator' ? 'mercator' : undefined} data={data} height={416}>
        <VisTopoJSONMap
          topojson={worldMap}
          projection={projection}
          areaColor={(a: AreaDatum) => colorScale(a.users)}
          areaLabel={preset === 'labels' ? (a: AreaDatum) => a.name : undefined}
          pointRadius={(p: PointDatum) => preset === 'traffic' ? trafficRadius(getTraffic(data.links, p.id)) : 8}
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
