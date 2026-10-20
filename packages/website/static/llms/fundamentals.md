# Unovis library fundamentals

[Discovery index](../llms.txt) · [Framework examples](frameworks.md) · [Generated API index](api/index.md)

## Select packages

| Environment | Install | Import visualization components from |
| --- | --- | --- |
| TypeScript / JavaScript | `@unovis/ts` | `@unovis/ts` |
| React | `@unovis/ts @unovis/react` | `@unovis/react` |
| Angular | `@unovis/ts @unovis/angular` | `@unovis/angular` |
| Svelte | `@unovis/ts @unovis/svelte` | `@unovis/svelte` |
| Vue | `@unovis/ts @unovis/vue` | `@unovis/vue` |
| Solid | `@unovis/ts @unovis/solid` | `@unovis/solid` |

Use compatible package versions. The core supplies types, enums such as `CurveType`, utilities, and imperative component classes. Declarative wrappers export `Vis`-prefixed components; Angular also exports modules such as `VisLineModule`. Unovis uses ES modules and supports plain JavaScript with the TypeScript annotations removed. Enable `allowSyntheticDefaultImports` for TypeScript as described in the installation docs.

For browser charts, create imperative instances after the DOM host exists and destroy them on unmount. In server-rendered applications, mount browser visualizations on the client. For charts rendered in Node, use [MCP / programmatic rendering](../docs/mcp/programmatic.md) and `@unovis/ssr` instead of assuming browser constructors run without a DOM.

## Choose a container

| Use | Container | Examples |
| --- | --- | --- |
| Cartesian plots with synchronized scales | `XYContainer` / `VisXYContainer` | Line, Area, Scatter, GroupedBar, StackedBar, Boxplot, Timeline |
| One non-Cartesian visualization | `SingleContainer` / `VisSingleContainer` | Donut, NestedDonut, RadialBar, Graph, Sankey, ChordDiagram, Treemap, Heatmap, TopoJSONMap |
| Standalone maps and legends | No visualization container | LeafletMap, LeafletFlowMap, BulletLegend, FlowLegend, RollingPinLegend |

An XY container can combine several plot components, axes, a crosshair, plotlines, plotbands, brushes, and a tooltip. In declarative integrations, compose children. In vanilla TypeScript, supply instances through `components`, `xAxis`, `yAxis`, `crosshair`, and other documented container properties. A SingleContainer receives one main component through `component` in core TypeScript, or as a child in wrappers.

Give the chart a measurable parent width and an explicit container height when its parent does not establish one. Set `duration` in milliseconds for transitions; `0` disables them. Read [XYContainer](api/XYContainer.md) and [SingleContainer](api/SingleContainer.md) for precise sizing and margin properties. Keep titles and explanatory prose outside the chart implementation when embedding it in an existing page.

## Define records and accessors

Core APIs accept accessors such as `x: d => d.time`, `y: d => d.value`, and constants such as `size: 6` or `color: '#1374ef'`. A property typed as an accessor may accept a callback or a constant; read its exact type and description.

```ts
type Observation = { time: number; actual: number; forecast: number }
const x = (d: Observation): number => d.time
const y = [
  (d: Observation): number => d.actual,
  (d: Observation): number => d.forecast,
]
```

Numeric X and Y accessors are not field-name strings: use `x={d => d.time}` in a framework chart, not `x="time"`. A Line or Area can take an array of Y accessors for multiple series. Callback semantics vary: `Line.color` receives the whole data array, while `Scatter.color` receives an individual datum. Graph callbacks can receive layout-enriched nodes and links. Inspect the relevant property description instead of assuming every accessor receives the same object.

Keep records ordered along X for line charts. Preserve missing observations deliberately; `Line.fallbackValue` and `interpolateMissingData` control gaps. Do not silently replace missing data with zero. For time coordinates, use timestamps or another numeric representation expected by the chosen scale and format axis labels separately.

## Bind data

Most XY plots take record arrays. Bind shared records on the container, or leave the shared binding unset and supply separate data to each plot when combining datasets. Do not rely on a component's `data` overriding a container binding across every framework; consult its wrapper example.

Network components such as Graph and Sankey use `{ nodes, links }`; the node identifiers and link endpoints must follow that component's reference. TopoJSONMap and LeafletFlowMap have different shapes; they are not interchangeable with a generic array. Treemap hierarchy accessors and NestedDonut layers also have distinct contracts. Data shapes are listed in the generated [API index](api/index.md) entries and their linked types.

In vanilla TypeScript, constructor configuration and data are separate arguments:

```ts
const chart = new XYContainer<Observation>(host, {
  height: 320,
  components: [new Line<Observation>({ x, y })],
  xAxis: new Axis<Observation>({ type: 'x' }),
  yAxis: new Axis<Observation>({ type: 'y' }),
}, observations)

chart.setData(updatedObservations)
// On unmount:
chart.destroy()
```

Import these classes from `@unovis/ts`; `host` is an existing HTML element, and both record arrays use the declared `Observation` type. For a standalone component or a component with separate data, use its documented `setData` and rendering lifecycle.

## Choose valid configuration

1. Read [framework bindings](frameworks.md) for syntax and component composition.
2. Open the [component API reference](api/index.md) for property names, required properties, callback signatures, and documented defaults. Follow linked types for enum values and nested options.
3. Import supported enums from `@unovis/ts`, for example `CurveType.Linear`. Do not guess enum names or borrow property names from another chart library.
4. Keep scale domains, axis options, plot options, and tooltip configuration on their documented owners. For example, `xDomain` belongs on the XY container, `curveType` on Line, and `label` on Axis for an axis title.
5. Update reactive data/configuration in framework wrappers. Keep memoized callback references stable when appropriate, and keep graph/node IDs stable across filters for meaningful transitions. Avoid remounting a chart on every filter change when transitions are desired.
6. Use `--vis-*` CSS variables for documented visual styling. The documented dark-theme convention is `body.theme-dark`; consult the installed library's theme selectors when integrating a website theme. See the [theming guide](https://unovis.dev/docs/guides/theming).
7. Type-check against the installed package version and render the chart in its actual layout. Check empty data, missing values, resizing, and the chosen interactions.

## Tool inputs and core configuration are different

`generate_line_chart` can take `x: "month"` and `y: ["sales", "cost"]` because its recipe converts field names into a chart spec. Browser-library components take typed functions or constants. Likewise, an MCP option such as `outputType` is not a `VisLine` property. Read [the MCP workflow](mcp.md) when generating a chart through a tool.
