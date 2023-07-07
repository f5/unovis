/* eslint-disable dot-notation, @typescript-eslint/naming-convention */
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { createClient, PostgrestError } from '@supabase/supabase-js'
import {
  Configuration,
  OpenAIApi,
  CreateEmbeddingResponseDataInner,
  CreateModerationResponse,
  CreateEmbeddingResponse,
  CreateModerationResponseResultsInner,
  CreateChatCompletionRequest,
} from 'openai'
import * as fs from 'fs'
import { oneLine, codeBlock } from 'common-tags'
import { IncomingMessage } from 'http'


// Initialize OpenAI API
const openAiConfiguration = new Configuration({
  apiKey: process.env['OPENAI_KEY'],
})
const openai = new OpenAIApi(openAiConfiguration)

// Initialize Supabase client
const supabase = createClient(
  process.env['SUPABASE_URL'] as string,
  process.env['SUPABASE_KEY'] as string,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

const componentList: Record<string, string> = {
  Axis: '../ts/src/components/axis',
  Brush: '../ts/src/components/brush',
  BulletLegend: '../ts/src/components/bullet-legend',
  Crosshair: '../ts/src/components/crosshair',
  FreeBrush: '../ts/src/components/free-brush',
  Tooltip: '../ts/src/components/tooltip',
  LeafletFlowMap: '../ts/src/components/leaflet-flow-map',
  LeafletMap: '../ts/src/components/leaflet-map',
  TopoJSONMap: '../ts/src/components/topojson-map',
  Donut: '../ts/src/components/donut',
  NestedDonut: '../ts/src/components/nested-donut',
  ChordDiagram: '../ts/src/components/chord-diagram',
  Graph: '../ts/src/components/graph',
  Sankey: '../ts/src/components/sankey',
  Area: '../ts/src/components/area',
  GroupedBar: '../ts/src/components/grouped-bar',
  Line: '../ts/src/components/line',
  Scatter: '../ts/src/components/scatter',
  StackedBar: '../ts/src/components/stacked-bar',
  Timeline: '../ts/src/components/timeline',
  SingleContainer: '../ts/src/containers/single-container',
  XYContainer: '../ts/src/containers/xy-container',
}

export type UnovisAssistantMessage = {
  role: 'assistant' | 'user';
  content: string;
}

async function getRelatedDocEntries (query: string): Promise<{ title: string; content: string; similarity: number }[]> {
  const sanitizedQuery = query.trim()
  const moderationResponse = await openai
    .createModeration({ input: sanitizedQuery })

  const [results] = moderationResponse.data.results as CreateModerationResponseResultsInner[]

  if (results?.flagged) {
    throw new Error(`Flagged content: ${sanitizedQuery}`)
  }

  // Create embedding from query
  const embeddingResponse = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: sanitizedQuery.replaceAll('\n', ' '),
  })

  if (embeddingResponse.status !== 200) {
    throw new Error(`Failed to create embedding for question: ${embeddingResponse.statusText}`)
  }

  const [{ embedding }] = embeddingResponse.data.data as [CreateEmbeddingResponseDataInner]

  const { error: matchError, data: sections } = await supabase.rpc(
    'match_documents',
    {
      query_embedding: embedding,
      match_threshold: 0.80,
      match_count: 15,
    }
  ) as { error: PostgrestError | null; data: { title: string; content: string; similarity: number }[] }

  if (matchError) {
    console.error(matchError)
    throw new Error('Failed to match page sections')
  }

  return sections
}

async function loadConfigInterface (componentName: string): Promise<string> {
  if (!componentList[componentName]) return ''

  try {
    const configInterfaceContent = fs.readFileSync(`${componentList[componentName]}/config.ts`, 'utf8')
    return configInterfaceContent
  } catch (e) {
    return ''
  }
}

export type UiFramework = 'react' | 'typescript' | 'svelte' | 'angular'
const examplesCode: {
  react: string;
  typescript: string;
  svelte: string;
  angular: {
    module: string;
    component: string;
    template: string;
  };}[] = []

async function preloadExamples (): Promise<void> {
  const path = '../website/src/examples'
  const entries = (await readdir(path))

  for (const entry of entries) {
    const fullPath = join(path, entry)
    const stats = await stat(fullPath)
    if (!stats.isDirectory()) continue

    try {
      examplesCode.push({
        react: fs.readFileSync(`${path}/${entry}/${entry}.tsx`, 'utf8'),
        typescript: fs.readFileSync(`${path}/${entry}/${entry}.ts`, 'utf8'),
        svelte: fs.readFileSync(`${path}/${entry}/${entry}.svelte`, 'utf8'),
        angular: {
          module: fs.readFileSync(`${path}/${entry}/${entry}.module.ts`, 'utf8'),
          component: fs.readFileSync(`${path}/${entry}/${entry}.component.ts`, 'utf8'),
          template: fs.readFileSync(`${path}/${entry}/${entry}.component.html`, 'utf8'),
        },
      })
    } catch (e) {
      continue
    }
  }
}


function getExamples (componentName: string, framework: UiFramework): string[] {
  const examples = examplesCode
    .filter((example) => {
      const code = framework === 'angular' ? example.angular.module : example[framework]
      return code.includes(componentName)
    })

  return examples.map(example => {
    if (framework === 'angular') {
      return `Template: \n${example.angular.template}\n\nComponent: \n${example.angular.component}\n\nModule: \n${example.angular.module}`
    } else return example[framework]
  })
}

export async function getSearchChatCompletionsParameters (query: string, framework: UiFramework, messageHistory: UnovisAssistantMessage[]): Promise<CreateChatCompletionRequest> {
  const sections = await getRelatedDocEntries([
    ...messageHistory.map(message => message.content),
    query,
  ].join('\n'))

  // eslint-disable-next-line no-console
  console.log('Search | Sections retrieved', sections)
  const components = Array.from(new Set(sections.map(entry => entry.title.split('/').pop())))
    .filter(componentName => componentList[componentName as string])
    .slice(0, messageHistory.length ? 1 : 3)

  const configInterfaces = components.map(componentName => loadConfigInterface(componentName as string))
  // eslint-disable-next-line no-console
  console.log('Search | Config Interfaces retrieved', components.join(', '))

  const examples = components.map(componentName => getExamples(componentName as string, framework)).slice(0, 5)
  // eslint-disable-next-line no-console
  console.log('Search | Examples retrieved', examples.length)

  const prompt = codeBlock(`
      Question: """
      ${query}
      """
      Answer as markdown:
  `)

  const searchChatCompletionsParameters: CreateChatCompletionRequest = {
    model: 'gpt-3.5-turbo-16k',
    temperature: 0.6,
    max_tokens: 6122,
    // presence_penalty: 1,
    // frequency_penalty: 1,
    messages: [
      {
        role: 'system',
        content: oneLine(`
          You're a ${framework} engineer that writes great documentation,
          Given the following sections from Unovis documentation, TypeScript config interfaces,
          and examples, answer the question using only that information, outputted in markdown format.
          If you are unsure and the answer is not explicitly written in the provided materials, say
          "Sorry, I don't know how to help with that.".
          ${framework === 'angular' ? 'Output example as a single Angular Component with the template and modules import code' : ''}
          Context sections: ${sections.map(section => section.content).join('\n')}
          Config interfaces: ${configInterfaces.join('\n')}
          Related examples: ${examples.join('\n')}`
        ),
      },
      ...messageHistory,
      {
        role: 'user',
        content: prompt,
      },
    ],
  }

  return searchChatCompletionsParameters
}

export async function search (query: string, framework: UiFramework = 'react'): Promise<string> {
  const chatCompletion = await openai.createChatCompletion(await getSearchChatCompletionsParameters(query, framework, []))

  // eslint-disable-next-line no-console
  console.log('Search | Completion Received')
  return chatCompletion.data.choices[0]?.message?.content ?? ''
}

export async function searchStream (query: string, framework: UiFramework = 'react', messageHistory: UnovisAssistantMessage[] = []): Promise<IncomingMessage> {
  const requestParameters = await getSearchChatCompletionsParameters(query, framework, messageHistory)
  const completion = await openai.createChatCompletion({
    ...requestParameters,
    stream: true,
  }, { responseType: 'stream' })

  const stream = completion.data as unknown as IncomingMessage

  // Output the stream to the console for debugging
  // stream.on('data', (chunk: Buffer) => {
  //   const payloads = chunk.toString().split('\n\n')
  //   for (const payload of payloads) {
  //     if (payload.includes('[DONE]')) return
  //     if (payload.startsWith('data:')) {
  //       try {
  //         const data = JSON.parse(payload.replace('data: ', ''))
  //         const chunk: undefined | string = data.choices[0].delta?.content
  //         if (chunk) {
  //           console.log(chunk)
  //         }
  //       } catch (error) {
  //         console.log(`Error with JSON.parse and ${payload}.\n${error}`)
  //       }
  //     }
  //   }
  // })

  return stream
}


preloadExamples()
