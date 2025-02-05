/** Data type for Line Generator: [x, y, defined] */
export type LineDatum = { x: number; y: number; value: number | null | undefined; defined: boolean }
export type LineData = { values: LineDatum[]; gaps: LineDatum[]; defined: boolean; visible: boolean }
