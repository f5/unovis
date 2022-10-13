<script lang='ts'>
  import { BulletLegendItemInterface } from '@unovis/ts'
  import { VisXYContainer, VisArea, VisAxis, VisBulletLegend } from '@unovis/svelte'
  import { candidates, data, DataRecord } from './data'

  let curr = candidates[0].name
  let items, y

  const keys = Object.keys(data[0][curr]).map(d => ({ name: d }))
  const x = (d: DataRecord) => d.year

  function onLegendItemClick (i: BulletLegendItemInterface): void {
    curr = i.name as string
  }

  $: {
    y = keys.map(i => (d: DataRecord) => d[curr][i.name])
    items = candidates.map(c => ({ ...c, inactive: curr !== c.name }))
  }
</script>

<div class="panel">
  <VisBulletLegend items={Object.keys(data[0][curr]).map(d => ({ name: d }))}/>
  <div class='legendSwitch'>
    <VisBulletLegend labelClassName='legendLabel' {items} {onLegendItemClick}/>
  </div>
</div>
<VisXYContainer data={data} height={400} yDomain={[0, 42]}>
  <VisArea {x} {y} curveType='step'/>
  <VisAxis type="x" label="Year"/>
  <VisAxis type="y" label="Number of Mentions"/>
</VisXYContainer>

<style>
  div {
    --vis-area-stroke-width: 3;
    --vis-area-stroke-opacity: 1;
    --vis-area-fill-opacity: 0.75;
  }
  .panel {
    display: flex;
    text-transform: capitalize;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .legendSwitch {
    width: max-content;
    background-color: #f8f8f8;
    padding: 10px 20px;
    display: inline-block;
    border-radius: 5px;
    border: 1px solid #f4f4f4;
  }

  .legendLabel:hover {
    text-decoration: underline;
  }
</style>

