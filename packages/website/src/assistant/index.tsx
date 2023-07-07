import * as React from 'react'
import { useCallback, useRef, useState } from 'react'

import * as ToggleGroup from '@radix-ui/react-toggle-group'
import ReactMarkdown from 'react-markdown'
import CodeBlock from '@theme/CodeBlock'
import { cx } from '@emotion/css'

import { CornerDownLeft } from 'lucide-react'

// Loader
import Loader from './loader'

// Style
import s from './assistant.module.css'
import toggleGroupStyle from './toggle-group.module.css'

export type UnovisAssistantMessage = {
  role: 'assistant' | 'user';
  content: string;
}

export function UnovisAssistant (): JSX.Element {
  const [isOpen, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState<string>('')
  const [title, setTitle] = React.useState(null)
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const completionRef = useRef('')
  const frameworkRef = useRef('react')
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<UnovisAssistantMessage[]>([])
  const assistantApiUrl = 'http://localhost:9999'

  const complete = useCallback((prompt): void => {
    const _messages = [...messages, { role: 'user' as const, content: query }]
    setMessages(_messages)
    requestAnimationFrame(() => messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current.scrollHeight))
    if (!messages.length) setTitle(query)
    setQuery('')
    setCompletion(null)
    setIsLoading(true)
    setError(null)

    fetch(`${assistantApiUrl}/ask?prompt=${prompt}`)
      .then((res) => res.text())
      .then((data) => {
        setIsLoading(false)
        setError(null)
        setCompletion(data)
        setMessages([..._messages, { role: 'assistant', content: data }])
        messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current.scrollHeight)
      })
      .catch((err) => {
        setIsLoading(false)
        setError(err)
      })
  }, [messages, query])

  const completeStream = useCallback((prompt): void => {
    const _messages = [...messages, { role: 'user' as const, content: query }]
    setMessages(_messages)
    requestAnimationFrame(() => messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current.scrollHeight))
    if (!messages.length) setTitle(query)
    setQuery('')
    setCompletion('')
    setIsLoading(true)
    setError(null)

    fetch(`${assistantApiUrl}/ask-streamed?prompt=${prompt}&framework=${frameworkRef.current}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })
      .then(response => {
        setIsLoading(false)
        setError(null)
        completionRef.current = ''

        const reader = response.body.getReader()
        return new ReadableStream({
          start (controller) {
            function read (): void {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                  return
                }
                controller.enqueue(value)
                read()
              })
            }
            read()
          },
        })
      })
      .then(stream => {
        const newMessage = { role: 'assistant' as const, content: '' }
        _messages.push(newMessage)
        const reader = stream.getReader()
        return new ReadableStream({
          start (controller) {
            function read (): void {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                  return
                }
                // Process each chunk of streamed data
                let text = ''
                const chunk = new TextDecoder().decode(value)
                const payloads = chunk.toString().split('\n\n')
                for (const payload of payloads) {
                  if (payload.includes('[DONE]')) return
                  if (payload.startsWith('data:')) {
                    const json = JSON.parse(payload.replace('data: ', ''))
                    const deltaContent: string = json.choices[0].delta?.content ?? ''
                    text += deltaContent
                  }
                }
                newMessage.content += text
                completionRef.current += text
                setCompletion(completionRef.current)
                setMessages([..._messages])
                messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current.scrollHeight)
                read()
              })
            }
            read()
          },
        })
      })
      .catch(error => {
        setIsLoading(false)
        setError(error)
      })
  }, [completion, query, messages])

  function handleModalToggle (): void {
    setOpen(!isOpen)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === 'j' && e.metaKey) {
        setOpen(true)
      }

      if (e.key === 'Escape') {
        handleModalToggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSubmit = (): void => completeStream(query)
  const handleFrameworkChange = (framework): void => { frameworkRef.current = framework }
  const resetChat = (): void => {
    setCompletion('')
    setQuery('')
    setTitle(null)
    setMessages([])
  }

  return (
    <div className={s.assistant} hidden={!isOpen}>
      <div className={s.assistantFade} onClick={handleModalToggle}></div>
      <div className={s.assistantPanel}>
        <div className={s.assistantHeader}>
          {title
            ? <span>Q: {title}<span className={s.assistantFrameworkLabel}>{frameworkRef.current}</span></span>
            : 'Unovis Assistant'}
          <button onClick={resetChat}>New Chat</button>
        </div>

        <div ref={messagesContainerRef} className={s.assistantMessages}>
          {error && <span>😢The search has failed! Please try again.</span>}

          {messages.length && !error ? (
            messages.map((message, i) => (
              <div key={i} className={s.assistantMessage}>
                <div className={s.assistantMessageRole}>{message.role === 'assistant' ? '🤖' : '👤'}</div>
                <div className={s.assistantMessageContent}>
                  <ReactMarkdown
                    components={{
                      code ({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <CodeBlock language={match[1]}>{children}</CodeBlock>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        )
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          ) : null}

          {isLoading && <Loader />}

          {!completion && !isLoading && !error && (<div className={s.assistantEmptyState}>
            <div className={s.assistantEmptyStateIcon}>🤖</div>
            <div className={s.assistantEmptyStateText}>Unovis Assistant is an experimental LLM-powered chat-bot that can answer your Unovis questions.</div>
            <div className={s.assistantFrameworkButtons}>
              <div>Select your framework:</div>
              <ToggleGroup.Root
                className={toggleGroupStyle.ToggleGroup}
                type="single"
                defaultValue="react"
                aria-label="Framework"
                onValueChange={handleFrameworkChange}
              >
                <ToggleGroup.Item className={toggleGroupStyle.ToggleGroupItem} value="react" aria-label="Left aligned">
             React
                </ToggleGroup.Item>
                <ToggleGroup.Item className={toggleGroupStyle.ToggleGroupItem} value="angular" aria-label="Center aligned">
              Angular
                </ToggleGroup.Item>
                <ToggleGroup.Item className={toggleGroupStyle.ToggleGroupItem} value="svelte" aria-label="Center aligned">
              Svelte
                </ToggleGroup.Item>
                <ToggleGroup.Item className={toggleGroupStyle.ToggleGroupItem} value="typescript" aria-label="Right aligned">
              Typescript
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>
          </div>)}

        </div>

        <div className={cx(s.assistantInput, { [s.disabled]: isLoading })}>
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            className={s.assistantInputElement}
            placeholder={isLoading ? 'Waiting for an answer' : 'Ask a question...'}
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }
            }
          />
          <div className={s.assistantInputButton} onClick={handleSubmit}>
            <CornerDownLeft size={18}/>
            <span style={{ marginLeft: '4px' }}>Ask</span>
          </div>
        </div>
      </div>
    </div>
  )
}
