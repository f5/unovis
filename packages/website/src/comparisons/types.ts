import type { ComponentType } from 'react'

export type LibraryId = 'unovis' | 'recharts' | 'chartjs' | 'echarts' | 'nivo' | 'agcharts' | 'plot' | 'vegalite'

export type ChartProps<Data> = {
  data: Data;
  isDark: boolean;
}

export type ComparisonImplementation<Data> = {
  library: LibraryId;
  load: () => Promise<{ default: ComponentType<ChartProps<Data>> }>;
  code: string;
  /** Overrides the library's default renderer badge, e.g. when a plugin or a map renders differently */
  renderer?: string;
}

/** A library that can't render the chart, shown as a placeholder card with the reason */
export type UnsupportedImplementation = {
  library: LibraryId;
  /** A full sentence, e.g. "No network graph component." */
  reason: string;
  url?: string;
  /** The chart exists, but only in the library's paid edition */
  paid?: boolean;
}

export type Comparison<Data> = {
  id: string;
  getData: (seed: number) => Data;
  dataCode: string;
  updateLabel?: string;
  /** Height of the chart area in pixels. Default: `COMPARISON_CHART_HEIGHT` */
  chartHeight?: number;
  /** Show every chart across the full width of the page, for charts that need the room */
  wide?: boolean;
  implementations: ComparisonImplementation<Data>[];
  unsupported?: UnsupportedImplementation[];
}
