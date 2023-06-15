import React, { useCallback, useMemo } from 'react'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { NestedDonutSegment } from '@unovis/ts'
import { colors, data, Datum } from './data'

import './styles.css'

export default function SunburstChart (): JSX.Element {
  return (
    <VisSingleContainer data={data} className='sunburst'>
      <VisNestedDonut
        direction='outwards'
        hideOverflowingSegmentLabels={false}
        layers={useMemo(() => [
          (d: Datum) => d.type,
          (d: Datum) => d.group,
          (d: Datum) => d.subgroup,
          (d: Datum) => d.description,
          (d: Datum) => d.item,
        ], [])}
        layerSettings={{ width: '6vmin' }}
        segmentColor={useCallback((d: NestedDonutSegment<Datum>) => colors.get(d.data.key), [])}
      />
    </VisSingleContainer>
  )
}
