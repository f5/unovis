import { JSX } from 'solid-js'
import { VisArea, VisAxis, VisBulletLegend, VisCrosshair, VisTooltip, VisXYContainer, VisXYLabels } from '@unovis/solid'

import { data, formats, DataRecord, getLabels, gradients, legendItems, svgDefs, tooltipTemplate } from './data'

const StackedAreaChart = (): JSX.Element => {
  const labels = getLabels(data)

  const x = (d: DataRecord) => d.year
  const y = formats.map((g) => (d: DataRecord) => d[g])
  const color = (_: DataRecord[], i: number) => gradients[i]
  const labelProps = {
    x: (d: DataRecord) => (labels[d.year] ? d.year : undefined),
    y: (d: DataRecord) => labels[d.year]?.value,
    label: (d: DataRecord) => labels[d.year]?.label,
    backgroundColor: (d: DataRecord) => labels[d.year]?.color ?? 'none',
  }

  return (
    <>
      <VisBulletLegend items={legendItems} />
      <VisXYContainer data={data} height='50dvh' svgDefs={svgDefs}>
        <VisArea x={x} y={y} color={color} />
        <VisAxis
          type='x'
          label='Year'
          numTicks={10}
          gridLine={false}
          domainLine={false}
        />
        <VisAxis type='y' label='Revenue (USD, billions)' numTicks={10} />
        <VisXYLabels
          {...labelProps}
          clusterBackgroundColor='none'
          clusterLabel={() => ''}
        />
        <VisCrosshair x={x} yStacked={y} template={tooltipTemplate} />
        <VisTooltip />
      </VisXYContainer>
    </>
  )
}

export default StackedAreaChart
