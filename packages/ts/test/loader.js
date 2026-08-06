// Lets `node --test` load the package's TypeScript sources directly, with no build step.
//
// Node's built-in type stripping isn't enough here: the sources use enums, and they import types
// without the `import type` marker, which only a real type-aware emit can elide. So we hand the files
// to the TypeScript compiler the package already depends on, and teach the resolver the two specifier
// styles the sources use — the `@/*` alias for the `src` root (tsconfig `paths`) and extensionless
// relative imports.
import { registerHooks } from 'node:module'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const srcDir = path.resolve(import.meta.dirname, '../src')

function resolveFile (absPath) {
  const candidates = [absPath, `${absPath}.ts`, path.join(absPath, 'index.ts')]
  return candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile()) ?? null
}

registerHooks({
  resolve (specifier, context, nextResolve) {
    let absPath = null

    if (specifier.startsWith('@/')) {
      absPath = path.join(srcDir, specifier.slice('@/'.length))
    } else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
      absPath = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier)
    }

    const resolved = absPath && resolveFile(absPath)
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true }

    return nextResolve(specifier, context)
  },

  load (url, context, nextLoad) {
    if (!url.startsWith('file:') || !url.endsWith('.ts')) return nextLoad(url, context)

    const fileName = fileURLToPath(url)
    const { outputText } = ts.transpileModule(readFileSync(fileName, 'utf8'), {
      fileName,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        esModuleInterop: true,
      },
    })

    return { format: 'module', source: outputText, shortCircuit: true }
  },
})
