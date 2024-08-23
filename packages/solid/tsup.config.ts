import { defineConfig } from 'tsup'
import * as preset from 'tsup-preset-solid'

const preset_options: preset.PresetOptions = {
  entries: {
    entry: './src/index.ts',
  },
  // drop_console: true,
}

export default defineConfig((config) => {
  const watching = Boolean(config.watch)

  const parsedOptions = preset.parsePresetOptions(preset_options, watching)
  const packageJSONParsedOptions = preset.parsePresetOptions(
    { ...preset_options, out_dir: '.' },
    watching
  )

  if (!watching) {
    const package_fields = preset.generatePackageExports(
      packageJSONParsedOptions
    )

    console.log(
      `package.json: \n\n${JSON.stringify(package_fields, null, 2)}\n\n`
    )

    // will update ./package.json with the correct export fields
    preset.writePackageJson(package_fields)
  }

  return preset.generateTsupOptions(parsedOptions)
})
