import { SingleContainer, NestedDonut, NestedDonutSegment } from '@unovis/ts'
import { colors, data, Datum } from './data'

import './styles.css'

const container = document.getElementById('vis-container')
container.classList.add('sunburst')

const chart = new SingleContainer(container, {
  component: new NestedDonut<Datum>({
    direction: 'outwards',
    hideOverflowingSegmentLabels: false,
    layers: [
      (d: Datum) => d.type,
      (d: Datum) => d.group,
      (d: Datum) => d.subgroup,
      (d: Datum) => d.description,
      (d: Datum) => d.item,
    ],
    layerSettings: { width: '6vmin' },
    segmentColor: (d: NestedDonutSegment<Datum>) => colors.get(d.data.key),
  }),
}, data)
