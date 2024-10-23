/* eslint-disable @typescript-eslint/naming-convention */
import { FrameworkTabProps } from '../components/framework-tabs'
import { ComponentInfo, PropInfo, parseComponent as parse, tab, t } from './parser'

type CodeConfig = {
  container?: ComponentInfo;
  components: ComponentInfo[];
  dataType: string;
  declarations: Record<string, string>;
  imports: Record<string, string[]>;
  visImports: string[];
}

function getImportString (imports: Record<string, string[]>, indent?: boolean): string {
  return `${Object.keys(imports).map(i => `${indent ? t : ''}import { ${imports[i].join(', ')} } from '${i}'`).join('\n')}\n`
}

export function getAngularStrings (config: CodeConfig, importedProps: string[], inlineTemplate: boolean): FrameworkTabProps['angular'] {
  const { components, container, declarations, imports } = config
  const { data, ...rest } = declarations
  const tsLines: string[] = []

  const html = container
    ? parse.angular(container).replace('><', `>\n${t}${components.map(c => parse.angular(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parse.angular(c)).join('\n')

  importedProps.forEach(i => {
    if (html.includes(i)) rest[i] = i
  })

  if (imports || Object.values(declarations).length) {
    if (importedProps.length) tsLines.push(getImportString(imports))

    tsLines.push('@Component({')
    const template = inlineTemplate
      ? `  template: ${html.includes('\n') ? `\`\n    ${html.split('\n').join('\n    ')}\n  \`` : `'${html}'`}`
      : '  templateUrl: \'template.html\''
    tsLines.push(template)
    tsLines.push('})')

    if (data || Object.values(rest).length) {
      tsLines.push('export class Component {')
      if (data) tsLines.push(`${t}@Input ${data};`)
      tsLines.push(...Object.entries(rest).map(d => `${t}${d.join(' = ')}`))
      tsLines.push('}')
    }
  }

  return {
    html: inlineTemplate ? undefined : html,
    ts: tsLines.length ? tsLines.join('\n') : undefined,
  }
}

export function getReactStrings (config: CodeConfig): string {
  const { components, container, declarations, imports, visImports } = config
  const { data, ...rest } = declarations
  const lines: string[] = []

  let indentLevel = 0
  let containerString: string

  if (imports || Object.values(declarations).length) {
    if (imports) {
      lines.push(getImportString({ '@unovis/react': visImports, ...imports }))
    }

    lines.push('function Component(props) {')
    if (data) lines.push(`${t}const ${data} = props.data`)
    lines.push(...Object.entries(rest).map(d => `${t}const ${d.join(' = ')}`))
    lines.push(`\n${t}return (`)
    indentLevel += 2
  }

  if (container) {
    containerString = `${parse.react(container, true, indentLevel)}`
    indentLevel++
  }
  const componentString = `${components.map(c => parse.react(c, false, indentLevel)).join('\n')}`
  lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

  if (indentLevel) {
    lines.push(`${tab(--indentLevel)})`)
    if (indentLevel) lines.push('}')
  }
  return lines.join('\n')
}

export function getSvelteStrings (config: CodeConfig): string {
  const { components, container, declarations, imports, visImports } = config
  const { data, ...rest } = declarations
  const lines: string[] = []

  const html = container
    ? parse.svelte(container, true).replace('><', `>\n${t}${components.map(c => parse.svelte(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parse.svelte(c)).join('\n')

  if (!imports && !Object.keys(declarations).length) {
    return html
  }

  lines.push(getImportString({ '@unovis/svelte': visImports, ...imports }, true))
  if (data) lines.push(`${t}export let ${data}`)
  Object.entries(rest).forEach(d => lines.push(`${t}const ${d.join(' = ')}`))
  return `<script lang='ts'>\n${lines.join('\n')}\n</script>\n\n${html}`
}

export function getVueStrings (config: CodeConfig): string {
  const { components, container, declarations, imports, visImports } = config
  const { data, ...rest } = declarations
  const lines: string[] = []
  const indent = imports || Object.keys(declarations).length
  const html = container
    ? parse.vue(container, true, indent ? 1 : 0)
      .replace('><', `>\n${components.map(c => parse.vue(c, false, indent ? 2 : 1))
        .join('\n')}\n${indent ? t : ''}<`)
    : components.map(c => parse.vue(c, false, indent ? 1 : 0)).join('\n')

  if (!imports && !Object.keys(declarations).length) {
    return html
  }
  lines.push(getImportString({ '@unovis/vue': visImports, ...imports }))
  if (data) lines.push(`const props = defineProps<{ ${data} }>()`)
  Object.entries(rest).forEach(d => lines.push(`const ${d.join(' = ')}`))
  return `<script setup lang="ts">\n${lines.join('\n')}\n</script>\n\n<template>\n${html}\n</template>`
}

export function getSolidStrings (config: CodeConfig): string {
  const { components, container, declarations, imports, visImports } = config
  const { data, ...rest } = declarations
  const lines: string[] = []

  let indentLevel = 0
  let containerString: string

  if (imports || Object.values(declarations).length) {
    if (imports) {
      lines.push(getImportString({ '@unovis/solid': visImports, ...imports }))
    }

    lines.push('function Component(props) {')
    if (data) lines.push(`${t}const ${data} = () => props.data`)
    lines.push(...Object.entries(rest).map(d => `${t}const ${d.join(' = ')}`))
    lines.push(`\n${t}return (`)
    indentLevel += 2
  }

  if (container) {
    containerString = `${parse.solid(container, true, indentLevel)}`
    if (data) containerString = containerString.replace('{data}', '{data()}')
    indentLevel++
  }
  const componentString = `${components.map(c => parse.solid(c, false, indentLevel)).join('\n')}`
  lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

  if (indentLevel) {
    lines.push(`${tab(--indentLevel)})`)
    if (indentLevel) lines.push('}')
  }
  return lines.join('\n')
}

export function getTypescriptStrings (config: CodeConfig, mainComponentName: string, isStandAlone: boolean): string {
  const { components, container, dataType, declarations, imports, visImports } = config
  const { data, ...vars } = declarations
  const lines: string[] = []

  const getPropDetails = (props = []): PropInfo[] => props.map(p => {
    delete vars[p.key]
    return { ...p, value: declarations[p.key] || p.value }
  }).filter(d => d.key !== 'data')

  const mainComponent = components.find(c => c.name === mainComponentName)

  // Import statements
  if (imports) {
    // Component names
    const items = { '@unovis/ts': [], ...imports }
    items['@unovis/ts'] = [...new Set([...visImports.map(v => v.substring(3)), ...items['@unovis/ts']])]

    // Local data
    const customType = dataType !== undefined && !['number', 'string', 'MapData'].includes(dataType)
    if (data || customType) {
      items['./data'] = []
      if (data) items['./data'].push('data')
      if (customType) items['./data'].push(...dataType.split(','))
    }
    lines.push(getImportString(items))
  }

  // Remove relevant props from declarations
  const containerConfig: Record<string, string[]> = {}
  const containerProps = getPropDetails(container?.props)
  const mainProps = getPropDetails(mainComponent?.props)

  // Add declarations
  if (Object.keys(vars).length) {
    Object.keys(vars).forEach(d => {
      lines.push(`const ${d} = ${vars[d]}`)
    })
    lines.push('')
  }

  components.forEach(c => {
    if (!containerConfig[c.key]) containerConfig[c.key] = []
    if (c.name === mainComponentName) {
      const varName = c.name.charAt(0).toLowerCase().concat(mainComponentName.slice(1))
      const varDef = parse.typescript(c.name, mainProps, dataType, isStandAlone, isStandAlone && mainComponent.props.find(p => p.key === 'data') !== undefined)
      if (!Object.keys(vars).length && imports && !isStandAlone) {
        containerConfig[c.key] = [varDef.replace(/\n/gm, '\n  '), ...containerConfig[c.key]]
      } else {
        lines.push(`const ${varName} = ${varDef}`)
        containerConfig[c.key] = [varName, ...containerConfig[c.key]]
      }
    } else {
      containerConfig[c.key].push(parse.typescript(c.name, c.props))
    }
  })

  if (container) {
    const items = Object.entries(containerConfig).map(([k, v]) => ({
      key: k,
      value: k === 'components' ? `[${v.toString().length > 70 ? `\n${tab(2)}${v.join(`\n${tab(2)}`)}\n${t}` : v.join(', ')}]` : v.join(','),
      stringLiteral: false,
    }))
    lines.push(`const container = ${
      parse.typescript(container.name, containerProps.concat(items), dataType, true, true)
    }`)
  }
  return lines.join('\n')
}
