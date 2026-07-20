<script lang="ts">
  import { VisSingleContainer, VisHeatmap } from '@unovis/svelte'
  import { Sizing } from '@unovis/ts'
  import type { DataRecord } from './data'
  import { data, numRows, offset, columnLabel, rowLabel } from './data'

  const value = (d: DataRecord): number | undefined => d.count || undefined
</script>

<VisSingleContainer sizing={Sizing.Extend}>
  <VisHeatmap
    {data}
    {value}
    {numRows}
    {offset}
    cellSize={14}
    cellPadding={3}
    cellCornerRadius={3}
    {columnLabel}
    {rowLabel}
  />
</VisSingleContainer>
