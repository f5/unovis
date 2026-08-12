// Augments @unovis/ts with stub types for workspace-only components that are
// not yet in the published npm package (Boxplot, Heatmap, RadialBar were added
// to the monorepo after @unovis/ts@1.6.7 was released).
// Remove this file once the containing @unovis/ts version is bumped to include them.

import type { XYComponentCore, XYComponentConfigInterface } from '@unovis/ts'

declare module '@unovis/ts' {
  interface BoxplotConfigInterface<Datum = unknown> extends Partial<XYComponentConfigInterface<Datum>> {
    [key: string]: unknown;
  }
  class Boxplot<Datum> extends XYComponentCore<Datum, BoxplotConfigInterface<Datum>> {
    constructor(config?: BoxplotConfigInterface<Datum>)
  }

  interface HeatmapConfigInterface<Datum = unknown> extends Partial<XYComponentConfigInterface<Datum>> {
    [key: string]: unknown;
  }
  class Heatmap<Datum> extends XYComponentCore<Datum, HeatmapConfigInterface<Datum>> {
    constructor(config?: HeatmapConfigInterface<Datum>)
  }

  interface RadialBarConfigInterface<Datum = unknown> extends Partial<XYComponentConfigInterface<Datum>> {
    [key: string]: unknown;
  }
  class RadialBar<Datum> extends XYComponentCore<Datum, RadialBarConfigInterface<Datum>> {
    constructor(config?: RadialBarConfigInterface<Datum>)
  }
}

// This export makes the file a module, which is required for declaration
// merging (augmenting an existing module) to work correctly in TypeScript.
export {}
