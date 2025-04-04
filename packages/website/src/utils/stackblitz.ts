/* eslint-disable @typescript-eslint/naming-convention */
import sdk, { OpenFileOption, Project, ProjectFiles, ProjectTemplate } from '@stackblitz/sdk'
import type { Example } from '@unovis/shared/examples/types'

import { Framework } from '../types/code'
import { trimMultiline } from './text'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ver = require('../../../../package.json').version

const templates: Record<Framework, ProjectTemplate> = {
  [Framework.Angular]: 'angular-cli',
  [Framework.React]: 'create-react-app',
  [Framework.Svelte]: 'node',
  [Framework.Vue]: 'node',
  [Framework.Solid]: 'node',
  [Framework.TypeScript]: 'typescript',
}

function getOpenFiles (framework: Framework, files: ProjectFiles): OpenFileOption {
  switch (framework) {
    case Framework.Angular:
      return Object.keys(files).filter(f => f.includes('component'))
    case Framework.React:
      return 'src/App.tsx'
    case Framework.Svelte:
      return 'src/App.svelte'
    case Framework.Vue:
      return 'src/App.vue'
    case Framework.Solid:
      return 'src/App.tsx'
    default:
      return 'src/App.ts'
  }
}

function getStarterFiles (framework: Framework, e: Example): ProjectFiles {
  switch (framework) {
    case Framework.Angular:
      return {
        'src/index.html': '<app-component></app-component>',
        'src/main.ts': trimMultiline(`
          import 'zone.js'
          import { Component } from '@angular/core'
          import { bootstrapApplication } from '@angular/platform-browser'
          import { ${e.codeAngular.module.match(/export class\s*(?<name>\S+)/).groups.name} as ComponentModule } from './${e.pathname}/${e.pathname}.module'

          @Component({
            selector: 'app-component',
            imports: [ ComponentModule ],
            standalone: true,
            template: '<${e.pathname}></${e.pathname}>'
          }) 
          export class AppModule {}

          bootstrapApplication(AppModule)
        `),
        [`src/${e.pathname}/${e.pathname}.component.ts`]: e.codeAngular.component,
        [`src/${e.pathname}/${e.pathname}.component.html`]: e.codeAngular.html,
        [`src/${e.pathname}/${e.pathname}.module.ts`]: e.codeAngular.module,
        [`src/${e.pathname}/data.ts`]: e.data,
        ...(e.constants ? { [`src/${e.pathname}/constants.ts`]: e.constants } : {}),
        ...(e.styles ? { [`src/${e.pathname}/styles.css`]: e.styles } : {}),
      }
    case Framework.React:
      return {
        'public/index.html': '<div id="root"></div>',
        'src/index.js': trimMultiline(`
          import React from 'react'
          import ReactDOM from 'react-dom'
          import App from './App'

          ReactDOM.render(<App />, document.getElementById('root'))
        `),
        'src/App.tsx': e.codeReact,
        'src/data.ts': e.data,
        ...(e.constants ? { 'src/constants.ts': e.constants } : {}),
        ...(e.styles ? { 'src/styles.css': e.styles } : {}),
      }
    case Framework.Svelte:
      return {
        'index.html': trimMultiline(`
          <script type="module">
            import App from './src/App.svelte';

            export const index = new App({
              target: document.body,
            });
          </script>
        `),
        'package.json': trimMultiline(`{
          "name": "unovis-demo",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview",
            "check": "svelte-check --tsconfig ./tsconfig.json"
          },
          "dependencies": {
            "@unovis/ts": "${ver}",
            "@unovis/svelte": "${ver}"
          },
          "devDependencies": {
            "@sveltejs/vite-plugin-svelte": "^1.0.5",
            "@tsconfig/svelte": "^3.0.0",
            "svelte": "^3.50.1",
            "svelte-check": "^2.9.0",
            "svelte-preprocess": "^4.10.7",
            "tslib": "^2.4.0",
            "typescript": "^4.6.4",
            "vite": "^3.1.0",
            "web-worker": "^1.2.0"
          }
        }`),
        'vite.config.ts': trimMultiline(`
          import { defineConfig } from 'vite';
          import sveltePreprocess from 'svelte-preprocess';
          import { svelte } from '@sveltejs/vite-plugin-svelte';

          export default defineConfig({
            plugins: [
              svelte({
                preprocess: [sveltePreprocess()],
              }),
            ],
          });
        `),
        'vite.env.d.ts': '/// <reference types="svelte" />\n/// <reference types="vite/client" />',
        'src/data.ts': e.data,
        'src/App.svelte': e.codeSvelte,
        ...(e.constants ? { 'src/constants.ts': e.constants } : {}),
      }
    case Framework.Vue:
      return {
        'index.html': trimMultiline(`
          <div id="app"></div>
          <script type="module">
          import { createApp } from 'vue'
          import App from './src/App.vue'

          createApp(App).mount('#app')
          </script>
        `),
        'package.json': trimMultiline(`{
          "name": "unovis-demo",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vue-tsc && vite build",
            "preview": "vite preview"
          },
          "dependencies": {
            "@unovis/ts": "${ver}",
            "@unovis/vue": "${ver}"
          },
          "devDependencies": {
            "@vitejs/plugin-vue": "^4.2.3", 
            "vue": "^3.3.4", 
            "typescript": "^5.0.2",
            "vite": "^4.4.9",
            "vue-tsc": "^1.8.8"
          }}`),
        'vite.config.ts': trimMultiline(`
          import { defineConfig } from 'vite';
          import vue from '@vitejs/plugin-vue'

          export default defineConfig({
            plugins: [vue()],
          });
        `),
        'vite.env.d.ts': '/// <reference types="vite/client" />',
        'src/data.ts': e.data,
        'src/App.vue': e.codeVue,
        ...(e.constants ? { 'src/constants.ts': e.constants } : {}),
      }
    case Framework.Solid:
      return {
        'index.html': trimMultiline(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="shortcut icon" type="image/ico" href="/src/assets/favicon.ico" />
    <title>Solid App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>

    <script src="/src/index.tsx" type="module"></script>
  </body>
</html>`),
        'src/index.tsx': trimMultiline(`/* @refresh reload */
import { render } from 'solid-js/web';

import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);`),
        'src/App.tsx': e.codeSolid,
        'src/data.ts': e.data,
        'package.json': trimMultiline(`{
          "name": "unovis-demo",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "start": "vite",
            "dev": "vite",
            "build": "vite build",
            "serve": "vite preview"
          },
          "dependencies": {
            "@unovis/ts": "${ver}",
            "@unovis/solid": "${ver}",
            "solid-js": "^1.9.5"
          },
          "devDependencies": {
            "vite-plugin-solid": "^2.11.6",
            "typescript": "^5.7.2",
            "vite": "^6.0.0"
          }}`),
        'vite.config.ts': trimMultiline(`import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});`),
        'tsconfig.json': `{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vite/client"],
    "noEmit": true,
    "isolatedModules": true
  }
}`,
        ...(e.constants ? { 'src/constants.ts': e.constants } : {}),
        ...(e.styles ? { 'src/styles.css': e.styles } : {}),
      }
    default:
      return {
        'index.html': '<div id="vis-container"></div>',
        'index.ts': 'import \'./src/App.ts\'',
        'src/App.ts': e.codeTs,
        'src/data.ts': e.data,
        ...(e.constants ? { 'src/constants.ts': e.constants } : {}),
        ...(e.styles ? { 'src/styles.css': e.styles } : {}),
      }
  }
}

export function launchStackBlitz (framework: Framework, example: Example): void {
  const project: Project = {
    title: `Unovis Demo (${framework})`,
    description: example.title,
    template: templates[framework],
    files: getStarterFiles(framework, example),
    dependencies: {
      'web-worker': '^1.3.0',
      '@unovis/ts': ver,
    },
  }

  if (framework !== Framework.TypeScript) project.dependencies[`@unovis/${framework}`] = ver

  sdk.openProject(project, {
    openFile: getOpenFiles(framework, project.files),
  })
}
