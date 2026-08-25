/* The widget bundle's "no network capability" property is a contract, not an
 * accident: downstream deployments (native WebViews with egress rules, strict
 * CSPs) rely on the embed document never being able to phone anywhere. Assert
 * it on the built artifact itself, so a dependency bump that drags in a
 * fetch-capable module fails here instead of in someone's security review. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Everything a generated document can execute: the bundle and the
// self-extracting bootstrap that inflates it
const bundle = ['bundle.js', 'bundle.standard.js', 'unpack.js']
  .map(name => readFileSync(join(__dirname, '..', 'dist', 'widget', name), 'utf8'))
  .join('\n')

describe('widget bundle network capability', () => {
  it.each([
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'sendBeacon',
    'EventSource',
    'importScripts',
    'import(', // dynamic import — the loader could reach the network
  ])('contains no %s', (token) => {
    expect(bundle.includes(token)).toBe(false)
  })

  it('references no URLs beyond W3C namespaces', () => {
    const urls = [...new Set(bundle.match(/https?:\/\/[^"'`\s\\)]+/g) ?? [])]
    const offenders = urls.filter(url => !url.startsWith('http://www.w3.org/'))
    expect(offenders).toEqual([])
  })
})
