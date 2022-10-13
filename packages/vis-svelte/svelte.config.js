import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  package: {
    source: 'src',
    dir: 'dist',
    exports: (filepath) => {
      if (filepath.endsWith('.DS_Store')) return false
      else return true
    },
  },
}

export default config
