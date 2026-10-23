import React, { useState } from 'react'
import { mean } from 'd3-array'
import { CrosshairSnapMode, PlotlineLabelPosition, PlotlineLineStylePresets, SymbolType } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend, VisPlotline } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, species, formatMass } from './data'

const shapes = [SymbolType.Circle, SymbolType.Triangle, SymbolType.Square]
const x = (d: DataRecord): number => d.flipperLength
const y = (d: DataRecord): number => d.billLength
const color = (d: DataRecord): string => `var(--vis-color${species.indexOf(d.species)})`
const shape = (d: DataRecord): SymbolType => shapes[species.indexOf(d.species)]
const label = (d: DataRecord): string => formatMass(d.bodyMass)
const tooltipTemplate = (d: DataRecord): string => `
  <b>${d.species}</b><br/>
  Flipper: ${d.flipperLength} mm<br/>
  Bill: ${d.billLength} mm<br/>
  Body mass: ${formatMass(d.bodyMass)}
`

export default function UnovisScatterPlot ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const legendItems = species.map((name, i) => ({ name, shape: shapes[i], inactive: hidden[name] }))
  const toggleSpecies = (item: { name: string }): void => setHidden({ ...hidden, [item.name]: !hidden[item.name] })
  const isRings = preset === 'rings'
  const averageFlipper = mean(data, x)
  const averageBill = mean(data, y)

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
          color={isRings ? 'transparent' : color}
          strokeColor={isRings ? color : undefined}
          strokeWidth={isRings ? 1.5 : undefined}
          shape={shape}
          label={preset === 'labels' ? label : undefined}
        />
        {preset === 'averages' && <VisPlotline axis="x" value={averageFlipper} labelText={`Average ${averageFlipper.toFixed(0)} mm`} lineStyle={PlotlineLineStylePresets.Dash}/>}
        {preset === 'averages' && (
          <VisPlotline
            axis="y"
            value={averageBill}
            labelText={`Average ${averageBill.toFixed(1)} mm`}
            labelPosition={PlotlineLabelPosition.TopLeft}
            lineStyle={PlotlineLineStylePresets.Dash}
          />
        )}
        <VisAxis type="x" label="Flipper length (mm)"/>
        <VisAxis type="y" label="Bill length (mm)"/>
        <VisCrosshair x={x} y={y} color={color} snapMode={CrosshairSnapMode.XY} showHorizontalLine template={tooltipTemplate}/>
        <VisTooltip container={document.body}/>
      </VisXYContainer>
    </>
  )
}
