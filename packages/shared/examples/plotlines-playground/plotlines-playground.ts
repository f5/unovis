import { Axis, Line, Plotline, LabelOverflow, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const state = {
  yValue: 6,
  yAutoPosition: true,
  yOverflow: LabelOverflow.Smart,
  xValue: 10,
  xAutoPosition: true,
  xOverflow: LabelOverflow.Smart,
}

const line = new Line<DataRecord>({ x: d => d.x, y: d => d.y })

const yBase = new Plotline<DataRecord>({
  value: 6, color: 'rgba(7, 114, 21, 1)', labelText: 'Plot line on y-axis', labelPosition: 'top-left',
})
const xBase = new Plotline<DataRecord>({
  value: 10, color: 'rgba(220, 114, 0, 1)', axis: 'x', labelOrientation: 'vertical', labelText: 'Plot line on x-axis',
})
const yExtra = new Plotline<DataRecord>({})
const xExtra = new Plotline<DataRecord>({})

const chart = new XYContainer<DataRecord>(container, {
  components: [line, yBase, xBase, yExtra, xExtra],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)

function syncExtras (): void {
  yExtra.setConfig({
    value: state.yValue,
    color: 'rgba(7, 114, 21, 1)',
    labelText: `Extra plot line on y-axis @ ${state.yValue.toFixed(1)}`,
    labelPosition: 'top-left',
    labelAutoPosition: state.yAutoPosition,
    labelOverflow: state.yOverflow,
  })
  xExtra.setConfig({
    value: state.xValue,
    color: 'rgba(220, 114, 0, 1)',
    axis: 'x',
    labelOrientation: 'vertical',
    labelText: `Extra plot line on x-axis @ ${state.xValue.toFixed(1)}`,
    labelPosition: 'top-right',
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
  getValue: () => number;
  setValue: (n: number) => void;
  getAuto: () => boolean;
  setAuto: (b: boolean) => void;
  getOverflow: () => LabelOverflow;
  setOverflow: (o: LabelOverflow) => void;
}

function buildFieldset (o: FieldsetOptions): HTMLElement {
  const fieldset = document.createElement('fieldset')
  fieldset.style.cssText = 'border:1px solid #444;border-radius:4px;padding:8px 12px;display:flex;gap:14px;align-items:center;flex-wrap:wrap'

  const legend = document.createElement('legend')
  legend.textContent = o.legend
  legend.style.cssText = 'font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;padding:0 4px'
  fieldset.append(legend)

  const valueLabel = document.createElement('label')
  const slider = document.createElement('input')
  slider.type = 'range'; slider.min = String(o.min); slider.max = String(o.max); slider.step = '0.1'; slider.value = String(o.getValue())
  const valueText = document.createElement('span')
  valueText.textContent = ` ${o.getValue().toFixed(1)}`
  valueLabel.append('value: ', slider, valueText)
  slider.addEventListener('input', () => {
    o.setValue(Number(slider.value))
    valueText.textContent = ` ${o.getValue().toFixed(1)}`
    syncExtras()
  })
  fieldset.append(valueLabel)

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
    legend: 'Plot line on y-axis (extra)',
    min: 4,
    max: 8,
    getValue: () => state.yValue,
    setValue: n => { state.yValue = n },
    getAuto: () => state.yAutoPosition,
    setAuto: b => { state.yAutoPosition = b },
    getOverflow: () => state.yOverflow,
    setOverflow: o => { state.yOverflow = o },
  }),
  buildFieldset({
    legend: 'Plot line on x-axis (extra)',
    min: 8,
    max: 12,
    getValue: () => state.xValue,
    setValue: n => { state.xValue = n },
    getAuto: () => state.xAutoPosition,
    setAuto: b => { state.xAutoPosition = b },
    getOverflow: () => state.xOverflow,
    setOverflow: o => { state.xOverflow = o },
  })
)
container.parentElement?.insertBefore(controls, container)

syncExtras()
