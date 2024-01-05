declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.svg?raw' {
  const content: string
  export default content
}
