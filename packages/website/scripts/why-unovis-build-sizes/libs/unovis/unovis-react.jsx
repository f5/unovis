// Unovis (React): @unovis/react wrappers around @unovis/ts
import { createRoot } from 'react-dom/client'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'
import { DATA, SERIES, getContainer } from '../shared/data.js'

const x = (d) => d.x
const y = SERIES.map((s) => (d) => d[s.key])
const color = (_, i) => SERIES[i].color
const legendItems = SERIES.map((s) => ({ name: s.label, color: s.color }))
const tooltipTemplate = (d) => [`<b>${d.x}</b>`, ...SERIES.map((s) => `${s.label}: ${d[s.key]}`)].join('<br>')

function Chart () {
  return (
    <div>
      <VisBulletLegend items={legendItems} />
      <VisXYContainer data={DATA} height={300}>
        <VisLine x={x} y={y} color={color} />
        <VisAxis type="x" />
        <VisAxis type="y" />
        <VisCrosshair template={tooltipTemplate} color={color} />
        <VisTooltip />
      </VisXYContainer>
    </div>
  )
}

createRoot(getContainer()).render(<Chart />)
