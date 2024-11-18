import { VisAxis, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/solid'
import { colors, Scale, Scatter } from '@unovis/ts'
import { JSX } from 'solid-js'
import { categories, data, DataRecord, shapes, sumCategories } from './data'


const ShapedScatterPlot = (): JSX.Element => {
  const shapeScale = Scale.scaleOrdinal(shapes).domain(categories)
  const colorScale = Scale.scaleOrdinal(colors).domain(categories)

  // scatter props
  const x = (d: DataRecord) => +(new Date(`01-${d.date}`))
  const y = (d: DataRecord) => d.trainedParam
  const color = (d: DataRecord) => colorScale(sumCategories(d.owner))
  const shape = (d: DataRecord) => shapeScale(sumCategories(d.owner))
  const label = (d: DataRecord) => d.name

  const legendItems = categories.map((v) => ({ name: v, shape: shapeScale(v) }))
  const triggers = {
    [Scatter.selectors.point]: (d: DataRecord) => `
      <strong>name</strong>: ${d.name} <br>
      <strong>owner</strong>: ${d.owner} <br>
      <strong>bn parameters</strong>: ${d.trainedParam}`,
  }

  return (
    <div>
      <h2>The Rise and Rise of A.I. Large Language Models</h2>
      <VisBulletLegend items={legendItems} />
      <VisXYContainer data={data} height='50dvh' scaleByDomain>
        <VisScatter
          x={x}
          y={y}
          color={color}
          shape={shape}
          label={label}
          cursor='pointer'
        />
        <VisAxis
          type='x'
          label='Date Released'
          tickFormat={
            Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format
          }
        />
        <VisAxis
          excludeFromDomainCalculation
          type='y'
          label='Billion Parameters'
          tickPadding={0}
        />
        <VisTooltip triggers={triggers} />
      </VisXYContainer>
    </div>
  )
}

export default ShapedScatterPlot
