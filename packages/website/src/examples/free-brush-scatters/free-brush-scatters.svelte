<script lang='ts'>
  import { FreeBrushMode, Scale } from '@volterra/vis'
  import { VisXYContainer, VisScatter, VisAxis, VisBulletLegend, VisFreeBrush } from '@volterra/vis-svelte'
  import { palette, data, DataRecord } from './data'

  const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
  const colorScale = Scale.scaleOrdinal(palette).domain(categories)
  const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

  const legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  let selection
  function onBrushEnd(s: [[number, number], [number, number]] | null)  {
    selection = s
  }

  const scatterProps = {
    x: (d: DataRecord) => d.medianSalary,
    y: (d: DataRecord) => d.employmentRate,
    color: (d: DataRecord) => colorScale(d.category),
    size: (d: DataRecord) => d.total,
    label: (d: DataRecord) => d.major,
  }

</script>

<h2>American College Graduates, 2010-2012</h2>
<VisBulletLegend items={legendItems} />
<div class='main'>
  <VisXYContainer data={data} height={600}>
    <VisScatter {...scatterProps}/>
    <VisFreeBrush
    selectionMinLength={[0, 0]}
    autoHide={false}
    x={scatterProps.x}
    y={scatterProps.y}
    {onBrushEnd}
    mode={FreeBrushMode.XY}/>
  </VisXYContainer>
  <div>
    <VisXYContainer
    data={selection ? data : []}
    xDomain={selection?.[0]}
    yDomain={selection?.[1]}
    height={600}
    scaleByDomain={true}>
    <VisScatter {...scatterProps} sizeRange={[20, 80]}/>
    <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber} gridLine={false}/>
    <VisAxis type='y' label='Employment Rate' tickPadding={0} gridLine={false}/>
    </VisXYContainer>
  </div>
</div>

<style>
  .main {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .main > *:nth-child(2) {
    flex-grow: 1;
  }
</style>

