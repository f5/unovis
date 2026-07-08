// Components
import { runComponentGenerator } from '@unovis/shared/integrations/autogen'

// Types
import { VueComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'

const skipProperties = ['width', 'height', 'renderIntoProvidedDomNode']

const getComponentDirPath = (component: VueComponentInput): string =>
  `${component.isStandAlone ? 'html-' : ''}components/${component.kebabCaseName ?? kebabCase(component.name)}`

runComponentGenerator<VueComponentInput>({
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
      component.vueStyles
    )

    return [{ path: `src/${getComponentDirPath(component)}/index.vue`, content: componentCode }]
  },
  getBarrelExports: (component) =>
    [`export { default as Vis${component.name}, Vis${component.name}Selectors } from './${getComponentDirPath(component)}/index.vue'`],
})
