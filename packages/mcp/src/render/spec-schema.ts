/** The ChartSpec contract as a zod schema.
 *
 * The TypeScript interface types the IR for this codebase; this schema is the
 * same contract for everyone else — hosts that persist specs, build them by
 * hand, or validate before rendering. `scripts/generate-spec-schema.mjs`
 * emits it as JSON Schema (shipped as `@unovis/mcp/chart-spec.schema.json`),
 * and test/spec-schema.test.ts holds three lines of defense: the emitted file
 * matches this source, every recipe-produced spec validates, and the frozen
 * v1 baseline stays additively compatible.
 */
import { z } from 'zod'

import { XY_COMPONENTS, SINGLE_COMPONENTS } from './materialize.js'

const fieldType = z.enum(['number', 'string', 'date'])

/** One schema per accessor form so validation errors name the exact shape */
export const accessorRefSchema = z.union([
  z.object({ $field: z.string(), as: fieldType.optional() }).strict()
    .describe('d => coerce(d[field])'),
  z.object({ $index: z.literal(true) }).strict().describe('(d, i) => i'),
  z.object({ $const: z.unknown() }).strict().describe('() => value'),
  z.object({ $dateTickFormat: z.literal(true) }).strict()
    .describe('Locale-aware date tick formatter'),
  z.object({ $numTickFormat: z.literal(true) }).strict()
    .describe('Locale-aware number tick formatter'),
  z.object({ $lookup: z.array(z.union([z.string(), z.number()])) }).strict()
    .describe('(d, i) => values[i % values.length]'),
  z.object({
    $format: z.object({ field: z.string(), prefix: z.string().optional(), suffix: z.string().optional() }).strict(),
  }).strict().describe('d => prefix + formatNumber(d[field]) + suffix'),
  z.object({
    $mapField: z.object({ field: z.string(), mapping: z.record(z.string(), z.string()), fallback: z.string().optional() }).strict(),
  }).strict().describe('d => mapping[String(d[field])] ?? fallback'),
])

const axisSchema = z.object({
  label: z.string().optional(),
  gridLine: z.boolean().optional(),
  numTicks: z.number().optional(),
  tickFormat: accessorRefSchema.optional(),
  domainLine: z.boolean().optional(),
  tickTextAngle: z.number().optional(),
  tickValues: z.array(z.number()).optional(),
}).catchall(z.unknown())

export const chartSpecSchema = z.object({
  specVersion: z.string().regex(/^\d+\.\d+$/).optional()
    .describe('ChartSpec contract version as major.minor (see SPEC_VERSION). While the major is 0, breaking changes bump the minor; from 1.0 on, minors are additive and only the major breaks'),
  container: z.enum(['xy', 'single']),
  width: z.number().positive(),
  height: z.number().positive(),
  theme: z.enum(['light', 'dark']),
  title: z.string().optional(),
  /** Extra container options — deliberately open: the escape hatch to Unovis
   * config the tool schemas don't expose */
  containerConfig: z.record(z.string(), z.unknown()).optional(),
  components: z.array(z.object({
    type: z.enum([...XY_COMPONENTS, ...SINGLE_COMPONENTS] as [string, ...string[]]),
    /** Component config is open for the same reason as containerConfig;
     * accessor descriptors are validated where they appear in typed slots */
    config: z.record(z.string(), z.unknown()),
  }).strict()).min(1),
  xAxis: axisSchema.optional(),
  yAxis: axisSchema.optional(),
  colors: z.array(z.string()).optional(),
  locale: z.string().optional()
    .describe('BCP-47 locale for date/number formatting (default en-US)'),
  legend: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
    paletteIndex: z.number().int().optional(),
  }).strict()).optional(),
  data: z.unknown(),
}).strict()

export type ChartSpecFromSchema = z.infer<typeof chartSpecSchema>
