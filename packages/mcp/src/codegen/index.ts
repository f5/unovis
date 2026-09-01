/** ChartSpec → runnable Unovis code.
 *
 * The same spec that renders headlessly can be emitted as source for any
 * Unovis wrapper, which turns the server into a scaffolding tool: ask for a
 * chart, get code you can paste into your app. Accessor descriptors become
 * arrow functions, `{ $unovisMap }` markers become map imports, and the data
 * is emitted alongside so the snippet runs as-is.
 */
import { isAccessorRef } from '../render/spec.js'
import type { AccessorRef, ChartSpec, ComponentSpec } from '../render/spec.js'

export const FRAMEWORKS = ['ts', 'react', 'svelte', 'vue', 'angular', 'solid'] as const
export type Framework = typeof FRAMEWORKS[number]

export interface GeneratedFile {
  /** Suggested file name */
  name: string;
  /** Fenced-code language hint */
  language: string;
  content: string;
}

/** Collected while walking the spec: helper consts and imports the code needs */
interface Emit {
  helpers: string[];
  mapImports: Set<string>;
  /** Enum types referenced by generated props */
  enumImports: Set<string>;
  /** kebab-case component names for Angular templates need class-side fields */
  fields: { name: string; value: string }[];
}

const indent = (text: string, spaces: number): string =>
  text.split('\n').map(line => (line ? ' '.repeat(spaces) + line : line)).join('\n')

const camelToKebab = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()

/** JSON with single-quoted strings, matching the repo's code style */
// eslint-disable-next-line @typescript-eslint/no-use-before-define
const json = (value: unknown, spaces = 2): string => requote(JSON.stringify(value, null, spaces))

/** Swap JSON's double quotes for single quotes. Works on the already-escaped
 * string bodies, so `\n`, `\u2028` and friends survive untouched; a string
 * that itself contains a single quote keeps its double quotes (the
 * `avoidEscape` style) instead of growing backslashes. The scan is a single
 * pass — JSON.stringify output is well-formed, but the data inside it is
 * caller-supplied. */
function requote (jsonText: string): string {
  let out = ''
  let i = 0
  while (i < jsonText.length) {
    if (jsonText[i] !== '"') {
      out += jsonText[i]
      i += 1
      continue
    }
    let end = i + 1
    while (end < jsonText.length && jsonText[end] !== '"') end += jsonText[end] === '\\' ? 2 : 1
    const body = jsonText.slice(i + 1, end)
    out += body.includes("'") ? `"${body}"` : `'${body.replace(/\\"/g, '"')}'`
    i = end + 1
  }
  return out.replace(/'([A-Za-z_$][\w$]*)':/g, '$1:') // unquote plain object keys
}

/** One record per line — readable for the dozens of rows charts usually carry */
function dataLiteralFor (data: unknown): string {
  if (!Array.isArray(data)) return json(data)
  const rows = data.map(record => {
    if (typeof record !== 'object' || record === null) return `  ${json(record, 0)},`
    const fields = Object.entries(record)
      .map(([key, value]) => `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : json(key)}: ${json(value, 0)}`)
    return `  { ${fields.join(', ')} },`
  })
  return `[\n${rows.join('\n')}\n]`
}

/** Values that are safe to inline; anything larger is referenced by import */
const isBigMapPayload = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && 'objects' in (value as Record<string, unknown>)

function addHelper (emit: Emit, code: string): void {
  if (!emit.helpers.includes(code)) emit.helpers.push(code)
}

/** An accessor descriptor as a source expression */
function accessorExpression (ref: AccessorRef, emit: Emit): string {
  if ('$field' in ref) {
    const access = `d.${/^[A-Za-z_$][\w$]*$/.test(ref.$field) ? ref.$field : `['${ref.$field}']`}`
    if (ref.as === 'date') return `d => new Date(${access}).getTime()`
    return `d => ${access}`
  }
  if ('$index' in ref) return '(d, i) => i'
  if ('$const' in ref) return `() => ${json(ref.$const)}`
  if ('$numTickFormat' in ref) {
    addHelper(emit, "const formatNumber = (value: number | Date): string =>\n  Number(value).toLocaleString('en-US', { maximumFractionDigits: 6 })")
    return 'formatNumber'
  }
  if ('$dateTickFormat' in ref) {
    addHelper(emit, "const formatDate = (value: number | Date): string =>\n  new Date(Number(value)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })")
    return 'formatDate'
  }
  if ('$lookup' in ref) {
    addHelper(emit, `const categories = ${json(ref.$lookup)}`)
    return '(index: number | Date) => categories[Math.round(Number(index))]'
  }
  if ('$format' in ref) {
    const { field, prefix = '', suffix = '' } = ref.$format
    addHelper(emit, "const formatNumber = (value: number): string => value.toLocaleString('en-US', { maximumFractionDigits: 6 })")
    return `d => \`${prefix}\${formatNumber(d.${field})}${suffix}\``
  }
  if ('$mapField' in ref) {
    const { field, mapping, fallback } = ref.$mapField
    const name = `colorBy${field.charAt(0).toUpperCase()}${field.slice(1)}`
    addHelper(emit, `const ${name}: Record<string, string> = ${json(mapping)}`)
    return `d => ${name}[d.${field}]${fallback ? ` ?? '${fallback}'` : ''}`
  }
  return 'undefined'
}

/** A config value as a source expression, or undefined to skip the prop */
function valueExpression (value: unknown, emit: Emit): string | undefined {
  if (value === undefined) return undefined
  if (isAccessorRef(value)) return accessorExpression(value, emit)

  // Map data: import the topojson instead of inlining megabytes
  const marker = (value as { $unovisMap?: string })?.$unovisMap
  if (marker) {
    emit.mapImports.add(marker)
    return marker
  }
  if (isBigMapPayload(value)) return undefined

  if (Array.isArray(value)) {
    const parts = value.map(item => valueExpression(item, emit)).filter((v): v is string => v !== undefined)
    return `[${parts.join(', ')}]`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .map(([key, item]) => {
        const expr = valueExpression(item, emit)
        return expr === undefined ? undefined : `${key}: ${expr}`
      })
      .filter((v): v is string => v !== undefined)
    return `{ ${entries.join(', ')} }`
  }
  return json(value)
}

/** Config props whose types are enums rather than plain strings — a string
 * literal would not type-check, so the enum member is emitted and imported.
 * (Most Unovis enums are declared `Enum | string`; these are not.) */
const ENUM_PROPS: Record<string, string> = {
  curveType: 'CurveType',
}

const enumMember = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

interface Prop { name: string; expr: string }

function componentProps (component: ComponentSpec, emit: Emit): Prop[] {
  return Object.entries(component.config)
    .map(([name, value]) => {
      const enumName = ENUM_PROPS[name]
      if (enumName && typeof value === 'string') {
        emit.enumImports.add(enumName)
        return { name, expr: `${enumName}.${enumMember(value)}` }
      }
      const expr = valueExpression(value, emit)
      return expr === undefined ? undefined : { name, expr }
    })
    .filter((p): p is Prop => p !== undefined)
}

function axisProps (spec: ChartSpec, axis: 'x' | 'y', emit: Emit): Prop[] | undefined {
  const config = axis === 'x' ? spec.xAxis : spec.yAxis
  if (!config) return undefined
  const props: Prop[] = [{ name: 'type', expr: `'${axis}'` }]
  for (const [name, value] of Object.entries(config)) {
    const expr = valueExpression(value, emit)
    if (expr !== undefined) props.push({ name, expr })
  }
  return props
}

// ── emitters ────────────────────────────────────────────────────────────────

const containerName = (spec: ChartSpec): string => spec.container === 'xy' ? 'XYContainer' : 'SingleContainer'

const preamble = (emit: Emit, dataLiteral: string, includeEnumImport = false): string => {
  const blocks: string[] = []
  // Enums live in the core package even when components come from a wrapper
  if (includeEnumImport && emit.enumImports.size) {
    blocks.push(`import { ${[...emit.enumImports].sort().join(', ')} } from '@unovis/ts'`)
  }
  if (emit.mapImports.size) {
    blocks.push(`import { ${[...emit.mapImports].join(', ')} } from '@unovis/ts/maps'`)
  }
  blocks.push(dataLiteral)
  if (emit.helpers.length) blocks.push(emit.helpers.join('\n\n'))
  return blocks.join('\n\n')
}

/** Vanilla TypeScript, using the imperative API */
function emitTs (spec: ChartSpec, emit: Emit): GeneratedFile {
  const components = spec.components.map(c => ({ type: c.type, props: componentProps(c, emit) }))
  const xAxis = axisProps(spec, 'x', emit)
  const yAxis = axisProps(spec, 'y', emit)

  const componentVars = components.map((c, i) => {
    const varName = components.length > 1 ? `${c.type.charAt(0).toLowerCase()}${c.type.slice(1)}${i + 1}` : c.type.charAt(0).toLowerCase() + c.type.slice(1)
    const props = c.props.map(p => `  ${p.name}: ${p.expr},`).join('\n')
    return { varName, code: `const ${varName} = new ${c.type}<DataRecord>({\n${props}\n})` }
  })

  const containerProps: string[] = []
  if (spec.container === 'xy') {
    containerProps.push(`components: [${componentVars.map(c => c.varName).join(', ')}]`)
    if (xAxis) containerProps.push(`xAxis: new Axis<DataRecord>({ ${xAxis.filter(p => p.name !== 'type').map(p => `${p.name}: ${p.expr}`).join(', ')} })`)
    if (yAxis) containerProps.push(`yAxis: new Axis<DataRecord>({ ${yAxis.filter(p => p.name !== 'type').map(p => `${p.name}: ${p.expr}`).join(', ')} })`)
  } else {
    containerProps.push(`component: ${componentVars[0].varName}`)
  }
  containerProps.push(`height: ${spec.height}`)

  const imports = ['Axis', containerName(spec), ...components.map(c => c.type), ...emit.enumImports]
    .filter((name, i, all) => all.indexOf(name) === i && (name !== 'Axis' || xAxis || yAxis))
    .sort()

  const legend = spec.legend?.length
    ? `\n// Legend (renders into its own element)\nconst legend = new BulletLegend(document.getElementById('legend') as HTMLElement, {\n  items: ${json(spec.legend.map(item => ({ name: item.name })))},\n})\n`
    : ''
  if (spec.legend?.length) imports.push('BulletLegend')

  const content = `import { ${imports.sort().join(', ')} } from '@unovis/ts'

${preamble(emit, `const data = ${dataLiteralFor(spec.data)}\n\ntype DataRecord = typeof data[number]`)}

${componentVars.map(c => c.code).join('\n\n')}

const container = document.getElementById('chart') as HTMLElement
const chart = new ${containerName(spec)}<DataRecord>(container, {
${containerProps.map(p => `  ${p},`).join('\n')}
}, data)
${legend}`
  return { name: 'chart.ts', language: 'typescript', content }
}

/** JSX-based wrappers (React and Solid share their shape) */
function emitJsx (spec: ChartSpec, emit: Emit, framework: 'react' | 'solid'): GeneratedFile {
  const components = spec.components.map(c => ({ type: c.type, props: componentProps(c, emit) }))
  const xAxis = axisProps(spec, 'x', emit)
  const yAxis = axisProps(spec, 'y', emit)

  const tag = (name: string): string => `Vis${name}`
  const renderProps = (props: Prop[]): string =>
    props.map(p => p.expr.startsWith("'") ? ` ${p.name}=${p.expr.replace(/'/g, '"')}` : ` ${p.name}={${p.expr}}`).join('')

  const children = [
    ...components.map(c => `<${tag(c.type)} data={data}${renderProps(c.props)} />`),
    ...(xAxis ? [`<${tag('Axis')}${renderProps(xAxis)} />`] : []),
    ...(yAxis ? [`<${tag('Axis')}${renderProps(yAxis)} />`] : []),
  ]

  const used = [`Vis${containerName(spec)}`, ...components.map(c => tag(c.type)), ...(xAxis || yAxis ? ['VisAxis'] : [])]
  const legendTag = spec.legend?.length ? `<VisBulletLegend items={${json(spec.legend.map(i => ({ name: i.name })), 0)}} />\n      ` : ''
  if (spec.legend?.length) used.push('VisBulletLegend')

  const pkg = framework === 'react' ? '@unovis/react' : '@unovis/solid'
  const header = framework === 'react'
    ? `import React from 'react'\nimport { ${[...new Set(used)].sort().join(', ')} } from '${pkg}'`
    : `import type { JSX } from 'solid-js'\nimport { ${[...new Set(used)].sort().join(', ')} } from '${pkg}'`
  const signature = framework === 'react'
    ? 'export default function Chart (): JSX.Element {'
    : 'const Chart = (): JSX.Element => {'
  const footer = framework === 'react' ? '}' : '}\n\nexport default Chart'

  const content = `${header}

${preamble(emit, `const data = ${dataLiteralFor(spec.data)}`, true)}

${signature}
  return (
    <>
      ${legendTag}<Vis${containerName(spec)} height={${spec.height}}>
${indent(children.join('\n'), 8)}
      </Vis${containerName(spec)}>
    </>
  )
${footer}
`
  return { name: framework === 'react' ? 'Chart.tsx' : 'Chart.tsx', language: 'tsx', content }
}

/** Svelte and Vue: script block plus template */
function emitTemplate (spec: ChartSpec, emit: Emit, framework: 'svelte' | 'vue'): GeneratedFile {
  const components = spec.components.map(c => ({ type: c.type, props: componentProps(c, emit) }))
  const xAxis = axisProps(spec, 'x', emit)
  const yAxis = axisProps(spec, 'y', emit)
  const tag = (name: string): string => `Vis${name}`

  const bind = (p: Prop): string => {
    if (p.expr.startsWith("'")) return ` ${p.name}=${p.expr.replace(/'/g, '"')}`
    return framework === 'svelte' ? ` ${p.name}={${p.expr}}` : ` :${p.name}="${p.expr.replace(/"/g, "'")}"`
  }
  const dataBind = framework === 'svelte' ? ' {data}' : ' :data="data"'
  const heightBind = framework === 'svelte' ? `height={${spec.height}}` : `:height="${spec.height}"`

  const children = [
    ...components.map(c => `<${tag(c.type)}${dataBind}${c.props.map(bind).join('')} />`),
    ...(xAxis ? [`<${tag('Axis')}${xAxis.map(bind).join('')} />`] : []),
    ...(yAxis ? [`<${tag('Axis')}${yAxis.map(bind).join('')} />`] : []),
  ]

  const used = [`Vis${containerName(spec)}`, ...components.map(c => tag(c.type)), ...(xAxis || yAxis ? ['VisAxis'] : [])]
  const pkg = framework === 'svelte' ? '@unovis/svelte' : '@unovis/vue'
  const script = `import { ${[...new Set(used)].sort().join(', ')} } from '${pkg}'\n\n${preamble(emit, `const data = ${dataLiteralFor(spec.data)}`, true)}`

  if (framework === 'svelte') {
    return {
      name: 'Chart.svelte',
      language: 'svelte',
      content: `<script lang="ts">\n${indent(script, 2)}\n</script>\n\n<Vis${containerName(spec)} ${heightBind}>\n${indent(children.join('\n'), 2)}\n</Vis${containerName(spec)}>\n`,
    }
  }
  return {
    name: 'Chart.vue',
    language: 'vue',
    content: `<script setup lang="ts">\n${script}\n</script>\n\n<template>\n  <Vis${containerName(spec)} ${heightBind}>\n${indent(children.join('\n'), 4)}\n  </Vis${containerName(spec)}>\n</template>\n`,
  }
}

/** Angular: a template plus the component class holding the accessors */
/** Add parameter types to accessor arrows: Angular class fields get no
 * contextual typing, so bare `d => ...` would be an implicit any */
function annotateParams (expr: string): string {
  return expr
    .replace(/^\(d, i\) =>/, '(d: DataRecord, i: number) =>')
    .replace(/^d =>/, '(d: DataRecord) =>')
}

function emitAngular (spec: ChartSpec, emit: Emit): GeneratedFile[] {
  const components = spec.components.map(c => ({ type: c.type, props: componentProps(c, emit) }))
  const xAxis = axisProps(spec, 'x', emit)
  const yAxis = axisProps(spec, 'y', emit)

  // Angular templates can't hold arrow functions, so every non-literal prop
  // becomes a class field the template binds to
  let counter = 0
  const fields: { name: string; expr: string }[] = []
  const bind = (componentType: string, p: Prop): string => {
    if (p.expr.startsWith("'")) return ` ${p.name}=${p.expr.replace(/'/g, '"')}`
    if (/^[-\d.]+$|^(true|false)$/.test(p.expr)) return ` [${p.name}]="${p.expr}"`
    const fieldName = `${componentType.charAt(0).toLowerCase()}${componentType.slice(1)}${p.name.charAt(0).toUpperCase()}${p.name.slice(1)}${counter++}`
    fields.push({ name: fieldName, expr: annotateParams(p.expr) })
    return ` [${p.name}]="${fieldName}"`
  }

  const lines = [
    ...components.map(c => {
      const t = camelToKebab(c.type)
      return `<vis-${t} [data]="data"${c.props.map(p => bind(c.type, p)).join('')}></vis-${t}>`
    }),
    ...(xAxis ? [`<vis-axis${xAxis.map(p => bind('xAxis', p)).join('')}></vis-axis>`] : []),
    ...(yAxis ? [`<vis-axis${yAxis.map(p => bind('yAxis', p)).join('')}></vis-axis>`] : []),
  ]
  const containerTag = camelToKebab(containerName(spec))

  const template = `<vis-${containerTag} [height]="${spec.height}">\n${indent(lines.join('\n'), 2)}\n</vis-${containerTag}>\n`
  const klass = `import { Component } from '@angular/core'

${preamble(emit, `export const data = ${dataLiteralFor(spec.data)}\n\nexport type DataRecord = typeof data[number]`, true)}

@Component({
  selector: 'unovis-chart',
  templateUrl: './chart.component.html',
})
export class ChartComponent {
  data = data
${fields.map(f => `  ${f.name} = ${f.expr}`).join('\n')}
}
`
  return [
    { name: 'chart.component.html', language: 'html', content: template },
    { name: 'chart.component.ts', language: 'typescript', content: klass },
  ]
}

/** Generate source files for a spec. Angular returns two files. */
export function generateCode (spec: ChartSpec, framework: Framework): GeneratedFile[] {
  const emit: Emit = { helpers: [], mapImports: new Set(), enumImports: new Set(), fields: [] }
  switch (framework) {
    case 'react': return [emitJsx(spec, emit, 'react')]
    case 'solid': return [emitJsx(spec, emit, 'solid')]
    case 'svelte': return [emitTemplate(spec, emit, 'svelte')]
    case 'vue': return [emitTemplate(spec, emit, 'vue')]
    case 'angular': return emitAngular(spec, emit)
    default: return [emitTs(spec, emit)]
  }
}

/** Render generated files as one markdown-ish block for a tool result */
export function formatGeneratedFiles (files: GeneratedFile[]): string {
  if (files.length === 1) return `\`\`\`${files[0].language}\n${files[0].content}\`\`\``
  return files.map(file => `**${file.name}**\n\n\`\`\`${file.language}\n${file.content}\`\`\``).join('\n\n')
}
