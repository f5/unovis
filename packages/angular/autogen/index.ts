import ts from 'typescript'

// Components
import { runComponentGenerator } from '@unovis/shared/integrations/autogen'

// Types
import { AngularComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { gatherTypeReferences, getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Constants
import { D3_SELECTION_TYPE_MODULES } from './constants'

// Component Code
import { getComponentCode } from './component'
import { getModuleCode } from './module'

const skipProperties = ['renderIntoProvidedDomNode']

const getComponentDirPath = (component: AngularComponentInput): string =>
  `${component.isStandAlone ? 'html-' : ''}components/${component.kebabCaseName ?? kebabCase(component.name)}`

runComponentGenerator<AngularComponentInput>({
  generateComponentFiles: (component) => {
    const { configProperties, configInterfaceMembers, generics, statements, importSourceMap } = getConfigSummary(component, skipProperties, false)
    // Resolve D3 selections and the events that carry them through core.
    const indexedInputs = new Set<string>()
    const copiedMembers = configInterfaceMembers.filter(member => {
      if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) return true
      if (!gatherTypeReferences([member]).some(type => D3_SELECTION_TYPE_MODULES.has(importSourceMap[type]))) return true
      indexedInputs.add(member.name.text)
      return false
    })
    const typeArguments = generics?.length ? `<${generics.map(g => g.name).join(', ')}>` : ''
    const configType = `${component.name}ConfigInterface${typeArguments}`
    const inputs = configProperties.map(property => indexedInputs.has(property.name)
      ? { ...property, type: `Required<${configType}>['${property.name}']` }
      : property)

    const importSources = { ...importSourceMap }
    importSources.ContainerCore ??= '@unovis/ts/core/container'
    const importStatements = getImportStatements(component.name, statements, copiedMembers, generics, component.isStandAlone ? [] : ['ContainerCore'], importSources)

    const componentCode = getComponentCode(
      component.name,
      generics,
      inputs,
      component.angularProvide,
      importStatements,
      component.dataType,
      component.kebabCaseName,
      component.isStandAlone,
      component.renderIntoProvidedDomNode,
      component.angularStyles
    )
    const moduleCode = getModuleCode(component.name, component.kebabCaseName)

    const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
    const dirPath = `src/${getComponentDirPath(component)}`
    return [
      { path: `${dirPath}/${nameKebabCase}.component.ts`, content: componentCode },
      { path: `${dirPath}/${nameKebabCase}.module.ts`, content: moduleCode },
    ]
  },
  getBarrelExports: (component) => {
    const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
    const dirPath = `./${getComponentDirPath(component)}`
    return [
      `export { Vis${component.name}Component } from '${dirPath}/${nameKebabCase}.component'`,
      `export { Vis${component.name}Module } from '${dirPath}/${nameKebabCase}.module'`,
    ]
  },
  barrelHeader: ['// Core', 'export * from \'./core\'', ''],
})
