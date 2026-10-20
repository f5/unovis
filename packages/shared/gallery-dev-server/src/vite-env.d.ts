/// <reference types="vite/client" />

declare module 'virtual:gallery-examples' {
  const examples: Record<string, { title: string; category: string }>
  export default examples
}
