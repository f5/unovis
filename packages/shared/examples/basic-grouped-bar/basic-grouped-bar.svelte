<script lang='ts'>
  import { VisXYContainer, VisGroupedBar, VisAxis, VisBulletLegend } from '@unovis/svelte'
  import { data, colors, capitalize, ElectionDatum } from './data'

  const items = Object.entries(colors).map(([n, c]) => ({
    name: capitalize(n),
    color: c,
  }))
  const x = (d: ElectionDatum) => d.year
  const y = [
    (d: ElectionDatum) => d.republican,
    (d: ElectionDatum) => d.democrat,
    (d: ElectionDatum) => d.other,
    (d: ElectionDatum) => d.libertarian,
  ]
  const color = (d: ElectionDatum, i: number) => items[i].color
</script>

<h2>U.S. Election Popular Vote Results by Political Party</h2>
<VisBulletLegend {items}/>
<VisXYContainer height={500}>
  <VisGroupedBar {data} {x} {y} {color} />
  <VisAxis type="x" label="Election Year" numTicks={data.length}/>
  <VisAxis
    type="y"
    tickFormat={(value) => (value / 10 ** 6).toFixed(1)}
    label="Number of Votes (millions)"/>
</VisXYContainer>

