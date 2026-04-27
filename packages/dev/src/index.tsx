import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'

// Examples
import { examples } from '@src/examples'
import { ExampleViewer, exampleViewerLoader } from '@src/components/ExampleViewer'

import App from './App'

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __UNOVIS_HASH_ROUTER__: boolean

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ExampleViewer examples={examples}/> },
      {
        path: 'examples',
        element: <ExampleViewer examples={examples}/>,
      },
      {
        path: 'examples/:group/:title',
        element: <ExampleViewer examples={examples}/>,
        loader: exampleViewerLoader,
      },
    ],
  },
]

const createRouter = __UNOVIS_HASH_ROUTER__ ? createHashRouter : createBrowserRouter
const router = createRouter(routes)
const safeRouterProvider = RouterProvider as unknown as React.ComponentType<{ router: typeof router }>

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    {React.createElement(safeRouterProvider, { router })}
  </React.StrictMode>
)
