/** Materialize a ChartSpec into live Unovis component/container configs.
 *
 * Converts JSON accessor descriptors into real functions. Field access is by
 * property name only — user input is never evaluated as code.
 */
import type { UnovisLib } from '../env/index.js'
import { isAccessorRef } from './spec.js'
import type { AccessorRef, ChartSpec, ComponentSpec } from './spec.js'

type DataRecord = Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any

export class ChartInputError extends Error {}

const coerceNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

const coerceDate = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value === 'number') return value
  const time = new Date(value as string).getTime()
  return Number.isNaN(time) ? undefined : time
}

/** Time tick formatter: picks granularity from the value */
const formatDateTick = (value: unknown): string => {
  const time = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(time)) return String(value)
  const date = new Date(time)
  const opts: Intl.DateTimeFormatOptions = date.getUTCHours() === 0 && date.getUTCMinutes() === 0
    ? (date.getUTCDate() === 1 ? { year: 'numeric', month: 'short' } : { month: 'short', day: 'numeric' })
    : { hour: '2-digit', minute: '2-digit' }
  return date.toLocaleString('en-US', { ...opts, timeZone: 'UTC' })
}

const formatNumTick = (value: unknown): string => {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

export function materializeAccessor (ref: AccessorRef): AnyFn | unknown {
  if ('$field' in ref) {
    const { $field: field, as } = ref
    if (as === 'number') return (d: DataRecord) => coerceNumber(d?.[field])
    if (as === 'date') return (d: DataRecord) => coerceDate(d?.[field])
    return (d: DataRecord) => d?.[field]
  }
  if ('$index' in ref) return (_: unknown, i: number) => i
  if ('$const' in ref) return () => (ref as { $const: unknown }).$const
  if ('$dateTickFormat' in ref) return formatDateTick
  if ('$numTickFormat' in ref) return formatNumTick
  if ('$lookup' in ref) {
    const values = ref.$lookup
    return (d: unknown) => values[Math.round(Number(d)) % values.length] ?? String(d)
  }
  if ('$format' in ref) {
    const { field, prefix = '', suffix = '' } = ref.$format
    return (d: DataRecord) => {
      const value = d?.[field]
      if (value === null || value === undefined) return ''
      return `${prefix}${formatNumTick(value)}${suffix}`
    }
  }
  if ('$mapField' in ref) {
    const { field, mapping, fallback } = ref.$mapField
    return (d: DataRecord) => mapping[String(d?.[field])] ?? fallback
  }
  return ref
}

/** Deep-walk a config value, replacing accessor descriptors with functions */
export function materializeValue (value: unknown): unknown {
  if (isAccessorRef(value)) return materializeAccessor(value)
  if (Array.isArray(value)) return value.map(materializeValue)
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) out[key] = materializeValue(v)
    return out
  }
  return value
}

export interface MaterializedChart {
  containerType: 'xy' | 'single';
  containerConfig: Record<string, unknown>;
  data: unknown;
}

/** Component classes recipes are allowed to instantiate */
const XY_COMPONENTS = new Set(['Line', 'Area', 'GroupedBar', 'StackedBar', 'Scatter', 'Timeline', 'Boxplot', 'XYLabels', 'Plotband', 'Plotline'])
const SINGLE_COMPONENTS = new Set(['Donut', 'NestedDonut', 'RadialBar', 'Sankey', 'Heatmap', 'Treemap', 'ChordDiagram', 'Graph', 'TopoJSONMap'])

/** Components that finish rendering asynchronously (after layout calculation)
 * and expose their own onRenderComplete hook the renderer must await */
export const ASYNC_COMPONENTS = new Set(['Graph'])

/** Options controlling how a spec becomes live Unovis configs.
 * Static rendering uses `duration: 0` and fixed sizes for deterministic
 * output; interactive rendering animates and lets the chart fill its host. */
export interface MaterializeOptions {
  /** Animation duration in ms. 0 (default) renders synchronously */
  duration?: number;
  /** Omit width/height so the container sizes from its DOM parent */
  responsive?: boolean;
  onRenderComplete?: () => void;
  /** Called by components whose layout completes asynchronously (Graph) */
  onComponentComplete?: () => void;
}

function instantiateComponent (lib: UnovisLib, spec: ComponentSpec, options: MaterializeOptions): unknown {
  const allowed = XY_COMPONENTS.has(spec.type) || SINGLE_COMPONENTS.has(spec.type)
  if (!allowed) throw new ChartInputError(`Unsupported component type: ${spec.type}`)
  const componentClass = (lib as unknown as Record<string, new (config: Record<string, unknown>) => unknown>)[spec.type]
  if (!componentClass) throw new ChartInputError(`Component ${spec.type} is not available in this @unovis/ts build`)
  const config = materializeValue(spec.config) as Record<string, unknown>
  config.duration = options.duration ?? 0
  if (ASYNC_COMPONENTS.has(spec.type) && options.onComponentComplete) config.onRenderComplete = options.onComponentComplete

  // { $mapProjection: 'AlbersUsa' } → MapProjection.AlbersUsa() — projections
  // are factory functions and can't live in the JSON spec directly
  const projection = config.projection as { $mapProjection?: string } | undefined
  if (projection?.$mapProjection) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const projections = (lib as unknown as { MapProjection?: Record<string, () => unknown> }).MapProjection
    const factory = projections?.[projection.$mapProjection]
    if (!factory) throw new ChartInputError(`Unknown map projection: ${projection.$mapProjection}`)
    config.projection = factory()
  }
  // eslint-disable-next-line new-cap
  return new componentClass(config)
}

export function materializeChart (lib: UnovisLib, spec: ChartSpec, options: MaterializeOptions = {}): MaterializedChart {
  const base = materializeValue(spec.containerConfig ?? {}) as Record<string, unknown>
  const duration = options.duration ?? 0
  const size = options.responsive ? {} : { width: spec.width, height: spec.height }

  if (spec.container === 'xy') {
    const components = spec.components.map(c => {
      if (!XY_COMPONENTS.has(c.type)) throw new ChartInputError(`${c.type} cannot be used in an XY container`)
      return instantiateComponent(lib, c, options)
    })
    const axisConfig = (axis: Record<string, unknown> | undefined, type: 'x' | 'y'): unknown => {
      if (!axis) return undefined
      return new lib.Axis({ ...(materializeValue(axis) as Record<string, unknown>), type, duration })
    }
    return {
      containerType: 'xy',
      containerConfig: {
        ...base,
        components,
        xAxis: axisConfig(spec.xAxis, 'x'),
        yAxis: axisConfig(spec.yAxis, 'y'),
        ...size,
        duration,
        onRenderComplete: options.onRenderComplete,
      },
      data: spec.data,
    }
  }

  if (spec.components.length !== 1) throw new ChartInputError('single container requires exactly one component')
  const component = instantiateComponent(lib, spec.components[0], options)
  return {
    containerType: 'single',
    containerConfig: {
      ...base,
      component,
      ...size,
      duration,
      onRenderComplete: options.onRenderComplete,
    },
    data: spec.data,
  }
}
