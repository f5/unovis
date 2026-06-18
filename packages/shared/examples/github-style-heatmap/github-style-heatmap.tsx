import React, { useCallback } from 'react'
import { VisSingleContainer, VisHeatmap } from '@unovis/react'
import { Sizing } from '@unovis/ts'

import { data, DataRecord, numRows, offset, columnLabel, rowLabel } from './data'

export default function GitHubStyleHeatmap (): React.ReactElement {
  return (
    <VisSingleContainer sizing={Sizing.Extend}>
      <VisHeatmap<DataRecord>
        data={data}
        value={useCallback((d: DataRecord) => d.count || undefined, [])}
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
