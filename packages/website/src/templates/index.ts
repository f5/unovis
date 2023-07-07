export type Component<I> = {
  name: string;
  props: Partial<I>;
  propTypes: I;
  children?: Component<I>[];
}

// export function getReactStrings (config: CodeConfig): string {
//   const { components, container, declarations, imports, visImports } = config
//   const lines: string[] = []

//   let indentLevel = 0
//   let containerString: string

//   if (imports || Object.values(declarations).length) {
//     if (imports) {
//       lines.push(getImportString({ '@unovis/react': visImports, ...imports }))
//     }

//     lines.push('function Component(props) {')
//     // if (data) lines.push(`${t}const ${data} = props.data`)
//     lines.push(...Object.entries(declarations).map(d => `${t}const ${d.join(' = ')}`))
//     lines.push(`\n${t}return (`)
//     indentLevel += 2
//   }

//   if (container) {
//     containerString = `${parse.react(container, true, indentLevel)}`
//     indentLevel++
//   }
//   const componentString = `${components.map(c => parse.react(c, false, indentLevel)).join('\n')}`
//   lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

//   if (indentLevel) {
//     lines.push(`${tab(--indentLevel)})`)
//     if (indentLevel) lines.push('}')
//   }
//   return lines.join('\n')
// }

// type PropParser<I> = (k: keyof I, v: I[keyof I], type: string) => string

// export function parseComponent<Datum> (c: XYComponentSnippetConfigInterface<Datum>): any {
//   const { name, ...props } = c
//   const propTypes = useDynamicImport(`Vis${name}`)
//   if (!propTypes) return
// }

