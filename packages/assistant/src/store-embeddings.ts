/* eslint-disable dot-notation */
import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi, CreateEmbeddingResponseDataInner } from 'openai'

import { walk } from './read-files.js'
import { MarkdownEmbeddingSource } from './embedding-source/index.js'

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

async function getEmbedding (input: string): Promise<number[]> {
  const embeddingResponse = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input,
  })
  const [{ embedding }] = embeddingResponse.data.data as [CreateEmbeddingResponseDataInner]
  return embedding
}

async function storeEmbedding (title: string, body: string, embedding: number[]): Promise<void> {
  const { data, error } = await supabase.from('assistant_embeddings').insert({
    title,
    body,
    embedding,
  })
}


walk('../website/docs/xy-charts').then(async (entries) => {
  const filteredEntries = entries.filter(({ path }) => /\.mdx?$/.test(path))
  const embeddingSources = filteredEntries.map((entry) => new MarkdownEmbeddingSource('guide', entry.path))
  for (const embeddingSource of embeddingSources) {
    // eslint-disable-next-line no-console
    console.log(embeddingSource.path)
    const { type, source, path, parentPath } = embeddingSource
    const { checksum, meta, sections } = await embeddingSource.load()
    for (const { slug, heading, content } of sections) {
      // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
      const input = content.replace(/\n/g, ' ')

      // eslint-disable-next-line no-console
      // console.log('📄', input)
      // const embedding = await getEmbedding(input)
      // await storeEmbedding(path, input, embedding)
    }

    // eslint-disable-next-line no-console
    console.log('✅', embeddingSource.path, 'Embeddings Stored!')
  }
})
