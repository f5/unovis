import React, { useMemo, useState } from 'react'
import { LeafletMap, Tooltip } from '@unovis/ts'
import { VisLeafletMap, VisBulletLegend } from '@unovis/react'

import { DataRecord, MagnitudeClass, magnitudeClasses, getMagnitudeClass, getRadius } from './data'
import { MAP_STYLE, MAP_STYLE_DARK, MAP_ATTRIBUTION } from './constants'

// Every point gets a count of 1 in its magnitude class, so clusters show the mix of classes as a donut
const colorMap = Object.fromEntries(magnitudeClasses.map((c, i) => [c.key, { color: `var(--vis-color${i})` }]))

export default function UnovisLeafletMap ({ data }: { data: DataRecord[] }): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<MagnitudeClass, boolean>>>({})
  const toggleClass = (_: unknown, i: number): void => setHidden({ ...hidden, [magnitudeClasses[i].key]: !hidden[magnitudeClasses[i].key] })
  const legendItems = magnitudeClasses.map(c => ({ name: c.label, inactive: hidden[c.key] }))

  const points = data.filter(d => !hidden[getMagnitudeClass(d)]).map(d => ({ ...d, [getMagnitudeClass(d)]: 1 }))
  const tooltip = useMemo(() => new Tooltip({
    triggers: {
      [LeafletMap.selectors.point]: (d: { isCluster: boolean; clusterPoints?: DataRecord[]; properties: DataRecord }) => d.isCluster
        ? `${d.clusterPoints.length} earthquakes`
        : `<b>M${d.properties.magnitude}</b> ${d.properties.place}`,
    },
  }), [])

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleClass}/>
      <VisLeafletMap
        data={points}
        height={416}
        style={MAP_STYLE}
        styleDarkTheme={MAP_STYLE_DARK}
        attribution={MAP_ATTRIBUTION}
        pointRadius={getRadius}
        colorMap={colorMap}
        tooltip={tooltip}
      />
    </>
  )
}
