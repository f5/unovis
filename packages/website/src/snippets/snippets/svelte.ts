import { indentLines } from '@site/src/utils/text'

import { getComponentString, getDeclarationStrings, getImportStrings, nestElement } from '../helpers'
import { CodeSnippet, SnippetComponent } from '../types'

export class SvelteSnippet extends CodeSnippet<'svelte'> {
  componentImport (name: string): string { return `Vis${name}` }

  componentString (name: string, props = [], isContainer = false): string {
    const attrs = props.map(({ key, value, type }) => {
      if (type === 'function') {
        this.declarations[key] = value
        value = key
      }
      return key === value ? `{${key}}` : [key, type === 'string' ? value : `{${value}}`].join('=')
    })
    const tag = `Vis${name}`
    const endLine = isContainer ? `></${tag}>` : '/>'
    return getComponentString(`<${tag}`, attrs, endLine)
  }

  get compact (): string {
    return this.components.join('\n')
  }

  get full (): string {
    return [
      '<script lang=\'ts\'>',
      indentLines(getImportStrings({ '@unovis/svelte': this.libraryImports, ...this.imports }), 1),
      ...getDeclarationStrings(this.declarations, '  const '),
      '</script>',
      '',
      indentLines(this.container ? nestElement(this.container, this.components) : this.components, 0),
    ].join('\n')
  }
}
