import { JSX } from 'solid-js'
import { NestedDonutSegment } from '@unovis/ts'
import { VisNestedDonut, VisSingleContainer } from '@unovis/solid'

import './styles.css'

import { colors, data, Datum } from './data'

const SunburstNestedDonut = (): JSX.Element => {
  const layers = [
    (d: Datum) => d.type,
    (d: Datum) => d.group,
    (d: Datum) => d.subgroup,
    (d: Datum) => d.description,
    (d: Datum) => d.item,
  ]
  const segmentColor = (d: NestedDonutSegment<Datum>) => colors.get(d.data.key)

  return (
    <VisSingleContainer data={data} class='sunburst'>
      <VisNestedDonut
        direction='outwards'
        hideOverflowingSegmentLabels={false}
        layerSettings={{ width: '6vmin' }}
        layers={layers}
        segmentColor={segmentColor}
      />
    </VisSingleContainer>
  )
}

export default SunburstNestedDonut
