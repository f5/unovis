import type { AngularComponentInput, ReactComponentInput, SvelteComponentInput } from './types'

export function getComponentList (
  coreComponentConfigPath = '/core/component',
  xyComponentConfigPath = '/core/xy-component'
): (AngularComponentInput | ReactComponentInput | SvelteComponentInput)[] {
  return [
    // XY Components
    { name: 'Line', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/line'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'Area', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/area'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'Axis', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/axis'], dataType: 'Datum[]', angularProvide: 'VisXYComponent', elementSuffix: 'axis' },
    { name: 'Brush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/brush'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'FreeBrush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/free-brush'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'Crosshair', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/crosshair'], dataType: 'Datum[]', angularProvide: 'VisXYComponent', elementSuffix: 'crosshair' },
    { name: 'GroupedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/grouped-bar'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'Scatter', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/scatter'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'StackedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/stacked-bar'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'Timeline', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/timeline'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
    { name: 'XYLabels', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/xy-labels'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },

    // Single components
    { name: 'Donut', sources: [coreComponentConfigPath, '/components/donut'], dataType: 'Datum[]', angularProvide: 'VisCoreComponent' },
    { name: 'TopoJSONMap', kebabCaseName: 'topojson-map', sources: [coreComponentConfigPath, '/components/topojson-map'], dataType: '{areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]}', angularProvide: 'VisCoreComponent' },
    { name: 'Sankey', sources: [coreComponentConfigPath, '/components/sankey'], dataType: '{ nodes: N[]; links?: L[] }', angularProvide: 'VisCoreComponent' },
    { name: 'Graph', sources: [coreComponentConfigPath, '/components/graph'], dataType: '{ nodes: N[]; links?: L[] }', angularProvide: 'VisCoreComponent' },
    { name: 'ChordDiagram', sources: [coreComponentConfigPath, '/components/chord-diagram'], dataType: '{ nodes: N[]; links?: L[] }', angularProvide: 'VisCoreComponent' },
    { name: 'NestedDonut', sources: [coreComponentConfigPath, '/components/nested-donut'], dataType: 'Datum[]', angularProvide: 'VisCoreComponent' },

    // Ancillary components
    { name: 'Tooltip', sources: ['/components/tooltip'], dataType: null, angularProvide: 'VisGenericComponent', elementSuffix: 'tooltip' },
    { name: 'Annotations', sources: ['/components/annotations'], dataType: 'Datum[]', elementSuffix: 'annotations', angularProvide: 'VisXYComponent' },

    // Unique cases (you can still generate a wrapper for these components, but most likely it will require some changes)
    // { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], dataType: 'Datum[]', angularProvide: 'VisCoreComponent', svelteStyles: ['display:block', 'position:relative'] },
    // { name: 'LeafletFlowMap', sources: [coreComponentConfigPath, '/components/leaflet-map', '/components/leaflet-flow-map'], dataType: '{ points: PointDatum[]; flows?: FlowDatum[] }', svelteStyles: ['display:block', 'position:relative'] },
    // { name: 'BulletLegend', sources: ['/components/bullet-legend'], dataType: null,  angularProvide: 'VisGenericComponent', svelteStyles: ['display:block'] },
  ]
}
