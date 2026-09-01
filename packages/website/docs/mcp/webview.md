---
mdx:
  format: md
description: Embedding charts in React Native and other native WebViews
sidebar_position: 8
---
# Embedding in native WebViews

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

The embed document works in React Native's WebView (and other native WebViews)
without a shim: the widget detects the native bridge and speaks the same
protocol over it. The document is a build artifact — generate it once with
`buildEmbedDocument()`, commit it to the app, and load it from local assets so
charts work offline. If the app only renders some chart types, say so —
`buildEmbedDocument({ components: ['Line', 'Donut'] })` — and the committed
document carries a bundle half the size.

## What the widget does differently under React Native

- **Outgoing messages** go through `window.ReactNativeWebView.postMessage`
  (as JSON **strings** — the bridge doesn't carry structured clones) instead
  of `window.parent.postMessage`.
- **Incoming messages** are accepted as strings or objects, on both `window`
  and `document` — React Native delivers `'message'` on `document` on Android
  and on `window` on iOS.

Nothing else changes: the message shapes are identical to the
[iframe protocol](./interactive.md#protocol).

## Wiring it up

```tsx
import { WebView } from 'react-native-webview'

const chartHtml = require('./assets/unovis-widget.html') // buildEmbedDocument() output

function Chart ({ spec, theme }: { spec: ChartSpec; theme: 'light' | 'dark' }): JSX.Element {
  const webview = useRef<WebView>(null)
  const send = (message: object): void =>
    webview.current?.postMessage(JSON.stringify(message))

  return (
    <WebView
      ref={webview}
      source={chartHtml}
      originWhitelist={['*']}
      onMessage={(event) => {
        const message = JSON.parse(event.nativeEvent.data)
        if (message.type === 'unovis:ready') send({ type: 'unovis:render', spec: { ...spec, theme }, options: { events: true } })
        if (message.type === 'unovis:size') setHeight(message.height)
        if (message.type === 'unovis:event') onChartTap(message.datum)
      }}
    />
  )
}
```

## Theme changes without a reload

A color-scheme flip used to mean remounting the WebView. Send the theme
instead — the widget re-renders its last spec and restyles the page
background:

```ts
send({ type: 'unovis:theme', theme: colorScheme === 'dark' ? 'dark' : 'light' })
```

Sent before any chart has rendered, it just restyles the empty page, so it's
safe to fire from a `useColorScheme` effect unconditionally.

## Version pinning

Because the document is committed to the app, assert compatibility at startup:
`unovis:ready` carries `{ version, specVersion }` (see
[Chart spec → Versioning](./chart-spec.md#versioning)). Refuse to render —
or prompt for an app update — when `specVersion` is newer than the specs the
app builds.

## Security posture

The bundle contains no `fetch`, `XMLHttpRequest`, `WebSocket` or dynamic
imports, so the WebView needs no network access at all. Combined with
local-asset loading, the chart surface adds zero egress.

## Touch behavior

Interaction events (`events: true`) report taps the same way clicks are
reported in a browser. Two knowns: lines and areas have no per-datum element
(the crosshair is their readout — it tracks touch-drag), and tap handlers
become active within ~500ms of the render settling.
