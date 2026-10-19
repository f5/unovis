import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Params, useLoaderData, useSearchParams } from 'react-router-dom'
import { SandpackProvider, SandpackLayout, SandpackCodeEditor } from '@codesandbox/sandpack-react'

import { useAppContext } from '@src/AppContext'
import { ExampleGroup } from '@src/examples'
import { CaptureFrame } from '@src/capture/CaptureFrame'
import { getCaptureSettings } from '@src/capture/settings'

import { CodeFileTabs } from './CodeFileTabs'
import { CodePanelToolbar } from './CodePanelToolbar'
import { PREVIEW_BYTE_LIMIT, PREVIEW_LINE_LIMIT } from './constants'

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

async function loadFilePreview (file: string): Promise<string> {
  const url = `/examples/${file}`
  const response = await fetch(url, { headers: { range: `bytes=0-${PREVIEW_BYTE_LIMIT - 1}` } })
  const text = await response.text()

  const totalBytes = Number(response.headers.get('Content-Range')?.split('/')[1])
  const isPartialResponse = response.status === 206 && totalBytes > PREVIEW_BYTE_LIMIT
  const lines = text.split('\n')

  if (!isPartialResponse && lines.length <= PREVIEW_LINE_LIMIT) return text

  const previewLines = lines.slice(0, PREVIEW_LINE_LIMIT)
  // A byte range cuts mid-line, so the last line of a partial response is a fragment.
  if (isPartialResponse && lines.length <= PREVIEW_LINE_LIMIT) previewLines.pop()

  return [
    ...previewLines,
    '',
    `… preview stops here at ${previewLines.length} lines. Open ${url} for the whole file.`,
  ].join('\n')
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
    const content = /\.(json|csv|tsv)$/.test(file)
      ? await loadFilePreview(file)
      : await fetch(`/examples/${file}`).then(response => response.text())
    files[file.replace(/.*\//, '')] = { code: content }
  }
  return files
}

export function ExampleViewer (props: ExampleViewerProps): React.ReactNode {
  const capture = getCaptureSettings()
  const params = useLoaderData() as ExampleViewerUrlParams
  const [searchParams] = useSearchParams()
  const urlDuration = searchParams.get('duration') && !isNaN(+searchParams.get('duration')!) ? +searchParams.get('duration')! : 600
  const exampleTitle = params?.title
  const exampleGroupTitle = params?.group
  const exampleGroup = props.examples?.find(d => d.title === exampleGroupTitle)
  const exampleItem = exampleGroup?.items.find(d => d.title === exampleTitle)

  const [files, setFiles] = useState<Record<string, { code: string }>>({})
  const { isCodeHidden, setIsCodeHidden, isDarkTheme } = useAppContext()

  useEffect(() => {
    let cancelled = false
    setFiles({})
    if (!capture && exampleGroup && exampleTitle) {
      loadExampleFiles(exampleGroup, exampleTitle).then(files => {
        if (!cancelled) setFiles(files)
      })
    }
    return () => { cancelled = true }
  }, [exampleGroup, exampleTitle])

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = exampleItem?.component as React.FC<ExampleViewerDurationProps>

  if (capture && exampleItem) {
    return (
      <CaptureFrame key={`${exampleGroupTitle}/${exampleTitle}`} settings={capture}>
        <Component duration={0}/>
      </CaptureFrame>
    )
  }

  return (
    <div className={s.exampleViewer}>
      { exampleItem
        ? (
          <div className={s.exampleWrapper}>
            <PanelGroup direction="horizontal" className={s.panelGroup} autoSaveId="unovis-dev:example-panels">
              <Panel style={{ height: '100%' }} order={1}>
                <div className={s.example}>
                  <Component duration={urlDuration}/>
                </div>
              </Panel>
              {!isCodeHidden && Object.keys(files).length > 0 && (
                <>
                  <PanelResizeHandle className={s.panelResizeHandle} />
                  <Panel defaultSize={50} minSize={20} style={{ height: '100%' }} order={2}>
                    <div className={s.codeViewer} style={{ height: '100%' }}>
                      <SandpackProvider
                        key={`${exampleGroupTitle}/${exampleTitle}`}
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
                        <CodePanelToolbar title={exampleTitle} subTitle={exampleItem.subTitle} onClose={() => setIsCodeHidden(true)} />
                        <CodeFileTabs />
                        <SandpackLayout style={{ height: '100%', minHeight: 0 }}>
                          <SandpackCodeEditor readOnly showReadOnly={false} showTabs={false} showRunButton={false} wrapContent style={{ height: '100%', minHeight: 0 }} />
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
