// Components
import { runComponentGenerator } from '@unovis/shared/integrations/autogen'

// Types
import type { SolidComponentInput } from '@unovis/shared/integrations/types'

// Utils
import {
  getImportStatements,
  kebabCase,
  getConfigSummary,
} from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height', 'renderIntoProvidedDomNode']

const getComponentDirPath = (component: SolidComponentInput): string =>
  `${component.isStandAlone ? 'html-' : ''}components/${
    component.kebabCaseName ?? kebabCase(component.name)
  }`

runComponentGenerator<SolidComponentInput>({
  generateComponentFiles: (component) => {
    const { generics, statements } = getConfigSummary(component, skipProperties)
    const importStatements = getImportStatements(
      component.name,
      statements,
      [],
      generics
    )
    const componentCode = getComponentCode(
      component.name,
      generics,
      importStatements,
      component.dataType,
      component.elementSuffix,
      component.isStandAlone,
      component.renderIntoProvidedDomNode,
      component.solidStyles
    )

    return [
      {
        path: `src/${getComponentDirPath(component)}/index.tsx`,
        content: componentCode,
      },
    ]
  },
  getBarrelExports: (component) => [
    `export * from "./${getComponentDirPath(component)}";`,
  ],
  // The solid generate script runs the package-level lint --fix after generation
  lintFix: false,
})
