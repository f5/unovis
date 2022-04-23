import React from 'react'

import { FrameworkTabProps, FrameworkTabs } from '../../components/framework-tabs'
import { ComponentInfo, PropInfo, parseProps, parseComponent as parse, tab, t } from '../../utils/parser'
import { DocTabsProps, ContextLevel } from './types'

type CodeConfig = {
  container?: ComponentInfo;
  components: ComponentInfo[];
  importString: string | undefined;
  declarations?: Record<string, string>;
}

function getAngularStrings (config: CodeConfig): FrameworkTabProps['angular'] {
  const { components, container, declarations, importString } = config
  const { data, ...rest } = declarations

  const html = container
    ? parse.angular(container).replace('><', `>\n${t}${components.map(c => parse.angular(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parse.angular(c)).join('\n')

  const tsLines = []
  if (importString) tsLines.push(importString)
  if (Object.values(declarations).length) {
    tsLines.push('@Component({ ... })\nclass Component {')
    if (data) tsLines.push(`${t}@Input ${data};`)
    tsLines.push(...Object.entries(rest).map(d => `${t}${d.join(' = ')}`))
    tsLines.push('}')
  }

  return {
    html: html,
    ts: tsLines.join('\n'),
  }
}

function getReactStrings ({ components, container, importString, declarations }: CodeConfig): string {
  const { data, ...rest } = declarations
  const lines = []

  let indentLevel = 0
  let containerString: string

  if (importString) lines.push(importString)
  if (Object.values(declarations).length) {
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
  const componentString = `${components.map(c => parse.react(c, false, indentLevel)).join(`\n${tab(indentLevel)}`)}`
  lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

  if (indentLevel) {
    lines.push(...['  )', '}'])
  }
  return lines.join('\n')
}

function getTypescriptStrings (config: CodeConfig, mainComponent: string, datum: string): string {
  const { components, container, declarations, importString } = config
  const lines = []

  if (importString) lines.push(importString)
  if (declarations.data) {
    lines.push(`const ${declarations.data} = getData()\n`)
    container.props = container.props.filter(d => d.key !== 'data')
  }

  const mainIsContainer = mainComponent && mainComponent.endsWith('Container')
  const getPropDetails = (props: PropInfo[]): PropInfo[] => props.map(p => ({ ...p, value: declarations[p.key] || p.value }))

  const containerConfig: Record<string, string[]> = {}
  if (mainComponent && !mainIsContainer) {
    const name = mainComponent.charAt(0).toLowerCase().concat(mainComponent.slice(1))
    const main = components.find(c => c.name === mainComponent)
    if (main?.props) {
      lines.push(parse.typescript(
        `const ${name} = `, {
          ...main,
          props: main.props.map(p => ({ ...p, value: declarations[p.key] || p.value })),
        },
        datum))
    }
    containerConfig[main.key] = [name]
  }

  if (container) {
    components.forEach(c => {
      if (!containerConfig[c.key]) {
        containerConfig[c.key] = []
      }
      if (c.name !== mainComponent) {
        containerConfig[c.key].push(parse.typescript('', c))
      }
    })
    lines.push(`const chart = new ${container.name}(containerNode, {`)
    if (container.props?.length) {
      const containerProps = mainIsContainer
        ? getPropDetails(container.props).map(p => [p.key, p.value].join(': '))
        : container.props.map(p => p.value)
      lines.push(`${t}${containerProps.join(`,\n${t}`)},`)
    }
    Object.entries(containerConfig).forEach(([k, v]) => {
      const val = k === 'components' ? (v?.length > 1 ? `[\n${v.join(`\n${t}`)}\n]` : `[${v.join(',')}]`) : v
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
  hideTabLabels,
  mainComponent,
  dataType,
  imports,
}: DocTabsProps): JSX.Element {
  const declarations: Record<string, string> = {}

  const children = mainComponent && !mainComponent?.name.endsWith('Container')
    ? (
      !context || context === ContextLevel.Minimal
        ? [mainComponent]
        : [mainComponent, ...components]
    )
    : components

  const tabConfig = {
    container: (context === ContextLevel.Container || context === ContextLevel.Full) && {
      name: container.name,
      props: parseProps(container.props, dataType, imports, declarations),
    },
    components: children.map(c => ({
      ...c,
      props: parseProps(c.props, dataType, imports, declarations),
    })),
    declarations: declarations,
    importString: imports?.length && `import { ${imports.join(', ')} } from '@volterra/vis'\n`,
    showTitles: context === ContextLevel.Full,
  }

  if (context && declarations.data) {
    if (dataType.includes(',')) {
      const d = dataType.split(',').filter(d => d !== 'undefined')
      tabConfig.importString = `${tabConfig.importString}import { ${d.join(', ')} } from '../types.ts'\n`
      declarations.data = `data: <${d.map(d => `${d}[]`)}>`
    } else {
      declarations.data = `data: ${dataType}[]`
    }
  }

  return (
    <FrameworkTabs
      hideTabLabels={hideTabLabels}
      angular={getAngularStrings(tabConfig)}
      react={getReactStrings(tabConfig)}
      typescript={getTypescriptStrings(tabConfig, context !== ContextLevel.Container && mainComponent?.name, dataType)}
    />
  )
}
