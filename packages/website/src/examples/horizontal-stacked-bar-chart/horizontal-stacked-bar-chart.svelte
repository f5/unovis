<script lang='ts'>
  import { VisXYContainer, VisStackedBar, VisAxis, VisBulletLegend, VisTooltip } from '@unovis/svelte'
  import { Direction, Orientation, StackedBar } from '@unovis/ts'
  import { data, labels, EducationDatum } from './data'

  const chartLabels = Object.entries(labels).map(([k, v], i) => ({
    key: k,
    legend: v,
    tooltip: (d: EducationDatum) => [
      v.split(' ')[0],
      `<span style="color: var(--vis-color${i}); font-weight: 800">${d[k]}%</span>`,
    ].join(': '),
  }))

  const x = (d: EducationDatum, i: number) => i
  const y = chartLabels.map(i => (d: EducationDatum) => d[i.key])
  const tickFormat = (_, i: number) => data[i].country

  function tooltipTemplate (d: EducationDatum): string {
    const title = `<div style="color: #666; text-align: center">${d.country}</div>`
    const total = `Total: <b>${d.total}%</b> of population with a college degree</br>`
    const stats = chartLabels.map(l => l.tooltip(d)).join(' | ')
    return `<div style="font-size: 12px">${title}${total}${stats}</div>`
  }


</script>

<h3>Highest Degree Earned across Country Populations as of 2020</h3>
<VisBulletLegend items={chartLabels.map(d => ({ name: d.legend }))}/>
<VisXYContainer height={800} yDirection={Direction.South}>
  <VisStackedBar {data} {x} {y} orientation={Orientation.Horizontal}/>
  <VisTooltip triggers={{ [StackedBar.selectors.bar]: tooltipTemplate }}/>
  <VisAxis type="x" label="% of population aged 25 or above"/>
  <VisAxis type="y" {tickFormat} {y} label="Country" numTicks={data.length}/>
</VisXYContainer>

