import { Axis, Line, Plotband, LabelOverflow, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const state = {
  yFrom: 2,
  yTo: 4,
  yAutoPosition: true,
  yOverflow: LabelOverflow.Smart,
  xFrom: 7,
  xTo: 9,
  xAutoPosition: true,
  xOverflow: LabelOverflow.Smart,
}

const line = new Line<DataRecord>({ x: d => d.x, y: d => d.y })

const xBase = new Plotband<DataRecord>({
  from: 4, to: 6, labelText: 'Plot band on x-axis', axis: 'x', labelPosition: 'top-inside',
})
const yBase = new Plotband<DataRecord>({
  from: 1, to: 3, color: 'rgba(34, 99, 182, 0.3)', labelText: 'Plot band on y-axis', labelPosition: 'left-inside',
})
const yExtra = new Plotband<DataRecord>({})
const xExtra = new Plotband<DataRecord>({})

const chart = new XYContainer<DataRecord>(container, {
  components: [line, xBase, yBase, yExtra, xExtra],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)

function syncExtras (): void {
  yExtra.setConfig({
    from: state.yFrom,
    to: state.yTo,
    color: 'rgba(255, 165, 0, 0.3)',
    labelText: `Extra plot band on y-axis @ ${state.yFrom.toFixed(1)} – ${state.yTo.toFixed(1)}`,
    labelPosition: 'left-inside',
    labelAutoPosition: state.yAutoPosition,
    labelOverflow: state.yOverflow,
  })
  xExtra.setConfig({
    from: state.xFrom,
    to: state.xTo,
    axis: 'x',
    color: 'rgba(220, 114, 0, 0.3)',
    labelText: `Extra plot band on x-axis @ ${state.xFrom.toFixed(1)} – ${state.xTo.toFixed(1)}`,
    labelPosition: 'top-inside',
    labelAutoPosition: state.xAutoPosition,
    labelOverflow: state.xOverflow,
  })
  chart.render()
}

/* ---- Interactive toolbar (vanilla DOM) ---- */
type FieldsetOptions = {
  legend: string;
  min: number;
  max: number;
  getFrom: () => number;
  setFrom: (n: number) => void;
  getTo: () => number;
  setTo: (n: number) => void;
  getAuto: () => boolean;
  setAuto: (b: boolean) => void;
  getOverflow: () => LabelOverflow;
  setOverflow: (o: LabelOverflow) => void;
}

function buildRange (labelText: string, min: number, max: number, get: () => number, set: (n: number) => void): HTMLElement {
  const label = document.createElement('label')
  const slider = document.createElement('input')
  slider.type = 'range'; slider.min = String(min); slider.max = String(max); slider.step = '0.1'; slider.value = String(get())
  const text = document.createElement('span')
  text.textContent = ` ${get().toFixed(1)}`
  label.append(`${labelText}: `, slider, text)
  slider.addEventListener('input', () => {
    set(Number(slider.value))
    text.textContent = ` ${get().toFixed(1)}`
    syncExtras()
  })
  return label
}

function buildFieldset (o: FieldsetOptions): HTMLElement {
  const fieldset = document.createElement('fieldset')
  fieldset.style.cssText = 'border:1px solid #444;border-radius:4px;padding:8px 12px;display:flex;gap:14px;align-items:center;flex-wrap:wrap'

  const legend = document.createElement('legend')
  legend.textContent = o.legend
  legend.style.cssText = 'font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;padding:0 4px'
  fieldset.append(legend)

  fieldset.append(buildRange('from', o.min, o.max, o.getFrom, o.setFrom))
  fieldset.append(buildRange('to', o.min, o.max, o.getTo, o.setTo))

  const autoLabel = document.createElement('label')
  const auto = document.createElement('input')
  auto.type = 'checkbox'; auto.checked = o.getAuto()
  autoLabel.append(auto, ' labelAutoPosition')
  fieldset.append(autoLabel)

  const overflowLabel = document.createElement('label')
  const select = document.createElement('select')
  for (const v of [LabelOverflow.Smart, LabelOverflow.Hide, LabelOverflow.Stack]) {
    const opt = document.createElement('option')
    opt.value = v; opt.textContent = v
    select.append(opt)
  }
  select.value = o.getOverflow()
  select.disabled = !o.getAuto()
  overflowLabel.style.opacity = o.getAuto() ? '1' : '0.4'
  overflowLabel.append('labelOverflow: ', select)
  fieldset.append(overflowLabel)

  auto.addEventListener('change', () => {
    o.setAuto(auto.checked)
    select.disabled = !auto.checked
    overflowLabel.style.opacity = auto.checked ? '1' : '0.4'
    syncExtras()
  })
  select.addEventListener('change', () => {
    o.setOverflow(select.value as LabelOverflow)
    syncExtras()
  })

  return fieldset
}

const controls = document.createElement('div')
controls.style.cssText = 'margin-bottom:12px;display:flex;gap:20px;flex-wrap:wrap'
controls.append(
  buildFieldset({
    legend: 'Plot band on y-axis (extra)',
    min: 0,
    max: 9,
    getFrom: () => state.yFrom,
    setFrom: n => { state.yFrom = n },
    getTo: () => state.yTo,
    setTo: n => { state.yTo = n },
    getAuto: () => state.yAutoPosition,
    setAuto: b => { state.yAutoPosition = b },
    getOverflow: () => state.yOverflow,
    setOverflow: o => { state.yOverflow = o },
  }),
  buildFieldset({
    legend: 'Plot band on x-axis (extra)',
    min: 0,
    max: 14,
    getFrom: () => state.xFrom,
    setFrom: n => { state.xFrom = n },
    getTo: () => state.xTo,
    setTo: n => { state.xTo = n },
    getAuto: () => state.xAutoPosition,
    setAuto: b => { state.xAutoPosition = b },
    getOverflow: () => state.xOverflow,
    setOverflow: o => { state.xOverflow = o },
  })
)
container.parentElement?.insertBefore(controls, container)

syncExtras()
