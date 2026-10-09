// Nivo (React only). In @nivo/line 0.99 `Line` needs explicit width/height; `ResponsiveLine` is the
// auto-sizing variant used in the Nivo docs. enableSlices="x" gives the shared (all-series) tooltip.
import { createRoot } from 'react-dom/client'
import { ResponsiveLine } from '@nivo/line'
import { DATA, SERIES, getContainer } from '../shared/data.js'

const data = SERIES.map((s) => ({ id: s.label, data: DATA.map((d) => ({ x: d.x, y: d[s.key] })) }))

function Chart () {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveLine
        data={data}
        colors={SERIES.map((s) => s.color)}
        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        enableSlices="x"
        legends={[{ anchor: 'bottom-right', direction: 'column', translateX: 100, itemWidth: 80, itemHeight: 20 }]}
      />
    </div>
  )
}

createRoot(getContainer()).render(<Chart />)
