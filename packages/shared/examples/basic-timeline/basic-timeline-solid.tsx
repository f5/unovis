import { JSX } from 'solid-js'
import { Timeline } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisTimeline, VisTooltip, VisXYContainer } from '@unovis/solid'

import { colorMap, data, DataRecord, ProductType } from './data'

const BasicTimeline = (): JSX.Element => {
  const labelWidth = 220
  const dateFormatter = Intl.DateTimeFormat().format

  function getTooltipText (_: string, i: number): string {
    const { startDate, endDate, description } = data[i]
    return `
      <div style="width:${labelWidth}px">
        ${[startDate, endDate].map(dateFormatter).join(' - ')}
        ${description}
      </div>`
  }

  const x = (d: DataRecord) => d.startDate
  const length = (d: DataRecord) => d.endDate - d.startDate
  const type = (d: DataRecord) => d.name
  const color = (d: DataRecord) => colorMap[d.type]

  const legendItems = Object.keys(ProductType).map((name, i) => ({
    name,
    color: colorMap[name],
  }))
  const triggers = { [Timeline.selectors.label]: getTooltipText }

  return (
    <VisXYContainer data={data} height='50dvh'>
      <h3>A Timeline of Abandoned Google Products, 1997 - 2022</h3>
      <VisBulletLegend items={legendItems} />
      <VisTimeline
        x={x}
        length={length}
        type={type}
        color={color}
        labelWidth={labelWidth}
        showLabels
      />
      <VisTooltip triggers={triggers} />
      <VisAxis type='x' numTicks={10} tickFormat={dateFormatter} />
    </VisXYContainer>
  )
}

export default BasicTimeline
