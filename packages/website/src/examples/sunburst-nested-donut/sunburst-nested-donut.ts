import { SingleContainer, NestedDonut, NestedDonutSegment } from '@unovis/ts'
import { colors, data, Datum } from './data'

const container = document.getElementById('vis-container')
const chart = new SingleContainer(container, {
  component: new NestedDonut<Datum>({
    direction: 'outwards',
    hideSegmentLabels: false,
    layers: [
      (d: Datum) => d.type,
      (d: Datum) => d.group,
      (d: Datum) => d.subgroup,
      (d: Datum) => d.description,
      (d: Datum) => d.item,
    ],
    layerSettings: { width: 100, rotateLabels: true },
    segmentColor: (d: NestedDonutSegment<Datum>) => colors.get(d.data.key),
  }),
  height: 1000,
}, data)
