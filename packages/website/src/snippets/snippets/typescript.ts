import { AxisConfigInterface, XYComponentConfigInterface } from '@unovis/ts'
import { indentLines, nestLines } from '@site/src/utils/text'

import { getComponentString, getDeclarationStrings, getImportStrings, nestElement } from '../helpers'
import { CodeSnippet, PropItem, SnippetComponent } from '../types'

export class TypescriptSnippet extends CodeSnippet<'typescript'> {
  componentImport (c: string): string { return c }
  componentString (name: string, props: PropItem[], isContainer = false, dataType?: string): string {
    let data
    const attrs = props?.reduce((acc, { key, value }) => {
      if (key === 'data') data = true
      else acc.push(key === value ? key : [key, value].join(': '))
      return acc
    }, [])
    const prefix = `new ${name}${dataType ? `<${dataType}>` : ''}(${isContainer ? 'document.getElementById(\'#id\'), ' : ''}{`
    const suffix = data ? ' }, data)' : ' })'
    return getComponentString(prefix, attrs, suffix, ', ')
  }

  private configKey<T = unknown> (c: SnippetComponent<T>): string {
    switch (c.name) {
      case 'Tooltip':
        return 'tooltip'
      case 'Crosshair':
        return 'crosshair'
      case 'Axis':
        return `${(c.props as AxisConfigInterface<T>).type}Axis`
      default:
        return this._container.name === 'XYContainer' ? 'components' : 'component'
    }
  }

  private _componentDeclarations = {}

  constructor (config) {
    super(config)

    if (this._container) {
      const containerConfig: Record<string, string[]> = {}
      config.components.forEach(c => {
        if (!c.isContainer) {
          const key = this.configKey(c)
          if (!containerConfig[key]) containerConfig[key] = []
          containerConfig[key].push(this.componentString(c.name, c.props))
        }
      })
      const varName = this.exampleName.charAt(0).toLowerCase().concat(this.exampleName.slice(1))
      const componentProps: PropItem[] = Object.entries(containerConfig).map(([k, v]) => ({
        key: k,
        value: k === 'components' ? indentLines(nestLines('[]', v, '[]')) : v[0],
      }))

      this._componentDeclarations = {
        [varName]: this.componentString(this._container.name, (this._container.props ?? []).concat(componentProps), true),
      }
    }
  }

  get full (): string {
    return [
      ...getImportStrings(this.imports),
      ...getDeclarationStrings(this.declarations, 'const '),
      '',
      ...getDeclarationStrings(this._componentDeclarations, 'const '),
    ].join('\n')
  }

  get compact (): string {
    return ''
  }
}
