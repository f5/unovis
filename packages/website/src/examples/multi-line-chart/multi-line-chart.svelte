<script lang='ts'>
  import { VisXYContainer, VisLine, VisAxis, VisBulletLegend } from '@unovis/svelte'
  import { data, labels, CityTemps } from './data'

  const x= (d: CityTemps) => +(new Date(d.date))
  const y = [
    (d: CityTemps) => d.austin,
    (d: CityTemps) => d.ny,
    (d: CityTemps) => d.sf,
  ]
  const items = ['austin', 'ny', 'sf'].map(city => ({ name: labels[city] }))
</script>

<VisXYContainer data={data} height={300}>
  <VisLine {x} {y}/>
  <VisAxis type="x" label="Date" numTicks={6} tickFormat={Intl.DateTimeFormat().format}/>
  <VisAxis type="y" label="Temperature (celsius)"/>
  <VisBulletLegend {items}/>
</VisXYContainer>
