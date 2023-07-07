/* eslint-disable dot-notation */
import express, { NextFunction, query, Request, Response } from 'express'
import { search, searchStream, UiFramework } from './search.js'

const app = express()
const port = 9999

app.use(express.json())

// Custom CORS middleware function
const allowCors = (req: Request, res: Response, next: NextFunction): void => {
  // Todo: Replace with your desired origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
}

// Define the endpoint
app.get('/ask', async (req: Request, res: Response) => {
  const prompt = req.query['prompt'] as string
  const framework = (req.query['framework'] || 'react') as UiFramework
  if (!prompt) return res.send('')

  const result = await search(prompt, framework)
  // Todo: Replace with your desired origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.send(result)
})

app.options('/ask-streamed', allowCors) // Handle preflight requests
app.post('/ask-streamed', allowCors, async (req: Request, res: Response) => {
  const prompt = req.query['prompt'] as string
  const framework = (req.query['framework'] || 'react') as UiFramework
  const messages = req.body.messages
  const stream = await searchStream(prompt, framework, messages)

  // Set the appropriate response headers
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Content-Disposition', 'attachment; filename="assistant.txt"')

  // // Stream the data to the client
  stream.pipe(res)
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is listening on port ${port}`)
})
