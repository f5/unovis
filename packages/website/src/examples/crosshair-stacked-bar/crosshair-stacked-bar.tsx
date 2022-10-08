/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback } from 'react'
import { renderToString } from 'react-dom/server'
import { Position } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'

import { data, labels, DataRecord, FormatConfig } from './data'

export default function CrosshairStackedBar (): JSX.Element {
  const height = 500

  const getIcon = useCallback((f: FormatConfig): JSX.Element => (<>
    <span className={`bi bi-${f.icon}`} style={{ color: f.color, margin: '0 4px' }}></span>
    {f.label}
  </>), [])

  const tooltipTemplate = useCallback((d: DataRecord): string => {
    const numberFormat = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format
    const dataLegend = labels.filter(f => d[f.format] > 0)
      .reverse()
      .map(f => {
        const icon = getIcon({ ...f, label: numberFormat(d[f.format] * Math.pow(10, 10)) })
        return `<span>${renderToString(icon)}</span>`
      }).join('')
    return `<div><b>${d.year}</b>: ${dataLegend}</div>`
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"/>
      {labels.map(l => <span key={l.label} style={{ marginRight: '10px' }}>{getIcon(l)}</span>)}
      <VisXYContainer data={data} height={height}>
        <VisStackedBar
          x={useCallback((d: DataRecord) => d.year, [])}
          y={labels.map((l: FormatConfig) => useCallback((d: DataRecord) => d[l.format], []))}
        />
        <VisCrosshair template={tooltipTemplate}/>
        <VisTooltip verticalShift={height} horizontalPlacement={Position.Center}/>
        <VisAxis type="x" />
      </VisXYContainer>
    </>
  )
}
