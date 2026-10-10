// Vega-Lite (React): react-vega, the Vega organization's wrapper around vega-embed
import { createRoot } from 'react-dom/client'
import { VegaEmbed } from 'react-vega'
import { getContainer } from '../shared/data.js'
import { spec } from './vegalite-spec.js'

function Chart () {
  return <VegaEmbed spec={spec} options={{ actions: false }} />
}

createRoot(getContainer()).render(<Chart />)
