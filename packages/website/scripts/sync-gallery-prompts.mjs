import { readFile, writeFile } from 'node:fs/promises'

const metadataUrl = new URL('../../shared/examples/metadata.json', import.meta.url)
const registryUrl = new URL('../../shared/examples/examples-list.tsx', import.meta.url)
const metadata = JSON.parse(await readFile(metadataUrl, 'utf8'))
const registry = await readFile(registryUrl, 'utf8')
const slugs = [...registry.matchAll(/require\('\.\/([^']+)'\)/g)].map(match => match[1])

if (new Set(slugs).size !== slugs.length) {
  throw new Error('Registered gallery examples must be unique')
}

const sections = slugs.map(slug => {
  const example = metadata[slug]
  for (const field of ['title', 'kicker', 'subtitle', 'description', 'prompt']) {
    if (!example?.[field]?.trim()) throw new Error(`Missing ${field} for gallery example ${slug}`)
  }
  if (!example.prompt.includes('{framework}')) throw new Error(`Missing framework placeholder for ${slug}`)
  const sourceLines = example.sources?.map(source => `- [${source.name}](${source.url})`) ?? []
  return [
    `## ${example.title}`,
    '',
    example.kicker,
    '',
    example.subtitle,
    '',
    `Gallery: https://unovis.dev/gallery/view?example=${slug}`,
    `Implementation and bundled data: https://github.com/f5/unovis/tree/main/packages/shared/examples/${slug}`,
    '',
    `Data notes: ${example.description}`,
    ...sourceLines,
    '',
    '### Creation prompt',
    '',
    example.prompt,
  ].join('\n')
})

const content = [
  '# Unovis gallery — chart creation prompts',
  '',
  '> A modular visualization library for React, Angular, Svelte, Vue, Solid, and vanilla TypeScript.',
  '',
  'This file is generated from packages/shared/examples/metadata.json. Edit the metadata and run pnpm --filter @unovis/website sync:gallery-prompts to update it.',
  '',
  '- [Documentation](https://unovis.dev/docs/intro)',
  '- [Agent documentation index](https://unovis.dev/llms.txt)',
  '- [Quick start](https://unovis.dev/docs/quick-start)',
  '- [Component reference](https://unovis.dev/docs/components/Line)',
  '- [Gallery](https://unovis.dev/gallery)',
  '',
  'Each entry includes a reusable prompt, data context, and links to the implementation and bundled dataset. Replace {framework} with React, Angular, Svelte, Vue, Solid, or vanilla TypeScript. Adapt the data fields to the user\'s dataset while retaining the encodings and interactions. Historical snapshots and illustrative data are identified in each entry; do not describe them as live observations.',
  '',
  ...sections.flatMap(section => [section, '']),
].join('\n')

await writeFile(new URL('../static/llm.txt', import.meta.url), content)
