// Copyright (c) Volterra, Inc. All rights reserved.

/** Data type for Line Generator: [x, y, defined] */
export type LineDatum = { x: number; y: number; defined: boolean }
export type LineData = { values: LineDatum[]; defined: boolean }
