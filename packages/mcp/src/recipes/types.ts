import type { ZodRawShape, ZodObject, infer as ZodInfer } from 'zod'

import type { ChartSpec } from '../render/spec.js'

/** A recipe maps a simplified, LLM-friendly tool input onto a ChartSpec.
 * `toSpec` must be pure and produce a JSON-serializable spec — it doubles
 * as the `config` output mode and, later, as input for code generation. */
export interface Recipe<Shape extends ZodRawShape = ZodRawShape> {
  /** MCP tool name, e.g. 'generate_line_chart' */
  name: string;
  /** Human-readable title, e.g. 'Line chart' */
  title: string;
  /** LLM-facing tool description — say when to use it and show a data example */
  description: string;
  inputShape: Shape;
  toSpec (input: ZodInfer<ZodObject<Shape>>): ChartSpec;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecipe = Recipe<any>
