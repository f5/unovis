// /* eslint-disable @typescript-eslint/naming-convention */
// import { CodeSnippetProps } from '@site/src/components/CodeSnippet'
// import { Framework } from '@site/src/types/code'
// import { ComponentInfo, PropInfo, parseComponent as parse, tab, t } from './parser'

// type CodeConfig = {
//   container?: ComponentInfo;
//   components: ComponentInfo[];
//   dataType: string;
//   declarations: Record<string, string>;
//   imports: Record<string, string[]>;
//   visImports: string[];
// }

// const formatLines = (lines: string[], indent = 0): string => `${tab(indent)}${lines.join(`\n${tab(indent)}`)}`

// /*
//  * Converts a mapping source,module[] pairs to a stringified es6 import declaration at the
//  * @param imports: Record<string, string[]> where keys are the source and values are the imported modules
//  * @param indent
//  * @returns
//  */
// function getImportString (imports: Record<string, string[]>, indent?: boolean): string {
//   return `${Object.keys(imports).map(i => `${indent ? t : ''}import { ${imports[i].join(', ')} } from '${i}'`).join('\n')}\n`
// }

// export function getAngularStrings (config: CodeConfig, importedProps: string[], inlineTemplate = false): CodeSnippetProps['angular'] {
//   const { components, container, declarations, imports, visImports } = config
//   const { data, ...rest } = declarations
//   const tsLines: string[] = []

//   const html = container
//     ? parse.angular(container).replace('><', `>\n${t}${components.map(c => parse.angular(c)).join(`\n${t}`)}\n<`)
//     : components.map(c => parse.angular(c)).join('\n')

//   importedProps?.forEach(i => {
//     if (html.includes(i)) rest[i] = i
//   })

//   // TODO: make this variable so we can use with gallery examples
//   const componentName = 'Chart'

//   if (imports || Object.values(declarations).length) {
//     tsLines.push(getImportString(imports))

//     tsLines.push('@Component({')
//     const template = inlineTemplate
//       ? `  template: ${html.includes('\n') ? `\`\n    ${html.split('\n').join('\n    ')}\n  \`` : `'${html}'`}`
//       : '  templateUrl: \'template.html\''
//     tsLines.push(template)
//     tsLines.push('})')

//     if (data || Object.values(rest).length) {
//       tsLines.push(`export class ${componentName} {`)
//       // if (data) tsLines.push(`${t}@Input ${data};`)
//       tsLines.push(...Object.entries(rest).map(d => `${t}${d.join(' = ')}`))
//       tsLines.push('}')
//     }
//   }
//   const modules = visImports.map(v => `${v}Module`)

//   return {
//     template: inlineTemplate ? undefined : html,
//     component: tsLines.length ? tsLines.join('\n') : undefined,
//     module: [
//       'import { NgModule } from \'@angular/core\'',
//       getImportString({ '@unovis/angular': modules }),
//       `import { ${componentName}Component from './component'`,
//       '',
//       '@NgModule({',
//       `${t}imports: [${modules}],`,
//       `${t}declarations: [${componentName}Component]`,
//       `${t}exports: [${componentName}Component],`,
//       '})',
//       `export class ${componentName}Module {}`,
//     ].join('\n'),
//   }
// }

// const propFormat = {
//   [Framework.React]: (k: string, v: string, type: string) => {
//     switch (type) {
//       case 'string':
//         return `${k}="${v}"`
//       case 'function':
//         return `useCallback(${v}, [])`
//       default:
//         return `${k}={${v}}`
//     }
//   },
// }

// export function getDeclarationString () {}

// // export function getElementString (framework: Framework, name: string, props: PropInfo[], closing=false) {
// //   switch (framework) {
// //     case Framework.React:
// //       return [
// //         `<Vis${name}${props.map(({ key, value, type }) => [key,
// //         type === 'string' ? value : `{${type === 'function' ? `useCallback(${value}, [])` : value}}`,
// //       ].join('='))}>`
// //   }
// // }

// function formatElement (prefix: string, attributes: string[] = [], suffix: string, indent = 0, sep = ' '): string[] {
//   const breakLine = prefix.length + attributes.join(sep).length + suffix.length > lineMaxLength
//   const content = !(attributes.length) ? '' : (
//     breakLine
//       ? `\n${tab(indent + 1)}${attributes.join(`${sep.trim()}\n${tab(indent + 1)}`)}\n`
//       : ` ${attributes.join(sep)}`
//   )
//   return [`${tab(indent)}${prefix}`, content, suffix].join(breakLine ? `\n${tab(indent)}` : '')
// }

// export function getReactStrings (config: CodeConfig): string {
//   const { components, container, declarations, imports } = config
//   // const formatC = c => {
//   //   const tag = `Vis${name}`
//   //   const tagp.map(({ key, value, type }) => [key,
//   //   type === 'string' ? value : `{${type === 'function' ? `useCallback(${value}, [])` : value}}`,
//   // ].join('='))
//   // // replace(/(?<key>\s+:)(?<value>)/gm, val => {
//   // //   console.log(val)
//   // //   return val
//   // // }

//   // const endLine = children ? `>\n${tab(indent + 1)}${children.map(c => parseReact(c, indent + 1)).join(tab(indent))}\n</${tag}>` : '/>'
//   // return formatElement2(`<${tag}`, attrs, endLine, indent, ' ')
//   return [
//     getImportString({ '@unovis/react': [container].concat(components).map(c => `Vis${c.name}`), ...imports }),
//     `export function ${config.title} (): JSX.Element {`,
//     '  return (',
//     `    <Vis${container.name}${parseProps.react(container.props)}>`,
//     `    </Vis${container.name}>`,
//     '}',
//   ].join('\n')


//   // let indentLevel = 0
//   // let containerString: string

//   // if (imports || Object.values(declarations).length) {
//   //   if (imports) {
//   //     lines.push(getImportString({ '@unovis/react': visImports, ...imports }))
//   //   }

//   //   lines.push('function Component(props) {')
//   //   // if (data) lines.push(`${t}const ${data} = props.data`)
//   //   lines.push(...Object.entries(declarations).map(d => `${t}const ${d.join(' = ')}`))
//   //   lines.push(`\n${t}return (`)
//   //   indentLevel += 2
//   // }

//   // if (container) {
//   //   containerString = `${parse.react(container, true, indentLevel)}`
//   //   indentLevel++
//   // }
//   // const componentString = `${components.map(c => parse.react(c, false, indentLevel)).join('\n')}`
//   // lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

//   // if (indentLevel) {
//   //   lines.push(`${tab(--indentLevel)})`)
//   //   if (indentLevel) lines.push('}')
//   // }
//   // return lines.join('\n')
//   // return parse.react(container.name, container.props, components)
//   const obj = Object.fromEntries(components[0].props.map(p => [p.key, p.value]))
//   console.log(obj)
//   const reactProps = (props: any[]): string[] => props.map(({ key, value, type }) => propFormat[Framework.React](key, value, type))
//   return [
//     parse.react(container),
//     ...components.map(parse.react),
//   ].join('\n')
//   //   `<Vis${container.name}${container.props ? ` ${reactProps(container.props)} ` : ''}>`,
//   // ]join(' ')
//   // return container
//   //   ? parse.react(container, 0, true).replace('><', `\n${components.map(c => parse.react(c, 1, false)).join('\n')}`)
//   //   : components.map(c => parse.react(c, false, 0)).join('\n')
// }

// export function getSvelteStrings (config: CodeConfig): string {
//   const { components, container, declarations, imports, visImports } = config
//   const lines: string[] = []

//   const html = container
//     ? parse.svelte(container, true).replace('><', `>\n${t}${components.map(c => parse.svelte(c)).join(`\n${t}`)}\n<`)
//     : components.map(c => parse.svelte(c)).join('\n')

//   if (!imports && !Object.keys(declarations).length) {
//     return html
//   }

//   lines.push(getImportString({ '@unovis/svelte': visImports, ...imports }, true))
//   // if (data) lines.push(`${t}export let ${data}`)
//   Object.entries(declarations).forEach(d => lines.push(`${t}const ${d.join(' = ')}`))
//   return `<script lang='ts'>\n${lines.join('\n')}\n</script>\n\n${html}`
// }

// export function getTypescriptStrings (config: CodeConfig, mainComponentName?: string, isStandAlone = false): string {
//   const { components, container, dataType, declarations, imports, visImports } = config
//   const { data, ...vars } = declarations
//   const lines: string[] = []

//   const getPropDetails = (props = []): PropInfo[] => props.map(p => {
//     delete vars[p.key]
//     return { ...p, value: declarations[p.key] || p.value }
//   }).filter(d => d.key !== 'data')

//   const mainComponent = mainComponentName && components.find(c => c.name === mainComponentName)

//   // Import statements
//   if (imports) {
//     // Component names
//     const items = { '@unovis/ts': [], ...imports }
//     items['@unovis/ts'] = [...new Set([...visImports.map(v => v.substring(3)), ...items['@unovis/ts']])]

//     // Local data
//     const customType = dataType !== undefined && !['number', 'string', 'MapData'].includes(dataType)
//     if (data || customType) {
//       // items['./data'] = []
//       // if (data) items['./data'].push('data')
//       // if (customType) items['./data'].push(...dataType.split(','))
//     }
//     lines.push(getImportString(items))
//   }

//   // Remove relevant props from declarations
//   const containerConfig: Record<string, string[]> = {}
//   const containerProps = getPropDetails(container?.props)

//   // Add declarations
//   if (Object.keys(vars).length) {
//     Object.keys(vars).forEach(d => {
//       lines.push(`const ${d} = ${vars[d]}`)
//     })
//     lines.push('')
//   }

//   components.forEach(c => {
//     if (!containerConfig[c.key]) containerConfig[c.key] = []
//     if (c.name === mainComponentName) {
//       const varName = c.name.charAt(0).toLowerCase().concat(mainComponentName.slice(1))
//       const varDef = parse.typescript(c.name, mainComponent.props, dataType, isStandAlone, isStandAlone && mainComponent.props.find(p => p.key === 'data') !== undefined)
//       if (!Object.keys(vars).length && imports && !isStandAlone) {
//         containerConfig[c.key] = [varDef.replace(/\n/gm, '\n  '), ...containerConfig[c.key]]
//       } else {
//         lines.push(`const ${varName} = ${varDef}`)
//         containerConfig[c.key] = [varName, ...containerConfig[c.key]]
//       }
//     } else {
//       containerConfig[c.key].push(parse.typescript(c.name, c.props))
//     }
//   })

//   if (container) {
//     const items = Object.entries(containerConfig).map(([k, v]) => ({
//       key: k,
//       value: k === 'components' ? `[${v.toString().length > 10 ? `\n${tab(2)}${v.join(`\n${tab(2)}`)}\n${t}` : v.join(', ')}]` : v.join(','),
//       stringLiteral: false,
//     }))
//     lines.push(`const container = ${
//       parse.typescript(container.name, containerProps.concat(items), dataType, true, true)
//     }`)
//   }
//   return lines.join('\n')
// }
