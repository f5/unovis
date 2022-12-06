/* eslint-disable @typescript-eslint/naming-convention */
import sdk, { OpenFileOption, Project, ProjectFiles, ProjectTemplate } from '@stackblitz/sdk'
import { Framework } from '../types/code'
import { Example } from '../types/example'
import { trimMultiline } from './text'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ver = require('../../../../package.json').version

const templates: Record<Framework, ProjectTemplate> = {
  [Framework.Angular]: 'angular-cli',
  [Framework.React]: 'create-react-app',
  [Framework.Svelte]: 'node',
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
    default:
      return 'src/App.ts'
  }
}
function getStarterFiles (framework: Framework, e: Example): ProjectFiles {
  switch (framework) {
    case Framework.Angular:
      return {
        'index.html': '<app-component></app-component>',
        'main.ts': trimMultiline(`
          import 'zone.js'
          import { NgModule, Component } from '@angular/core'
          import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
          import { BrowserModule } from '@angular/platform-browser'
          import { ComponentModule } from './${e.pathname}'

          @Component({
            selector: 'app-component',
            template: '<${e.pathname}></${e.pathname}>'
          }) export class AppComponent { }

          @NgModule({
            imports:      [ BrowserModule, ComponentModule ],
            declarations: [ AppComponent ],
            bootstrap:    [ AppComponent ]
          })
          export class AppModule { }

          platformBrowserDynamic().bootstrapModule(AppModule)
        `),
        [`${e.pathname}/${e.pathname}.component.ts`]: e.codeAngular.component,
        [`${e.pathname}/${e.pathname}.component.html`]: e.codeAngular.html,
        [`${e.pathname}/${e.pathname}.module.ts`]: e.codeAngular.module,
        [`${e.pathname}/index.ts`]: `${e.codeAngular.module.match(/export class\s*\S+/gm).pop().replace('class', '{')} as ComponentModule } from './${e.pathname}.module.ts'`,
        [`${e.pathname}/data.ts`]: e.data,
        ...(e.constants ? { [`${e.pathname}/constants.ts`]: e.constants } : {}),
        ...(e.styles ? { [`${e.pathname}/styles.css`]: e.styles } : {}),
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
            "vite": "^3.1.0"
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
    title: 'Unovis Demo',
    description: example.title,
    template: templates[framework],
    files: getStarterFiles(framework, example),
    dependencies: {
      '@unovis/ts': ver,
    },
  }

  if (framework !== Framework.TypeScript) project.dependencies[`@unovis/${framework}`] = ver

  sdk.openProject(project, {
    openFile: getOpenFiles(framework, project.files),
  })
}
