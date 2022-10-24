<script lang='ts'>
  import { FreeBrushMode, Scale, Position } from '@unovis/ts'
  import { VisXYContainer, VisScatter, VisAxis, VisBulletLegend, VisFreeBrush } from '@unovis/svelte'
  import { palette, data, DataRecord } from './data'

  const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
  const colorScale = Scale.scaleOrdinal(palette).domain(categories)
  const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

  const legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  let selection
  function onBrushEnd (s: [[number, number], [number, number]] | null) {
    selection = s
  }

  const scatterProps = {
    x: (d: DataRecord) => d.medianSalary,
    y: (d: DataRecord) => d.employmentRate,
    color: (d: DataRecord) => colorScale(d.category),
    size: (d: DataRecord) => d.total,
    label: (d: DataRecord) => d.major,
    id: (d: DataRecord) => d.major,
  }

</script>

<h2>American College Graduates, 2010-2012</h2>
<VisBulletLegend items={legendItems} />
<div class="scatter-with-minimap">
  <div>
    <VisXYContainer
      data={data}
      xDomain={selection?.[0]}
      yDomain={selection?.[1]}
      height={600}
      scaleByDomain={true}
    >
      <VisScatter {...scatterProps} sizeRange={[20, 80]} labelPosition={Position.Bottom} />
      <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber} gridLine={false}/>
      <VisAxis type='y' label='Employment Rate' tickPadding={0} gridLine={false}/>
    </VisXYContainer>
  </div>
  <div class="minimap">
    <VisXYContainer data={data} height={150}>
      <VisScatter {...scatterProps} sizeRange={[3, 10]} label={undefined}/>
      <VisFreeBrush
        selectionMinLength={[0, 0]}
        autoHide={false}
        x={scatterProps.x}
        y={scatterProps.y}
        {onBrushEnd}
        mode={FreeBrushMode.XY}
      />
    </VisXYContainer>
  </div>
</div>

<style>
  .scatter-with-minimap {
    position: relative;
  }

  .minimap {
    position: absolute;
    display: block;
    background-color: white;
    bottom: 60px;
    right: 20px;
    width: 200px;
    height: 150px;
    border: 1px solid grey;
  }
</style>

