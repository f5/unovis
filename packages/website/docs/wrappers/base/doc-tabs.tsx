import React from 'react'

import { FrameworkTabProps, FrameworkTabs } from '../../utils/framework-tabs'
import { PropInfo, parseProps, formatElement, tab, t } from '../../utils/parser'
import { Component } from '.'

export enum ContextLevel {
  Full = 'full', // show typescript declarations for all components in doc
  Container = 'container', // exclude ts lines, keep container and components
  Minimal = 'minimal', // only include main component and related ts lines
}

export type FrameworkProps = {
  container: Component;
  context: ContextLevel;
  components: Component[];
  mainComponent: Component;
  dataType: string;
  showData?: boolean;
  hideTabLabels?: boolean;
  imports?: string[];
}

type ComponentInfo = Partial<Component> & { props: PropInfo[] }

type CodeConfig = {
  container?: ComponentInfo;
  components: ComponentInfo[];
  dataType: string;
  importString: string | undefined;
  showData?: boolean;
  declarations?: Record<string, string>;
}

function parseAngular ({ name, props }: ComponentInfo): string {
  const hasUpper = name.match(/.+[A-Z]/)
  if (hasUpper) {
    const ch = name[hasUpper[0].length - 1]
    name = name.split(ch).join('-'.concat(ch))
  }
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    [stringLiteral ? key : `[${key}]`, `"${value}"`].join('=')
  )
  const tag = `vis-${name.toLowerCase()}`
  return formatElement(`<${tag}`, attrs, `></${tag}>`)
}

function getAngularStrings (config: CodeConfig): FrameworkTabProps['angular'] {
  const { components, container, dataType, declarations, importString, showData } = config

  const html = container
    ? parseAngular(container).replace('><', `>\n${t}${components.map(c => parseAngular(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parseAngular(c)).join('\n')

  const tsLines = []
  if (importString) tsLines.push(importString)
  if (Object.values(declarations).length || showData) {
    if (importString) tsLines.push('\n')
    tsLines.push('@Component({ ... })\nclass Component {')
    if (showData) tsLines.push(`${t}@Input() data: ${dataType}`)
    tsLines.push(...Object.entries(declarations).map(d => `${t}${d.join(' = ')}`))
    tsLines.push('}')
  }

  return {
    html: html,
    ts: tsLines.join('\n'),
  }
}

function parseReact ({ name, props }: ComponentInfo, closing = false): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    [key, stringLiteral ? `"${value}"` : `{${value}}`].join('=')
  )
  const tag = `Vis${name}`
  return formatElement(`<${tag}`, attrs, `${closing ? `></${tag}>` : '/>'}`)
}

function getReactStrings ({ components, container, dataType, showData, importString, declarations }: CodeConfig): string {
  let indentLevel = 0
  let containerString: string

  const lines = []

  if (importString) lines.push(importString)
  if (Object.values(declarations).length || showData) {
    lines.push('function Component(props) {')
    if (showData) lines.push(`${t}const data: ${dataType} = props.data`)
    lines.push(...Object.entries(declarations).map(d => `${t}const ${d.join(' = ')}`))
    lines.push(`\n${t}return (`)
    indentLevel += 2
  }

  if (container) {
    containerString = `${tab(indentLevel)}${parseReact(container, true)}`
    indentLevel++
  }
  const componentString = `${tab(indentLevel)}${components.map(c => parseReact(c)).join(`\n${tab(indentLevel)}`)}`
  lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

  if (indentLevel) {
    lines.push(...['  )', '}'])
  }
  return lines.join('\n')
}

function parseTypescript (prefix: string, { name, props }: ComponentInfo, type?: string): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    key === value ? key : [key, stringLiteral ? `"${value}"` : `${value}`].join(': ')
  )
  return formatElement(`${prefix}new ${name}${type ? `<${type}>` : ''}({`, attrs, ' })', ', ')
}

function getTypescriptStrings (config: CodeConfig, mainComponent: Component, datum: string): string {
  const { components, container, dataType, declarations, importString, showData } = config
  const lines = []

  if (importString) lines.push(importString)
  if (showData) lines.push(`const data: ${dataType} = getData()`)

  const mainIsContainer = mainComponent?.name?.endsWith('Container')
  const getPropDetails = (props: PropInfo[]): PropInfo[] => props.map(p => ({ ...p, value: declarations[p.key] || p.value }))

  const containerConfig: Record<string, string[]> = {}
  if (mainComponent && !mainIsContainer) {
    const name = mainComponent.name.charAt(0).toLowerCase().concat(mainComponent.name.slice(1))
    const main = components.find(c => c.name === mainComponent.name)
    if (main?.props) {
      lines.push(parseTypescript(
        `const ${name} = `, {
          ...main,
          props: main.props.map(p => ({ ...p, value: declarations[p.key] || p.value })),
        },
        datum))
    }
    containerConfig[mainComponent.key] = [name]
  }

  if (lines.length) lines.push('')

  if (container) {
    components.forEach(c => {
      if (!containerConfig[c.key]) {
        containerConfig[c.key] = []
      }
      if (c.name !== mainComponent.name) {
        containerConfig[c.key].push(parseTypescript('', c))
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
export function DocFrameworkTabs (config: FrameworkProps): JSX.Element {
  const { components, container, context, hideTabLabels, mainComponent, dataType, imports, showData } = config
  const declarations = {}

  const children = mainComponent && !mainComponent.name.endsWith('Container')
    ? (
      !context || context === ContextLevel.Minimal
        ? [config.mainComponent]
        : [mainComponent, ...components]
    )
    : components

  const tabConfig = {
    container: (config.context === 'container' || config.context === 'full') && {
      name: container.name,
      props: parseProps(container.props, dataType, imports, declarations),
    },
    components: children.map(c => ({
      ...c,
      props: parseProps(c.props, dataType, imports, declarations),
    })),
    dataType: dataType.includes(',') ? `<${dataType}>` : `${dataType}[]`,
    declarations: declarations,
    importString: imports?.length && `import { ${imports.join(', ')} } from '@volterra/vis'\n`,
    showData: showData && context === ContextLevel.Full,
    showTitles: context === ContextLevel.Full,
  }

  return (
    <FrameworkTabs
      hideTabLabels={hideTabLabels}
      angular={getAngularStrings(tabConfig)}
      react={getReactStrings(tabConfig)}
      typescript={getTypescriptStrings(
        tabConfig,
        context !== 'container' && mainComponent, dataType)}
    />
  )
}
