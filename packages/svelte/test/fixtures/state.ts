export interface Datum {
  x: number;
  y: number;
}

export interface State {
  childData: Datum[];
  containerData: Datum[];
  singleData: Datum[];
  color: string;
  lineWidth: number;
  height: number;
  axisType: 'x' | 'y';
  showLine: boolean;
  showAxis: boolean;
  showDonut: boolean;
  showCharts: boolean;
  legendItems: { name: string; color: string }[];
}

export function createState (): State {
  return {
    childData: [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 1 }],
    containerData: [{ x: 0, y: 1 }, { x: 1, y: 4 }, { x: 2, y: 2 }],
    singleData: [{ x: 0, y: 1 }, { x: 1, y: 2 }],
    color: '#ff0000',
    lineWidth: 2,
    height: 200,
    axisType: 'x',
    showLine: true,
    showAxis: true,
    showDonut: true,
    showCharts: true,
    legendItems: [{ name: 'Before', color: '#ff0000' }],
  }
}

export function updateState (state: ReturnType<typeof createState>, action: string): void {
  switch (action) {
    case 'replace-child':
      state.childData = [{ x: 0, y: 3 }, { x: 1, y: 1 }, { x: 2, y: 4 }]
      break
    case 'mutate-child':
      state.childData[1].y = 7
      break
    case 'replace-container':
      state.containerData = [{ x: 0, y: 4 }, { x: 1, y: 1 }, { x: 2, y: 3 }]
      break
    case 'mutate-container':
      state.containerData[1].y = 8
      break
    case 'replace-single':
      state.singleData = [{ x: 0, y: 5 }, { x: 1, y: 1 }]
      break
    case 'clear-data':
      state.childData = []
      state.containerData = []
      state.singleData = []
      break
    case 'config':
      state.color = '#0000ff'
      state.lineWidth = 5
      state.height = 300
      state.legendItems = [{ name: 'After', color: '#0000ff' }]
      break
    case 'toggle-child':
      state.showLine = !state.showLine
      break
    case 'mutate-legend':
      state.legendItems[0].name = 'Mutated'
      break
    case 'toggle-axis':
      state.showAxis = !state.showAxis
      break
    case 'axis-type':
      state.axisType = state.axisType === 'x' ? 'y' : 'x'
      break
    case 'toggle-donut':
      state.showDonut = !state.showDonut
      break
    case 'toggle-charts':
      state.showCharts = !state.showCharts
      break
  }
}
