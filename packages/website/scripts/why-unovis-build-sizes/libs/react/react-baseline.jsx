// Context only: React + ReactDOM themselves (react, react-dom/client, react/jsx-runtime), which are
// marked external in every React row of the comparison because every React app already ships them.
import { createRoot } from 'react-dom/client'
import { getContainer } from '../shared/data.js'

createRoot(getContainer()).render(<div>Hello</div>)
