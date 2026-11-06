// Utils
import { isString } from '@/utils/data'

/** Returns the readable text of a tooltip template's content (an HTML string or an element), with the text
 * of separate elements joined by spaces. HTML strings are parsed in an inert `<template>` element */
export function getTextContent (content: string | HTMLElement | undefined | null): string {
  if (!content) return ''

  let root: Node = content as HTMLElement
  if (isString(content)) {
    const template = document.createElement('template')
    template.innerHTML = content
    root = template.content
  }

  const texts: string[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent?.trim()
    if (text) texts.push(text)
  }
  return texts.join(' ')
}
