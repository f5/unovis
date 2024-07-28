import { JSX } from 'solid-js'
import { VisBulletLegend, VisDonut, VisSingleContainer } from '@unovis/solid'

import { data } from './data'

const BasicDonutChart = (): JSX.Element => {
  const legendItems = Object.entries(data).map(([_, data]) => ({
    name: data.key.charAt(0).toUpperCase() + data.key.slice(1),
  }))

  return (
    <div>
      <h3>Most Common Password Categories</h3>
      <VisBulletLegend items={legendItems} />
      <VisSingleContainer height='50dvh'>
        <VisDonut
          value={(d) => d.value}
          data={data}
          showEmptySegments
          padAngle={0.01}
          arcWidth={100}
        />
      </VisSingleContainer>
    </div>
  )
}

export default BasicDonutChart
