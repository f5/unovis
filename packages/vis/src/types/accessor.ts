// Copyright (c) Volterra, Inc. All rights reserved.

export type NumericAccessor<Datum> = ((d: Datum, i?: number, ...any) => number | null) | number | null | undefined
export type StringAccessor<Datum> = ((d: Datum, i?: number, ...any) => string | null) | string | null
export type ColorAccessor<Datum> = ((d: Datum, i?: number, ...any) => string | null) | string | null
export type BooleanAccessor<Datum> = ((d: Datum, i?: number, ...any) => boolean | null) | boolean | null
export type GenericAccessor<T, Datum> = ((d: Datum, i?: number, ...any) => T | null) | T | null
