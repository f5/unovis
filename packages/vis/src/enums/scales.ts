// Copyright (c) Volterra, Inc. All rights reserved.
import {
  scaleLinear, scalePow, scaleSqrt, scaleLog, scaleIdentity, scaleTime, scaleUtc,
  scaleSequential, scaleDiverging, scaleQuantize, scaleQuantile, scaleThreshold, scaleOrdinal,
  scaleBand, scalePoint,
  ScaleLinear, ScalePower, ScaleLogarithmic, ScaleTime, /* ScaleOrdinal, ScaleBand, ScalePoint, ScaleThreshold, ScaleQuantile, ScaleQuantize, ScaleDiverging, ScaleSequential */
} from 'd3-scale'

export type Scale = ScaleLinear<number, any> | ScalePower<any, any> | ScaleLogarithmic<any, any> | ScaleTime<any, any>

export const Scales = {
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

// export enum ScaleType {
//   Linear,
//   Pow,
//   Sqrt,
//   Log,
//   Identity,
//   Time,
//   Utc,
//   Sequential,
//   Diverging,
//   Quantize,
//   Quantile,
//   Threshold,
//   Ordinal,
//   Implicit,
//   Band,
//   Point,
// }

// export const Scale = {
//   [ScaleType.Linear]: scaleLinear,
//   [ScaleType.Pow]: scalePow,
//   [ScaleType.Sqrt]: scaleSqrt,
//   [ScaleType.Log]: scaleLog,
//   [ScaleType.Identity]: scaleIdentity,
//   [ScaleType.Time]: scaleTime,
//   [ScaleType.Utc]: scaleUtc,
//   [ScaleType.Sequential]: scaleSequential,
//   [ScaleType.Diverging]: scaleDiverging,
//   [ScaleType.Quantize]: scaleQuantize,
//   [ScaleType.Quantile]: scaleQuantile,
//   [ScaleType.Threshold]: scaleThreshold,
//   [ScaleType.Ordinal]: scaleOrdinal,
//   [ScaleType.Band]: scaleBand,
//   [ScaleType.Point]: scalePoint,
// }
