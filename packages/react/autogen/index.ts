// Components
import { runComponentGenerator } from '@unovis/shared/integrations/autogen'

// Types
import { ReactComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height']

const getComponentDirPath = (component: ReactComponentInput): string =>
  `${component.isStandAlone ? 'html-' : ''}components/${component.kebabCaseName ?? kebabCase(component.name)}`

runComponentGenerator<ReactComponentInput>({
  generateComponentFiles: (component) => {
    const { generics, statements, importSourceMap } = getConfigSummary(component, skipProperties)
    const importStatements = getImportStatements(component.name, statements, [], generics, [], importSourceMap)

    const componentCode = getComponentCode(
      component.name,
      generics,
      importStatements,
      component.dataType,
      component.elementSuffix,
      component.isStandAlone,
      component.renderIntoProvidedDomNode
    )

    return [{ path: `src/${getComponentDirPath(component)}/index.tsx`, content: componentCode }]
  },
  getBarrelExports: (component) => [`export * from './${getComponentDirPath(component)}'`],
})
