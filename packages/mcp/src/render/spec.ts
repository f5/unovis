/** ChartSpec — a JSON-serializable intermediate representation of a chart.
 *
 * Tool inputs are converted to a ChartSpec (recipes), which the renderer
 * materializes into live Unovis containers/components. Keeping the IR
 * serializable enables the `config` output mode and, later, framework code
 * generation. Accessors are descriptors referencing data fields by name —
 * user input is never evaluated as code.
 */
import type { LegendItemSpec } from '@unovis/ssr'

export type FieldType = 'number' | 'string' | 'date'

/** Accessor descriptors (JSON-safe stand-ins for Unovis accessor functions) */
export type AccessorRef =
  /** d => coerce(d[field]) */
  | { $field: string; as?: FieldType }
  /** (d, i) => i */
  | { $index: true }
  /** () => value */
  | { $const: unknown }
  /** Multi-line time-aware tick formatter for date scales */
  | { $dateTickFormat: true }
  /** Numeric tick formatter with thousands separators */
  | { $numTickFormat: true }
  /** (d, i) => values[i % values.length] — e.g. ordinal index → category name */
  | { $lookup: (string | number)[] }
  /** d => prefix + formatNumber(d[field]) + suffix (empty string for missing values) */
  | { $format: { field: string; prefix?: string; suffix?: string } }
  /** d => mapping[String(d[field])] ?? fallback — e.g. category → color */
  | { $mapField: { field: string; mapping: Record<string, string>; fallback?: string } }

export const isAccessorRef = (value: unknown): value is AccessorRef => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.some(k => ['$field', '$index', '$const', '$dateTickFormat', '$numTickFormat', '$lookup', '$format', '$mapField'].includes(k))
}

/** Component config values: JSON values with AccessorRefs anywhere inside */
export type SpecConfigValue = unknown

export interface ComponentSpec {
  /** Unovis class name, e.g. 'Line', 'StackedBar', 'Donut' */
  type: string;
  config: Record<string, SpecConfigValue>;
}

export interface AxisSpec {
  label?: string;
  gridLine?: boolean;
  numTicks?: number;
  tickFormat?: AccessorRef;
  domainLine?: boolean;
  tickTextAngle?: number;
  [key: string]: SpecConfigValue;
}

// The header synthesizer owns this shape — re-exported so @unovis/mcp/spec
// keeps its full IR vocabulary
export type { LegendItemSpec } from '@unovis/ssr'

/** Version of the ChartSpec contract, as `major.minor`.
 *
 * While the major is 0 the contract is explicitly unstable: breaking changes
 * are allowed and bump the minor (0.1 → 0.2), each with a freshly frozen
 * schema baseline. Additions never require a bump. Declaring 1.0 is the
 * deliberate act of adopting the additive-only promise — from then on the
 * major moves only on breaking changes. Consumers that persist specs or
 * embed documents compare it via the `unovis:ready` handshake. */
export const SPEC_VERSION = '0.1'

export interface ChartSpec {
  /** ChartSpec contract version this spec was written against (see SPEC_VERSION) */
  specVersion?: string;
  container: 'xy' | 'single';
  width: number;
  height: number;
  theme: 'light' | 'dark';
  title?: string;
  /** Extra container config (xy: xDomain, yDirection…; single: sizing…) */
  containerConfig?: Record<string, SpecConfigValue>;
  components: ComponentSpec[];
  xAxis?: AxisSpec;
  yAxis?: AxisSpec;
  /** Custom palette — overrides --vis-colorN for the whole chart */
  colors?: string[];
  /** BCP-47 locale for date/number tick and tooltip formatting (default en-US) */
  locale?: string;
  legend?: LegendItemSpec[];
  data: unknown;
}

export interface RenderWarnings {
  warnings: string[];
}
