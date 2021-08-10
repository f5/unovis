// Copyright (c) Volterra, Inc. All rights reserved.
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

export type ContinuousScale = ScaleLinear<number, any> | ScalePower<any, any> | ScaleLogarithmic<any, any> | ScaleTime<any, any>

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
