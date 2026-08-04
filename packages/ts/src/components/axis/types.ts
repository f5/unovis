export enum AxisType {
  X = 'x',
  Y = 'y',
}

export type TickValues = (number | Date)[]

/** Result of the adaptive tick fitting */
export type TickSets = {
  /** The largest set whose labels fit, all of its ticks are rendered */
  fittedTicks: TickValues;
  /** The values of `fittedTicks` that get labeled */
  labeledTicks: TickValues;
  /** The full (unfitted) tick set — its remaining ticks render as unlabeled marks.
   * Kept step-nested so the fitted sets are its subsets, see `getNestedTickValues` */
  originalTicks: TickValues;
}

/** The tick set picked by the fitting search, see `findFittingTickValues` */
export type FittedTickValues = Pick<TickSets, 'fittedTicks' | 'labeledTicks'>
