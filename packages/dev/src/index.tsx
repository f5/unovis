import { ExampleViewer, exampleViewerLoader } from '@/components/ExampleViewer'
// Examples
import { examples } from '@/examples'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'


const router = createBrowserRouter([
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
])

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
