import { JSX } from 'solid-js'
import { VisHeatmap, VisSingleContainer } from '@unovis/solid'
import { Sizing } from '@unovis/ts'

import { data, DataRecord, numRows, offset, columnLabel, rowLabel } from './data'

const GitHubStyleHeatmap = (): JSX.Element => {
  return (
    <VisSingleContainer sizing={Sizing.Extend}>
      <VisHeatmap
        data={data}
        value={(d: DataRecord) => d.count || undefined}
        numRows={numRows}
        offset={offset}
        cellSize={14}
        cellPadding={3}
        cellCornerRadius={3}
        columnLabel={columnLabel}
        rowLabel={rowLabel}
      />
    </VisSingleContainer>
  )
}

export default GitHubStyleHeatmap
