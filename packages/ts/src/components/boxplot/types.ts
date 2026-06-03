export type BoxplotDataRecord<D> = {
  datum: D;
  index: number;
  /** Median value */
  median: number | null | undefined;
  /** Quartiles tuple `[q1, q3]` */
  quartiles: [number, number] | null | undefined;
  /** Whiskers tuple `[min, max]` */
  whiskers: [number, number] | null | undefined;
}
