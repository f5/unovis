export type NumericAccessor<Datum> = ((d: Datum, i: number, ...any: unknown[]) => number | null | undefined) | number | null | undefined
export type StringAccessor<Datum> = ((d: Datum, i: number, ...any: unknown[]) => string | null | undefined) | string | null
export type ColorAccessor<Datum> = ((d: Datum, i: number, ...any: unknown[]) => string | null | undefined) | string | string[] | null | undefined
export type BooleanAccessor<Datum> = ((d: Datum, i: number, ...any: unknown[]) => boolean | null | undefined) | boolean | null | undefined
export type GenericAccessor<ReturnType, Datum> = ((d: Datum, i: number, ...any: unknown[]) => ReturnType | null | undefined) | ReturnType | null | undefined
