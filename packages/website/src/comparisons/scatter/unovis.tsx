import React, { useState } from 'react'
import { CrosshairSnapMode, SymbolType } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'

import { DataRecord, species, formatMass } from './data'

const shapes = [SymbolType.Circle, SymbolType.Triangle, SymbolType.Square]
const x = (d: DataRecord): number => d.flipperLength
const y = (d: DataRecord): number => d.billLength
const color = (d: DataRecord): string => `var(--vis-color${species.indexOf(d.species)})`
const shape = (d: DataRecord): SymbolType => shapes[species.indexOf(d.species)]
const tooltipTemplate = (d: DataRecord): string => `
  <b>${d.species}</b><br/>
  Flipper: ${d.flipperLength} mm<br/>
  Bill: ${d.billLength} mm<br/>
  Body mass: ${formatMass(d.bodyMass)}
`

export default function UnovisScatterPlot ({ data }: { data: DataRecord[] }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const legendItems = species.map((name, i) => ({ name, shape: shapes[i], inactive: hidden[name] }))
  const toggleSpecies = (item: { name: string }): void => setHidden({ ...hidden, [item.name]: !hidden[item.name] })

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSpecies}/>
      <VisXYContainer data={data.filter(d => !hidden[d.species])} height={296}>
        <VisScatter
          id={(d: DataRecord) => d.id}
          x={x}
          y={y}
          size={(d: DataRecord) => d.bodyMass}
          sizeRange={[5, 20]}
          color={color}
          shape={shape}
        />
        <VisAxis type="x" label="Flipper length (mm)"/>
        <VisAxis type="y" label="Bill length (mm)"/>
        <VisCrosshair x={x} y={y} color={color} snapMode={CrosshairSnapMode.XY} showHorizontalLine template={tooltipTemplate}/>
        <VisTooltip/>
      </VisXYContainer>
    </>
  )
}
