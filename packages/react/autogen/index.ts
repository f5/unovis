import { writeFileSync } from 'fs'
import { exec } from 'child_process'

// Components
import { getComponentList } from '@unovis/shared/integrations/components'

// Types
import { ReactComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height']
const components = getComponentList() as ReactComponentInput[]

for (const component of components) {
  const { generics, statements } = getConfigSummary(component, skipProperties)
  const importStatements = getImportStatements(component.name, statements, [], generics)

  const componentCode = getComponentCode(
    component.name,
    generics,
    importStatements,
    component.dataType,
    component.elementSuffix,
    component.isStandAlone,
    component.renderIntoProvidedDomNode
  )

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const pathComponentBase = `src/${component.isStandAlone ? 'html-' : ''}components/${nameKebabCase}`
  const pathComponent = `${pathComponentBase}/index.tsx` // `${pathComponentBase}/${nameKebabCase}.component.tsx`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    exec(`npx eslint ${pathComponent} --fix`)
  })

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
}
