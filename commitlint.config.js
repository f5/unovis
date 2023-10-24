module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['React', 'Angular', 'Vue', 'Svelte', 'Website', 'Dev', 'Shared', 'Core', 'Component', 'Container', 'Utils', 'Styles', 'Release', 'CI', 'Misc']],
    'type-case': [2, 'always', 'pascal-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'body-case': [2, 'always', 'sentence-case'],
  },
}


