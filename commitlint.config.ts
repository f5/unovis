/* eslint-disable @typescript-eslint/no-var-requires */
const componentScopes = require('@unovis/shared/integrations/components')
  .getComponentList()
  .map(c => c.name)

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\s*(\w*)(?:\s\|\s(\w*))?(?:\s\|\s([\w\s|]+))?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subscopes', 'subject'],
      issuePrefixes: ['#', 'unovis/issues-only#'],
    },
  },
  rules: {
    'header-trim': [2, 'always'],
    'type-enum': [2, 'always', [
      'React', 'Angular', 'Vue', 'Svelte', 'Website', 'Dev', 'Shared',
      'Core', 'Component', 'Container', 'Release', 'CI', 'Misc', 'Solid',
    ]],
    'scope-case': [2, 'always', 'pascal-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'validate-scope': [1, 'always'],
  },
  plugins: [
    {
      rules: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'validate-scope': c => {
          // Allow empty scopes for CI and Release types
          if (!c.scope) return [['Release', 'CI'].includes(c.type), 'scope should not be empty']

          // Check if scope is one of the component scopes
          if (c.type === 'Component') {
            return [
              componentScopes.includes(c.scope),
              `Component scope must be one of [${componentScopes.join(', ')}]`,
            ]
          }

          // Verify pascal-case for additional scopes
          c.subscopes?.split(' | ')?.forEach(s => {
            if (s.match(/[A-Z][a-zA-Z0-9]*/) === null) return [false, `${s}: all scopes must be pascal-case`]
          })

          return [true]
        },
      },
    },
  ],
  helpUrl: 'https://github.com/f5/unovis/pull/375',
}
