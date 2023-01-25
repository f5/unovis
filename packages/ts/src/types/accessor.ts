export type NumericAccessor<Datum> = ((d: Datum, i: number, ...any) => number | null) | number | null | undefined
export type StringAccessor<Datum> = ((d: Datum, i: number, ...any) => string | null) | string | null
export type ColorAccessor<Datum> = ((d: Datum, i: number, ...any) => string | null | undefined) | string | string[] | null | undefined
export type BooleanAccessor<Datum> = ((d: Datum, i: number, ...any) => boolean | null) | boolean | null
export type GenericAccessor<ReturnType, Datum> = ((d: Datum, i: number, ...any) => ReturnType | null | undefined) | ReturnType | null | undefined
