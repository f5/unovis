// Components
import { runComponentGenerator } from '@unovis/shared/integrations/autogen'

// Types
import { AngularComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'
import { getModuleCode } from './module'

const skipProperties = ['renderIntoProvidedDomNode']

const getComponentDirPath = (component: AngularComponentInput): string =>
  `${component.isStandAlone ? 'html-' : ''}components/${component.kebabCaseName ?? kebabCase(component.name)}`

runComponentGenerator<AngularComponentInput>({
  generateComponentFiles: (component) => {
    const { configProperties, configInterfaceMembers, generics, statements } = getConfigSummary(component, skipProperties, false)
    const importStatements = getImportStatements(component.name, statements, configInterfaceMembers, generics, component.isStandAlone ? [] : ['ContainerCore'])

    const componentCode = getComponentCode(
      component.name,
      generics,
      configProperties,
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
