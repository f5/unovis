/** The most generic data record: an object with unknown properties */
export type GenericDataRecord = Record<string, unknown>

/** Extension of a numbers array that carries additional information required for plotting stacked data */
export type StackValuesRecord = Array<[number, number]> & { negative?: boolean; ending?: boolean }
