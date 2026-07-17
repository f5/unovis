import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Params, useLoaderData, useSearchParams } from 'react-router-dom'
import { SandpackProvider, SandpackLayout, SandpackCodeEditor } from '@codesandbox/sandpack-react'

import { useAppContext } from '@src/AppContext'
import { ExampleGroup } from '@src/examples'

// Styles
import s from './style.module.css'

// eslint-disable-next-line @typescript-eslint/ban-types
export type ExampleViewerProps = {
  examples: ExampleGroup[];
}

type ExampleViewerUrlParams = {
  title: string;
  group: string;
}

export type ExampleViewerDurationProps = {
  duration: number | undefined;
}

export async function exampleViewerLoader ({ params }: { params: Params }): Promise<Params> {
  return params
}

export async function loadExampleFiles (exampleGroup: ExampleGroup, exampleTitle: string): Promise<Record<string, { code: string }>> {
  const exampleItem = exampleGroup.items.find(d => d.title === exampleTitle)
  if (!exampleItem) {
    return {}
  }
  const files: Record<string, { code: string }> = {}

  // Sort the files array to prioritize 'index.tsx'
  const sortedFiles = [...exampleItem.files].sort((a, b) => {
    if (a.includes('index.tsx')) return -1
    if (b.includes('index.tsx')) return 1
    return 0
  })

  for (const file of sortedFiles) {
    if (file.endsWith('.svg')) continue
    const response = await fetch(`/examples/${file}`)
    const content = await response.text()
    files[file.replace(/.*\//, '')] = { code: content }
  }
  return files
}

export function ExampleViewer (props: ExampleViewerProps): React.ReactNode {
  const params = useLoaderData() as ExampleViewerUrlParams
  const [searchParams] = useSearchParams()
  const urlDuration = searchParams.get('duration') && !isNaN(+searchParams.get('duration')!) ? +searchParams.get('duration')! : 600
  const exampleTitle = params?.title
  const exampleGroupTitle = params?.group
  const exampleGroup = props.examples?.find(d => d.title === exampleGroupTitle)
  const exampleItem = exampleGroup?.items.find(d => d.title === exampleTitle)

  const [files, setFiles] = useState<Record<string, { code: string }>>({})
  const { isCodeHidden, isDarkTheme } = useAppContext()

  useEffect(() => {
    if (exampleGroup && exampleTitle) {
      loadExampleFiles(exampleGroup, exampleTitle).then(setFiles)
    }
  }, [exampleGroup, exampleTitle])

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = exampleItem?.component as React.FC<ExampleViewerDurationProps>

  return (
    <div className={s.exampleViewer}>
      { exampleItem
        ? (
          <div className={s.exampleWrapper}>
            <PanelGroup direction="horizontal" className={s.panelGroup}>
              <Panel style={{ height: '100%' }} order={1}>
                <div className={s.example}>
                  <Component duration={urlDuration}/>
                </div>
              </Panel>
              {!isCodeHidden && Object.keys(files).length > 0 && (
                <>
                  <PanelResizeHandle />
                  <Panel defaultSize={50} minSize={0} style={{ height: '100%' }} order={2}>
                    <div className={s.codeViewer} style={{ height: '100%' }}>
                      <SandpackProvider
                        files={files}
                        theme={isDarkTheme ? 'dark' : 'light'}
                        customSetup={{
                          entry: 'index.tsx',
                        }}
                        options={{
                          visibleFiles: Object.keys(files),
                          classes: {
                            'sp-wrapper': s.spHeight as string,
                            'sp-layout': s.spHeight as string,
                            'sp-editor': s.spHeight as string,
                            'sp-file-explorer': s.spHeight as string,
                          },
                        }}
                      >
                        <SandpackLayout style={{ height: '100%', minHeight: 0 }}>
                          <SandpackCodeEditor readOnly style={{ height: '100%', minHeight: 0 }} />
                        </SandpackLayout>
                      </SandpackProvider>
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </div>
        )
        : <div className={s.nothingSelected}>🖼 Select an example to view it</div>
      }
    </div>
  )
}
