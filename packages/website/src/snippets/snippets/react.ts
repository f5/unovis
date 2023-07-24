import { indentLines } from '../../utils/text'
import { getComponentString, getDeclarationStrings, getImportStrings, nestElement } from '../helpers'
import { CodeSnippet } from '../types'

export class ReactSnippet extends CodeSnippet<'react'> {
  componentImport (name: string): string { return `Vis${name}` }

  componentString (name: string, props = [], isContainer = false): string {
    const attrVal = (value: string, type: string): string => {
      switch (type) {
        case 'function':
          return `useCallback(${value}, [])`
        case 'function[]':
          return `useMemo(${value}, [])`
        default:
          return value
      }
    }
    const attrs = props?.map(({ key, value, type }) =>
      [key, type === 'string' ? value : `{${attrVal(value, type)}}`].join('=')
    )
    const tag = `Vis${name}`
    const endLine = isContainer ? `></${tag}>` : '/>'
    return getComponentString(`<${tag}`, attrs, endLine)
  }

  get compact (): string {
    return this.components.join('\n')
  }

  get full (): string {
    return [
      ...getImportStrings({ '@unovis/react': this.libraryImports, ...this.imports }),
      '',
      `export function ${this.exampleName} (): JSX.Element {`,
      ...getDeclarationStrings(this.declarations, '  const '),
      '  return (',
      indentLines(this.container ? nestElement(this.container, this.components) : this.components, 2),
      '  )',
      '}',
    ].join('\n')
  }
}
