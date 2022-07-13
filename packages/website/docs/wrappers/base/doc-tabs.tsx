import React from 'react'

import { FrameworkTabProps, FrameworkTabs } from '../../components/framework-tabs'
import { ComponentInfo, PropInfo, parseProps, parseComponent as parse, tab, t } from '../../utils/parser'
import { DocTabsProps, ContextLevel } from './types'

type CodeConfig = {
  container?: ComponentInfo;
  components: ComponentInfo[];
  dataType: string;
  declarations: Record<string, string>;
  importString?: string | undefined;
}

function getAngularStrings (config: CodeConfig, importedProps: string[], inlineTemplate: boolean): FrameworkTabProps['angular'] {
  const { components, container, dataType, declarations, importString } = config
  const { data, ...rest } = declarations

  const html = container
    ? parse.angular(container).replace('><', `>\n${t}${components.map(c => parse.angular(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parse.angular(c)).join('\n')

  importedProps.forEach(i => {
    if (html.includes(i)) rest[i] = i
  })

  const tsLines: string[] = []
  if (importString || Object.values(declarations).length) {
    if (importString) tsLines.push(importString)
    importedProps.forEach(i => {
      rest[i] = i
    })

    tsLines.push('@Component({')
    const template = inlineTemplate
      ? `  template: ${html.includes('\n') ? `\`\n    ${html.split('\n').join('\n    ')}\n  \`` : `'${html}'`}`
      : '  templateUrl: \'template.html\''
    tsLines.push(template)
    tsLines.push('})')

    if (data || Object.values(rest).length) {
      tsLines.push(`export class Component<${dataType}>{`)
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

function getReactStrings ({ components, container, dataType, declarations, importString }: CodeConfig): string {
  const lines: string[] = []
  let indentLevel = 0
  let containerString: string

  if (importString) {
    const reactImports = (container ? [container, ...components] : components).map(c => `Vis${c.name}`).join(', ')
    lines.push(`import { ${reactImports} } from '@volterra/vis-react'\n${importString}`)
  }
  if (Object.values(declarations).length) {
    const { data, ...rest } = declarations
    lines.push(`function Component<${dataType}>(props) {`)
    if (data) lines.push(`${t}const ${data} = props.data`)
    lines.push(...Object.entries(rest).map(d => `${t}const ${d.join(' = ')}`))
    lines.push(`\n${t}return (`)
    indentLevel += 2
  } else if (importString) {
    lines.push('const Component = () => (')
    indentLevel++
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

function getSvelteStrings (config: CodeConfig): string {
  const { components, container, declarations, importString } = config

  const html = container
    ? parse.svelte(container, true).replace('><', `>\n${t}${components.map(c => parse.svelte(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parse.svelte(c)).join('\n')

  if (!importString && !Object.keys(declarations).length) {
    return html
  }
  const lines: string[] = []
  const imports = (container ? [container, ...components] : components).map(c => `Vis${c.name}`).join(', ')
  lines.push(`${t}import { ${imports} } from '@volterra/vis-svelte'`)
  if (importString) lines.push(`${t}${importString}`)

  const { data, ...rest } = declarations
  if (data) lines.push(`${t}export let ${data}`)
  Object.entries(rest).forEach(d => lines.push(`${t}const ${d.join(' = ')}`))
  return `<script lang='ts'>\n${lines.join('\n')}\n</script>\n\n${html}`
}

function getTypescriptStrings (config: CodeConfig, mainComponent: string): string {
  const { components, container, dataType, declarations, importString } = config
  const { data, ...vars } = declarations
  const lines: string[] = []

  if (importString) lines.push(importString)
  if (data) {
    lines.push(`const ${data} = getData()\n`)
    if (container) container.props = container.props.filter(d => d.key !== 'data')
  }

  const getPropDetails = (props: PropInfo[]): PropInfo[] => props?.map(p => ({ ...p, value: declarations[p.key] || p.value }))

  // process config
  const containerConfig: Record<string, string[]> = {}
  components.forEach(c => {
    if (!containerConfig[c.key]) {
      containerConfig[c.key] = []
    }
    if (c.name !== mainComponent) {
      containerConfig[c.key].push(parse.typescript('', c))
    } else {
      const name = mainComponent.charAt(0).toLowerCase().concat(mainComponent.slice(1))
      containerConfig[c.key] = [name, ...containerConfig[c.key]]
    }
  })

  // push import string and data declaration
  if (importString) lines.push(importString)
  if (data) lines.push(`const ${data} = getData()\n`)

  // process props before adding remaining declarations
  const main = mainComponent && components.find(c => c.name === mainComponent)
  const mainProps = getPropDetails(main?.props)
  const containerProps = getPropDetails(container?.props)
  if (Object.keys(vars).length) {
    Object.keys(vars).forEach(d => {
      lines.push(`const ${d} = ${vars[d]}`)
    })
    lines.push('')
  }

  // add main component declaration
  if (main) {
    const name = mainComponent.charAt(0).toLowerCase().concat(mainComponent.slice(1))
    lines.push(parse.typescript(
      `const ${name} = `, {
        ...main,
        props: mainProps,
      },
      dataType))
    containerConfig[main.key] = [name]
  }

  // add container component declaration
  if (container) {
    lines.push(`const chart = new ${container.name}(containerNode, {`)
    if (containerProps.length) {
      lines.push(`${t}${containerProps.map(p => [p.key, p.value].join(': ')).join(`,\n${t}`)},`)
    }
    Object.entries(containerConfig).forEach(([k, v]) => {
      const val = k === 'components'
        ? (v?.length > 1 ? `[\n${tab(2)}${v.join(`\n${tab(2)}`)}\n${t}]`
          : `[${v.join(',')}]`) : v
      lines.push(`${t}${[k, val].join(': ')},`)
    })
    lines.push('}, data)\n')
  }
  return lines.join('\n')
}

/* Displays code snippets with framework tabs */
export function DocFrameworkTabs ({
  components,
  container,
  context,
  dataType,
  declarations = {},
  hideTabLabels,
  imports,
  mainComponent,
  showData,
}: DocTabsProps): JSX.Element {
  const children = !context || context === ContextLevel.Minimal
    ? [components.find(c => c.name === mainComponent)]
    : components

  if (showData) {
    declarations.data = `data: ${dataType.includes(',') ? `${dataType.split(/(?=[A-Z])/)[0]}Data` : `${dataType}[]`}`
  }

  const importedProps = []// imports ? Object.values(imports).flatMap(i => i) : []
  const tabConfig = {
    container: (context === ContextLevel.Container || context === ContextLevel.Full) && {
      name: container.name,
      props: parseProps(container.props, dataType, importedProps, declarations),
    },
    components: children?.map(c => ({
      ...c,
      props: parseProps(c.props, dataType, importedProps, declarations),
    })),
    dataType: dataType,
    declarations: context ? declarations : {},
    importString: imports && `${Object.keys(imports).map(i => `import { ${imports[i].join(', ')} } from '${i}'`).join('\n')}\n`,
  }

  return (
    <FrameworkTabs
      angular={getAngularStrings(tabConfig, importedProps, context === ContextLevel.Minimal)}
      react={getReactStrings(tabConfig)}
      svelte={getSvelteStrings(tabConfig)}
      typescript={getTypescriptStrings(tabConfig, mainComponent && context !== ContextLevel.Container && mainComponent)}
      hideTabLabels={hideTabLabels}
      showTitles={context !== undefined}
    />
  )
}
