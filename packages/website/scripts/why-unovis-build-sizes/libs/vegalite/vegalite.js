// Vega-Lite (vanilla): vega-embed renders a Vega-Lite spec into an element (and provides the tooltips)
// eslint-disable-next-line import/no-unresolved -- vega-embed only declares ESM `exports`, which the resolver doesn't read
import vegaEmbed from 'vega-embed'
import { getContainer } from '../shared/data.js'
import { spec } from './vegalite-spec.js'

vegaEmbed(getContainer(), spec, { actions: false })
