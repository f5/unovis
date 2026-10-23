import React, { useMemo, useState } from 'react'
import { LeafletMap, LeafletMapPointShape, Tooltip } from '@unovis/ts'
import type { LeafletMapClusterDatum, LeafletMapConfigInterface } from '@unovis/ts'
import { VisLeafletMap, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, MagnitudeClass, magnitudeClasses, getMagnitudeClass, getRadius } from './data'
import { MAP_STYLE, MAP_STYLE_DARK, MAP_ATTRIBUTION } from './constants'

// Every point gets a count of 1 in its magnitude class, so clusters show the mix of classes as a donut
const colorMap = Object.fromEntries(magnitudeClasses.map((c, i) => [c.key, { color: `var(--vis-color${i})` }]))

// Spread over the map's props, so a preset only sets the options it needs: an explicit `undefined` would override the default
const presetProps: Record<string, Partial<LeafletMapConfigInterface<DataRecord>>> = {
  unclustered: { clusteringDistance: 0 },
  labels: {
    pointBottomLabel: (d: DataRecord) => `M${d.magnitude}`,
    clusterBottomLabel: (d: LeafletMapClusterDatum<DataRecord>) => `up to M${Math.max(...d.clusterPoints.map(p => p.magnitude))}`,
  },
  triangles: { pointShape: LeafletMapPointShape.Triangle },
}

export default function UnovisLeafletMap ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<MagnitudeClass, boolean>>>({})
  const toggleClass = (_: unknown, i: number): void => setHidden({ ...hidden, [magnitudeClasses[i].key]: !hidden[magnitudeClasses[i].key] })
  const legendItems = magnitudeClasses.map(c => ({ name: c.label, inactive: hidden[c.key] }))

  const points = data.filter(d => !hidden[getMagnitudeClass(d)]).map(d => ({ ...d, [getMagnitudeClass(d)]: 1 }))
  const tooltip = useMemo(() => new Tooltip({
    container: document.body,
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
        {...(preset ? presetProps[preset] : undefined)}
      />
    </>
  )
}
