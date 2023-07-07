import { createHash } from 'crypto'
import { readFile } from 'fs/promises'
import GithubSlugger from 'github-slugger'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxFromMarkdown, MdxjsEsm } from 'mdast-util-mdx'
import { toMarkdown } from 'mdast-util-to-markdown'
import { toString } from 'mdast-util-to-string'
import { mdxjs } from 'micromark-extension-mdxjs'
import { u } from 'unist-builder'
import { filter } from 'unist-util-filter'

// Types
import type { ObjectExpression } from 'estree'
import type { Content, Root } from 'mdast'

// Local Types
import { Meta, Section, ProcessedMdx } from './types'

/**
 * Extracts ES literals from an `estree` `ObjectExpression`
 * into a plain JavaScript object.
 */
export function getObjectFromExpression (node: ObjectExpression): Record<string, string | number | bigint | true | RegExp | undefined> {
  return node.properties.reduce<Record<string, string | number | bigint | true | RegExp | undefined>>(
    (object, property) => {
      if (property.type !== 'Property') {
        return object
      }

      const key = (property.key.type === 'Identifier' && property.key.name) || undefined
      const value = (property.value.type === 'Literal' && property.value.value) || undefined

      if (!key) {
        return object
      }

      return {
        ...object,
        [key]: value,
      }
    }, {})
}


/**
 * Extracts the `meta` ESM export from the MDX file.
 *
 * This info is akin to frontmatter.
 */
export function extractMetaExport (mdxTree: Root): Record<string, string | number | bigint | true | RegExp | undefined> | undefined {
  const metaExportNode = mdxTree.children.find((node): node is MdxjsEsm => {
    return (
      node.type === 'mdxjsEsm' &&
      node.data?.estree?.body[0]?.type === 'ExportNamedDeclaration' &&
      node.data.estree.body[0].declaration?.type === 'VariableDeclaration' &&
      node.data.estree.body[0].declaration.declarations[0]?.id.type === 'Identifier' &&
      node.data.estree.body[0].declaration.declarations[0].id.name === 'meta'
    )
  })

  if (!metaExportNode) {
    return undefined
  }

  const objectExpression =
    (metaExportNode.data?.estree?.body[0]?.type === 'ExportNamedDeclaration' &&
      metaExportNode.data.estree.body[0].declaration?.type === 'VariableDeclaration' &&
      metaExportNode.data.estree.body[0].declaration.declarations[0]?.id.type === 'Identifier' &&
      metaExportNode.data.estree.body[0].declaration.declarations[0].id.name === 'meta' &&
      metaExportNode.data.estree.body[0].declaration.declarations[0].init?.type ===
        'ObjectExpression' &&
      metaExportNode.data.estree.body[0].declaration.declarations[0].init) ||
    undefined

  if (!objectExpression) {
    return undefined
  }

  return getObjectFromExpression(objectExpression)
}

/**
 * Splits a `mdast` tree into multiple trees based on
 * a predicate function. Will include the splitting node
 * at the beginning of each tree.
 *
 * Useful to split a markdown file into smaller sections.
 */
export function splitTreeBy (tree: Root, predicate: (node: Content) => boolean): Root[] {
  return tree.children.reduce<Root[]>((trees, node) => {
    const [lastTree] = trees.slice(-1)

    if (!lastTree || predicate(node)) {
      const tree: Root = u('root', [node])
      return trees.concat(tree)
    }

    lastTree.children.push(node)
    return trees
  }, [])
}


export abstract class BaseEmbeddingSource {
  checksum?: string
  meta?: Meta
  sections?: Section[]

  constructor (public source: string, public path: string, public parentPath?: string) {}

  abstract load(): Promise<{
    checksum: string;
    meta?: Meta;
    sections: Section[];
  }>
}

/**
 * Processes MDX content for search indexing.
 * It extracts metadata, strips it of all JSX,
 * and splits it into sub-sections based on criteria.
 */
export function processMdxForSearch (content: string): ProcessedMdx {
  const checksum = createHash('sha256').update(content).digest('base64')

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mdxTree = fromMarkdown(content, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  })

  const meta = extractMetaExport(mdxTree)

  // Remove all MDX elements from markdown
  const mdTree = filter(
    mdxTree,
    (node) =>
      ![
        'mdxjsEsm',
        'mdxJsxFlowElement',
        'mdxJsxTextElement',
        'mdxFlowExpression',
        'mdxTextExpression',
      ].includes(node.type)
  )

  if (!mdTree) {
    return {
      checksum,
      meta,
      sections: [],
    }
  }

  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === 'heading' && node.depth <= 2)

  const slugger = new GithubSlugger()

  const sections = sectionTrees.map((tree) => {
    const [firstNode] = tree.children

    const heading = firstNode?.type === 'heading' ? toString(firstNode) : undefined
    const slug = heading ? slugger.slug(heading) : undefined

    return {
      content: toMarkdown(tree),
      heading,
      slug,
    }
  }).filter((section) => section.content.length > 30)

  return {
    checksum,
    meta,
    sections,
  }
}

export class MarkdownEmbeddingSource extends BaseEmbeddingSource {
  type = 'markdown' as const

  constructor (source: string, public filePath: string, public parentFilePath?: string) {
    super(
      source,
      filePath.replace(/^pages/, '').replace(/\.mdx?$/, ''),
      parentFilePath?.replace(/^pages/, '').replace(/\.mdx?$/, '')
    )
  }

  async load (): Promise<ProcessedMdx> {
    const contents = await readFile(this.filePath, 'utf8')
    const { checksum, meta, sections } = processMdxForSearch(contents)

    this.checksum = checksum
    this.meta = meta
    this.sections = sections

    return {
      checksum,
      meta,
      sections,
    }
  }
}

