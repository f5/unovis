/** Removes lint directives from a demo's source before it's shown on the page */
export function stripLintDirectives (code: string): string {
  return code
    .replace(/^[ \t]*\/\/ eslint-disable.*\n/gm, '')
    .replace(/^[ \t]*\/\* eslint-disable.*\*\/\n/gm, '')
}
