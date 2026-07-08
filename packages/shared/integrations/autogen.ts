import { mkdirSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { dirname } from 'path'

// Components
import { getComponentList } from './components'

// Types
import { ComponentInput } from './types'

export type GeneratedFile = {
  /** Path of the file to write, relative to the package root */
  path: string;
  content: string;
}

export type ComponentGeneratorConfig<T extends ComponentInput> = {
  /** Returns the file(s) to write for a single component */
  generateComponentFiles: (component: T) => GeneratedFile[];
  /** Returns the barrel export statement(s) for a single component.
   * When provided, the barrel file gets (re)generated */
  getBarrelExports?: (component: T) => string[];
  /** Path of the barrel file. Default: `src/components.ts` */
  barrelPath?: string;
  /** Static lines prepended to the generated barrel file */
  barrelHeader?: string[];
  /** Run `eslint --fix` on the generated files after writing them. Default: true */
  lintFix?: boolean;
}

/** Shared driver for the per-framework component generators: writes the generated
 * component files and the barrel file, and runs eslint over everything it wrote.
 * All operations are synchronous, so a failure stops the generation with a non-zero exit code */
export function runComponentGenerator<T extends ComponentInput> (config: ComponentGeneratorConfig<T>): void {
  const components = getComponentList() as T[]
  const generatedPaths: string[] = []
  const barrelExports: string[] = [...(config.barrelHeader ?? [])]

  for (const component of components) {
    for (const file of config.generateComponentFiles(component)) {
      mkdirSync(dirname(file.path), { recursive: true })
      writeFileSync(file.path, file.content)
      generatedPaths.push(file.path)

      // eslint-disable-next-line no-console
      console.log(`${component.name} generated: ${file.path}`)
    }

    if (config.getBarrelExports) barrelExports.push(...config.getBarrelExports(component))
  }

  if (config.getBarrelExports) {
    const barrelPath = config.barrelPath ?? 'src/components.ts'
    writeFileSync(barrelPath, `${barrelExports.join('\n')}\n`)
    generatedPaths.push(barrelPath)

    // eslint-disable-next-line no-console
    console.log(`Barrel generated: ${barrelPath}`)
  }

  if (config.lintFix ?? true) {
    try {
      execSync(`pnpm exec eslint --fix ${generatedPaths.join(' ')}`, { stdio: 'pipe' })
    } catch (e) {
      const error = e as { status?: number; stdout?: Buffer; stderr?: Buffer }

      // eslint exits with code 1 when non-fixable problems remain, but the `--fix` pass has been
      // applied regardless. Some rules (e.g. import resolution) only pass when eslint runs from the
      // repo root, so problems are expected here; only fatal errors (code 2+) fail the generation
      if (error.status !== 1) {
        // eslint-disable-next-line no-console
        console.error(error.stdout?.toString(), error.stderr?.toString())
        throw e
      }
    }
  }
}
