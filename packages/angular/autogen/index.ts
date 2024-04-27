import { writeFileSync } from 'fs'
import { exec } from 'child_process'

// Components
import { getComponentList } from '@unovis/shared/integrations/components'

// Types
import { AngularComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'
import { getModuleCode } from './module'

const components = getComponentList() as AngularComponentInput[]

const skipProperties = ['renderIntoProvidedDomNode']

for (const component of components) {
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
    component.angularStyles
  )
  const moduleCode = getModuleCode(component.name, component.kebabCaseName)

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const pathComponentBase = `src/${component.isStandAlone ? 'html-' : ''}components/${nameKebabCase}`
  const pathComponent = `${pathComponentBase}/${nameKebabCase}.component.ts`
  const pathModule = `${pathComponentBase}/${nameKebabCase}.module.ts`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    writeFileSync(pathModule, moduleCode)
    exec(`npx eslint ${pathComponent} ${pathModule} --fix`)
  })

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathModule}`)
}
