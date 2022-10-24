<script lang='ts'>
  import { VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/svelte'
  import { data, colors } from './data'

  const items = Object.entries(colors).map(([n, c]) => ({
    name: n.toUpperCase(),
    color: c,
  }))
  const tickValues = data.map(d => d.year)
</script>

<VisXYContainer height={500}>
  <h2>U.S. Election Popular Vote Results by Political Party</h2>
  <VisGroupedBar {data} x={d => d.year}
    y={[
      d => d.republican,
      d => d.democrat,
      d => d.other,
      d => d.libertarian,
    ]}
    color={(_, i) => items[i].color}
  />
  <VisAxis type="x" label="Election Year" {tickValues}/>
  <VisAxis
    type="y"
    tickFormat={(_, i) => `${i / Math.pow(10, 6)}.0`}
    label="Number of Votes (millions)"/>
</VisXYContainer>

