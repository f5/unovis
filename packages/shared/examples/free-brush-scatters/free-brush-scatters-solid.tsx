import { FreeBrushMode, Position, Scale } from '@unovis/ts'
import { createSignal, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisFreeBrush, VisScatter, VisXYContainer } from '@unovis/solid'

import './styles.css'

import { palette, data, DataRecord } from './data'

const FreeBrushScatter = (): JSX.Element => {
  const categories = [
    ...new Set(data.map((d: DataRecord) => d.category)),
  ].sort()
  const colorScale = Scale.scaleOrdinal(palette).domain(categories)
  const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

  const legendItems = categories.map((v) => ({ name: v, color: colorScale(v) }))
  const [selection, setSelection] = createSignal<
  [[number, number], [number, number]] | null
  >(null)
  function onBrushEnd (s: [[number, number], [number, number]] | null) {
    setSelection(s)
  }

  const scatterProps = {
    x: (d: DataRecord) => d.medianSalary,
    y: (d: DataRecord) => d.employmentRate,
    color: (d: DataRecord) => colorScale(d.category),
    size: (d: DataRecord) => d.total,
    id: (d: DataRecord) => d.major,
  }

  return (
    <div>
      <h2>American College Graduates, 2010-2012</h2>
      <VisBulletLegend items={legendItems} />
      <div class='scatter-with-minimap'>
        <div>
          <VisXYContainer
            data={data}
            xDomain={selection()?.[0]}
            yDomain={selection()?.[1]}
            height='50dvh'
            scaleByDomain
          >
            <VisScatter
              {...scatterProps}
              sizeRange={[20, 80]}
              labelPosition={Position.Bottom}
              label={(d: DataRecord) => d.major}
            />
            <VisAxis
              type='x'
              label='Median Salary ($)'
              tickFormat={formatNumber}
              gridLine={false}
            />
            <VisAxis
              type='y'
              label='Employment Rate'
              tickPadding={0}
              gridLine={false}
            />
          </VisXYContainer>
        </div>
        <div class='minimap'>
          <VisXYContainer data={data} height={125}>
            <VisScatter
              {...scatterProps}
              sizeRange={[3, 10]}
              label={undefined}
            />
            <VisFreeBrush
              selectionMinLength={[0, 0]}
              autoHide={false}
              x={scatterProps.x}
              y={scatterProps.y}
              onBrushEnd={onBrushEnd}
              mode={FreeBrushMode.XY}
            />
          </VisXYContainer>
        </div>
      </div>
    </div>
  )
}

export default FreeBrushScatter
