import React, { useCallback, useMemo } from 'react'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { NestedDonutSegment } from '@unovis/ts'
import { colors, data, Datum } from './data'

export default function SunburstChart (): JSX.Element {
  return (
    <VisSingleContainer data={data} height={1000}>
      <VisNestedDonut
        hideSegmentLabels={false}
        layers={useMemo(() => [
          (d: Datum) => d.type,
          (d: Datum) => d.group,
          (d: Datum) => d.subgroup,
          (d: Datum) => d.description,
          (d: Datum) => d.item,
        ], [])}
        layerSettings={{ width: 100, rotateLabels: true }}
        segmentColor={useCallback((d: NestedDonutSegment<Datum>) => colors.get(d.data.key), [])}
        direction='outwards'/>
    </VisSingleContainer>
  )
}
