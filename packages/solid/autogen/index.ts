import { exec } from 'node:child_process'
import { writeFileSync } from 'node:fs'

// Components
import { getComponentList } from '@unovis/shared/integrations/components'

// Types
import type {
  SolidComponentInput
} from '@unovis/shared/integrations/types'

// Utils
import {
  getImportStatements,
  kebabCase,
  getConfigSummary,
} from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height', 'renderIntoProvidedDomNode']
const components = getComponentList() as SolidComponentInput[]

const exports: string[] = []

for (const component of components) {
  const { generics, statements } = getConfigSummary(component, skipProperties)
  const importStatements = getImportStatements(
    component.name,
    statements,
    [],
    generics
  )
  const isStandAlone = component.isStandAlone
  const componentCode = getComponentCode(
    component.name,
    generics,
    importStatements,
    component.dataType,
    component.elementSuffix,
    isStandAlone,
    component.renderIntoProvidedDomNode,
    component.solidStyles
  )

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const path = `${isStandAlone ? 'html-' : ''}components/${nameKebabCase}`
  const pathComponentBase = `src/${
    isStandAlone ? 'html-' : ''
  }components/${nameKebabCase}`
  const pathComponent = `${pathComponentBase}/index.tsx`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
  })

  exports.push(`export * from "./${path}";`)

  console.log(`${component.name} generated`)
  console.log(`  ${pathComponent}`)
}

writeFileSync('src/components.ts', exports.join('\n'))
