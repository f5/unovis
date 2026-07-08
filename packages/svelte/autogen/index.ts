// Components
import { runComponentGenerator } from '@unovis/shared/integrations/autogen'

// Types
import { SvelteComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height', 'renderIntoProvidedDomNode']

const getComponentDirPath = (component: SvelteComponentInput): string =>
  `${component.isStandAlone ? 'html-' : ''}components/${component.kebabCaseName ?? kebabCase(component.name)}`

runComponentGenerator<SvelteComponentInput>({
  generateComponentFiles: (component) => {
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
      component.svelteStyles
    )

    const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
    return [{ path: `src/${getComponentDirPath(component)}/${nameKebabCase}.svelte`, content: componentCode }]
  },
  getBarrelExports: (component) => {
    const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
    return [`export { default as Vis${component.name} } from './${getComponentDirPath(component)}/${nameKebabCase}.svelte'`]
  },
})
