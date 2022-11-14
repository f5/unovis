/* eslint-disable no-console, @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires, @typescript-eslint/explicit-function-return-type */
// We manually minify the js files because docusaurus build requires more than 4GB of memory and fails in CI/CD
// https://www.digitalocean.com/community/tools/minify

// Import Terser so we can use it
const { minify } = require('terser')

// Import fs so we can read/write files
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

// Define the config for how Terser should minify the code
// This is set to how you currently have this web tool configured
const config = {
  compress: {
    dead_code: true,
    drop_console: false,
    drop_debugger: true,
    keep_classnames: false,
    keep_fargs: true,
    keep_fnames: false,
    keep_infinity: false,
  },
  mangle: {
    eval: false,
    keep_classnames: false,
    keep_fnames: false,
    toplevel: false,
    safari10: false,
  },
  module: false,
  sourceMap: false,
  output: {
    comments: 'some',
  },
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function main () {
  const dirname = './build/assets/js/'
  const filenames = fs.readdirSync(dirname)
  for (const filename of filenames) {
  // Load in your code to minify
    const content = fs.readFileSync(dirname + filename, 'utf-8')
    // Minify the code with Terser
    console.log(filename, ' ...')
    const minified = await minify(content, config)
    console.log(`   ${(content.length / 1024).toFixed()}KB -> ${(minified.code.length / 1024).toFixed()}KB`)
    // Save the code!
    fs.writeFileSync(dirname + filename, minified.code)
  }
}

main()
