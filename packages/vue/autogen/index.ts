import { writeFileSync } from 'fs'
import { exec } from 'child_process'

// Components
import { getComponentList } from '@unovis/shared/integrations/components'

// Types
import { VueComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height', 'renderIntoProvidedDomNode']
const components = getComponentList() as VueComponentInput[]

const exports: string[] = []

for (const component of components) {
  const { configProperties, configInterfaceMembers, generics, statements } = getConfigSummary(component, skipProperties)
  const importStatements = getImportStatements(component.name, statements, configInterfaceMembers, generics)
  const isStandAlone = component.isStandAlone
  const componentCode = getComponentCode(
    component.name,
    generics,
    configProperties,
    importStatements,
    component.dataType,
    isStandAlone ? kebabCase(component.name) : component.elementSuffix,
    isStandAlone,
    component.renderIntoProvidedDomNode,
    component.vueStyles
  )

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const file = 'index.vue'
  const path = `${isStandAlone ? 'html-' : ''}components/${nameKebabCase}`
  const pathComponentBase = `src/${path}`
  const pathComponent = `${pathComponentBase}/${file}`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    exec(`pnpm exec eslint ${pathComponent} --fix`)
  })

  exports.push(`export { default as Vis${component.name}, Vis${component.name}Selectors } from './${path}/${file}'`)

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
}

writeFileSync('src/components.ts', exports.join('\n'))
