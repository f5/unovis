import {
  scaleLinear,
  scalePow,
  scaleSqrt,
  scaleLog,
  scaleIdentity,
  scaleTime,
  scaleUtc,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleQuantile,
  scaleThreshold,
  scaleOrdinal,
  scaleBand,
  scalePoint,
  ScaleLinear,
  ScalePower,
  ScaleLogarithmic,
  ScaleTime,
} from 'd3-scale'
// Todo Ordinal Scales: ScaleOrdinal, ScaleBand, ScalePoint, ScaleThreshold, ScaleQuantile, ScaleQuantize, ScaleDiverging, ScaleSequential

export type ContinuousScale = ScaleLinear<number, number> | ScalePower<number, number> | ScaleLogarithmic<number, number> | ScaleTime<number, number>

export const Scale = {
  scaleLinear,
  scalePow,
  scaleSqrt,
  scaleLog,
  scaleIdentity,
  scaleTime,
  scaleUtc,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleQuantile,
  scaleThreshold,
  scaleOrdinal,
  scaleBand,
  scalePoint,
}

export enum ScaleDimension {
  X = 'x',
  Y = 'y',
}
