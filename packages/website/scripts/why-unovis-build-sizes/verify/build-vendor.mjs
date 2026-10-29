// Test-only helper: the measured React bundles import react / react-dom / react-dom/client /
// react/jsx-runtime as externals. React 18 ships CommonJS only, so this builds ONE production ESM
// bundle containing a single React + ReactDOM instance, plus tiny ESM facades that the import map in
// verify/index.html points those four specifiers at. Nothing here affects the measured sizes.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import * as esbuild from 'esbuild'

process.env.NODE_ENV = 'production'
const verifyDir = path.dirname(new URL(import.meta.url).pathname)
const reactProject = path.join(path.dirname(verifyDir), 'libs', 'react') // React 18.3.1, isolated install
const require = createRequire(path.join(reactProject, 'package.json'))
const vendorDir = path.join(verifyDir, 'vendor')
fs.mkdirSync(vendorDir, { recursive: true })

await esbuild.build({
  stdin: {
    contents: [
      "import React from 'react'",
      "import ReactDOM from 'react-dom'",
      "import ReactDOMClient from 'react-dom/client'",
      "import JSXRuntime from 'react/jsx-runtime'",
      'export { React, ReactDOM, ReactDOMClient, JSXRuntime }',
    ].join('\n'),
    resolveDir: reactProject,
  },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: path.join(vendorDir, 'react-all.js'),
  logLevel: 'warning',
})

const facades = [
  ['react.js', 'React', 'react'],
  ['react-dom.js', 'ReactDOM', 'react-dom'],
  ['react-dom-client.js', 'ReactDOMClient', 'react-dom/client'],
  ['react-jsx-runtime.js', 'JSXRuntime', 'react/jsx-runtime'],
]
for (const [file, name, specifier] of facades) {
  const keys = Object.keys(require(specifier)).filter((k) => k !== 'default' && /^[A-Za-z_$][\w$]*$/.test(k))
  fs.writeFileSync(path.join(vendorDir, file), [
    `import { ${name} } from './react-all.js'`,
    `export default ${name}`,
    `export const { ${keys.join(', ')} } = ${name}`,
    '',
  ].join('\n'))
}
console.log(`vendor facades written to ${vendorDir}`)
