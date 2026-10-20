import { Graph } from '@unovis/ts'
import { nodes, links, NodeDatum, LinkDatum } from './data'
export type { NodeDatum, LinkDatum } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { query: string; layout: string; selected: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { query: '', layout: 'parallel', selected: '@unovis/ts' }
export const layoutOptions = [
  { value: 'parallel', label: 'Package roles' },
  { value: 'circular', label: 'Circular layout' },
]
export const groupOrder = ['Frameworks', 'Core', 'Dependencies']
export const nodeSpacing: [number, number] = [150, 108]
export const legend = [
  { name: 'Framework wrappers', color: 'var(--vis-color0)' },
  { name: 'TypeScript core', color: 'var(--vis-color2)' },
  { name: 'Visualization dependencies', color: 'var(--vis-color1)' },
]
export const allData = { nodes, links }
export const svgDefs = `
<symbol id="dependency-icon-angular" viewBox="0 0 256 271">
<defs>
<linearGradient id="dependency-angular-SVGpqdn3GZR" x1="25.071%" x2="96.132%" y1="90.929%" y2="55.184%">
<stop offset="0%" stop-color="#e40035"/>
<stop offset="24%" stop-color="#f60a48"/>
<stop offset="35.2%" stop-color="#f20755"/>
<stop offset="49.4%" stop-color="#dc087d"/>
<stop offset="74.5%" stop-color="#9717e7"/>
<stop offset="100%" stop-color="#6c00f5"/>
</linearGradient>
<linearGradient id="dependency-angular-SVGVcJbhdIj" x1="21.863%" x2="68.367%" y1="12.058%" y2="68.21%">
<stop offset="0%" stop-color="#ff31d9"/>
<stop offset="100%" stop-color="#ff5be1" stop-opacity="0"/>
</linearGradient>
</defs>
<path fill="url(#dependency-angular-SVGpqdn3GZR)" d="m 256 45.179 l -9.244 145.158 L 158.373 0 z m -61.217 187.697 l -66.782 38.105 l -66.784 -38.105 L 74.8 199.958 h 106.4
    z M 128.001 72.249 l 34.994 85.076 h -69.99 z M 9.149 190.337 L 0 45.179 L 97.627 0 z"/>
<path fill="url(#dependency-angular-SVGVcJbhdIj)" d="m 256 45.179 l -9.244 145.158 L 158.373 0 z m -61.217 187.697 l -66.782 38.105 l -66.784 -38.105 L 74.8 199.958 h 106.4
    z M 128.001 72.249 l 34.994 85.076 h -69.99 z M 9.149 190.337 L 0 45.179 L 97.627 0 z"/>
</symbol>
<symbol id="dependency-icon-react" viewBox="0 0 256 228">
<path fill="#00d8ff" d="M 210.483 73.824 a 172 172 0 0 0 -8.24 -2.597 c .465 -1.9 .893 -3.777 1.273 -5.621 c 6.238 -30.281 2.16 -54.676 -11.769
    -62.708 c -13.355 -7.7 -35.196 .329 -57.254 19.526 a 171 171 0 0 0 -6.375 5.848 a 156 156 0 0 0 -4.241 -3.917 C
    100.759 3.829 77.587 -4.822 63.673 3.233 C 50.33 10.957 46.379 33.89 51.995 62.588 a 171 171 0 0 0 1.892 8.48 c
    -3.28 .932 -6.445 1.924 -9.474 2.98 C 17.309 83.498 0 98.307 0 113.668 c 0 15.865 18.582 31.778 46.812 41.427 a 146
    146 0 0 0 6.921 2.165 a 168 168 0 0 0 -2.01 9.138 c -5.354 28.2 -1.173 50.591 12.134 58.266 c 13.744 7.926 36.812
    -.22 59.273 -19.855 a 146 146 0 0 0 5.342 -4.923 a 168 168 0 0 0 6.92 6.314 c 21.758 18.722 43.246 26.282 56.54
    18.586 c 13.731 -7.949 18.194 -32.003 12.4 -61.268 a 145 145 0 0 0 -1.535 -6.842 c 1.62 -.48 3.21 -.974 4.76 -1.488
    c 29.348 -9.723 48.443 -25.443 48.443 -41.52 c 0 -15.417 -17.868 -30.326 -45.517 -39.844 m -6.365 70.984 q -2.102
    .694 -4.3 1.345 c -3.24 -10.257 -7.612 -21.163 -12.963 -32.432 c 5.106 -11 9.31 -21.767 12.459 -31.957 c 2.619 .758
    5.16 1.557 7.61 2.4 c 23.69 8.156 38.14 20.213 38.14 29.504 c 0 9.896 -15.606 22.743 -40.946 31.14 m -10.514 20.834
    c 2.562 12.94 2.927 24.64 1.23 33.787 c -1.524 8.219 -4.59 13.698 -8.382 15.893 c -8.067 4.67 -25.32 -1.4 -43.927
    -17.412 a 157 157 0 0 1 -6.437 -5.87 c 7.214 -7.889 14.423 -17.06 21.459 -27.246 c 12.376 -1.098 24.068 -2.894
    34.671 -5.345 q .785 3.162 1.386 6.193 M 87.276 214.515 c -7.882 2.783 -14.16 2.863 -17.955 .675 c -8.075 -4.657
    -11.432 -22.636 -6.853 -46.752 a 157 157 0 0 1 1.869 -8.499 c 10.486 2.32 22.093 3.988 34.498 4.994 c 7.084 9.967
    14.501 19.128 21.976 27.15 a 135 135 0 0 1 -4.877 4.492 c -9.933 8.682 -19.886 14.842 -28.658 17.94 M 50.35 144.747
    c -12.483 -4.267 -22.792 -9.812 -29.858 -15.863 c -6.35 -5.437 -9.555 -10.836 -9.555 -15.216 c 0 -9.322 13.897
    -21.212 37.076 -29.293 c 2.813 -.98 5.757 -1.905 8.812 -2.773 c 3.204 10.42 7.406 21.315 12.477 32.332 c -5.137
    11.18 -9.399 22.249 -12.634 32.792 a 135 135 0 0 1 -6.318 -1.979 m 12.378 -84.26 c -4.811 -24.587 -1.616 -43.134
    6.425 -47.789 c 8.564 -4.958 27.502 2.111 47.463 19.835 a 144 144 0 0 1 3.841 3.545 c -7.438 7.987 -14.787 17.08
    -21.808 26.988 c -12.04 1.116 -23.565 2.908 -34.161 5.309 a 160 160 0 0 1 -1.76 -7.887 m 110.427 27.268 a 348 348 0
    0 0 -7.785 -12.803 c 8.168 1.033 15.994 2.404 23.343 4.08 c -2.206 7.072 -4.956 14.465 -8.193 22.045 a 381 381 0 0 0
    -7.365 -13.322 m -45.032 -43.861 c 5.044 5.465 10.096 11.566 15.065 18.186 a 322 322 0 0 0 -30.257 -.006 c 4.974
    -6.559 10.069 -12.652 15.192 -18.18 M 82.802 87.83 a 323 323 0 0 0 -7.227 13.238 c -3.184 -7.553 -5.909 -14.98
    -8.134 -22.152 c 7.304 -1.634 15.093 -2.97 23.209 -3.984 a 322 322 0 0 0 -7.848 12.897 m 8.081 65.352 c -8.385 -.936
    -16.291 -2.203 -23.593 -3.793 c 2.26 -7.3 5.045 -14.885 8.298 -22.6 a 321 321 0 0 0 7.257 13.246 c 2.594 4.48 5.28
    8.868 8.038 13.147 m 37.542 31.03 c -5.184 -5.592 -10.354 -11.779 -15.403 -18.433 c 4.902 .192 9.899 .29 14.978 .29
    c 5.218 0 10.376 -.117 15.453 -.343 c -4.985 6.774 -10.018 12.97 -15.028 18.486 m 52.198 -57.817 c 3.422 7.8 6.306
    15.345 8.596 22.52 c -7.422 1.694 -15.436 3.058 -23.88 4.071 a 382 382 0 0 0 7.859 -13.026 a 347 347 0 0 0 7.425
    -13.565 m -16.898 8.101 a 359 359 0 0 1 -12.281 19.815 a 329 329 0 0 1 -23.444 .823 c -7.967 0 -15.716 -.248 -23.178
    -.732 a 310 310 0 0 1 -12.513 -19.846 h .001 a 307 307 0 0 1 -10.923 -20.627 a 310 310 0 0 1 10.89 -20.637 l -.001
    .001 a 307 307 0 0 1 12.413 -19.761 c 7.613 -.576 15.42 -.876 23.31 -.876 H 128 c 7.926 0 15.743 .303 23.354 .883 a
    329 329 0 0 1 12.335 19.695 a 359 359 0 0 1 11.036 20.54 a 330 330 0 0 1 -11 20.722 m 22.56 -122.124 c 8.572 4.944
    11.906 24.881 6.52 51.026 q -.518 2.504 -1.15 5.09 c -10.622 -2.452 -22.155 -4.275 -34.23 -5.408 c -7.034 -10.017
    -14.323 -19.124 -21.64 -27.008 a 161 161 0 0 1 5.888 -5.4 c 18.9 -16.447 36.564 -22.941 44.612 -18.3 M 128 90.808 c
    12.625 0 22.86 10.235 22.86 22.86 s -10.235 22.86 -22.86 22.86 s -22.86 -10.235 -22.86 -22.86 s 10.235 -22.86 22.86
    -22.86"/>
</symbol>
<symbol id="dependency-icon-solid" viewBox="256 239 256 239">
<defs>
<linearGradient id="dependency-solid-SVGzqueV6fZ" x1="27.5" x2="152" y1="3" y2="63.5" gradientTransform="translate(249.56 233.12)scale(1.61006)" gradientUnits="userSpaceOnUse">
<stop offset=".1" stop-color="#76b3e1"/>
<stop offset=".3" stop-color="#dcf2fd"/>
<stop offset="1" stop-color="#76b3e1"/>
</linearGradient>
<linearGradient id="dependency-solid-SVGuCz8Ub4Y" x1="95.8" x2="74" y1="32.6" y2="105.2" gradientTransform="translate(249.56 233.12)scale(1.61006)" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#76b3e1"/>
<stop offset=".5" stop-color="#4377bb"/>
<stop offset="1" stop-color="#1f3b77"/>
</linearGradient>
<linearGradient id="dependency-solid-SVGgHpuIdPS" x1="18.4" x2="144.3" y1="64.2" y2="149.8" gradientTransform="translate(249.56 233.12)scale(1.61006)" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#315aa9"/>
<stop offset=".5" stop-color="#518ac8"/>
<stop offset="1" stop-color="#315aa9"/>
</linearGradient>
<linearGradient id="dependency-solid-SVGBIJUtckh" x1="75.2" x2="24.4" y1="74.5" y2="260.8" gradientTransform="translate(249.56 233.12)scale(1.61006)" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#4377bb"/>
<stop offset=".5" stop-color="#1a336b"/>
<stop offset="1" stop-color="#1a336b"/>
</linearGradient>
</defs>
<path fill="#76b3e1" d="M 512 289.472 s -85.333 -62.791 -151.347 -48.301 l -4.829 1.61 c -9.66 3.221 -17.711 8.05 -22.542 14.491 l -3.219 4.829
    l -24.152 41.862 l 41.863 8.051 c 17.71 11.27 40.251 16.101 61.182 11.27 l 74.063 14.491 z"/>
<path fill="url(#dependency-solid-SVGzqueV6fZ)" d="M 512 289.472 s -85.333 -62.791 -151.347 -48.301 l -4.829 1.61 c -9.66 3.221 -17.711 8.05 -22.542 14.491 l -3.219 4.829
    l -24.152 41.862 l 41.863 8.051 c 17.71 11.27 40.251 16.101 61.182 11.27 l 74.063 14.491 z" opacity=".3"/>
<path fill="#518ac8" d="m 333.282 289.472 l -6.439 1.611 c -27.371 8.05 -35.421 33.811 -20.932 56.352 c 16.101 20.931 49.913 32.201 77.284
    24.151 l 99.824 -33.811 s -85.334 -62.792 -149.737 -48.303"/>
<path fill="url(#dependency-solid-SVGuCz8Ub4Y)" d="m 333.282 289.472 l -6.439 1.611 c -27.371 8.05 -35.421 33.811 -20.932 56.352 c 16.101 20.931 49.913 32.201 77.284
    24.151 l 99.824 -33.811 s -85.334 -62.792 -149.737 -48.303" opacity=".3"/>
<path fill="url(#dependency-solid-SVGgHpuIdPS)" d="M 465.308 361.925 c -18.439 -23.036 -49.008 -32.588 -77.283 -24.15 l -99.823 32.201 L 256 426.328 l 180.327 30.592 l
    32.201 -57.963 c 6.441 -11.271 4.831 -24.15 -3.22 -37.032"/>
<path fill="url(#dependency-solid-SVGBIJUtckh)" d="M 433.106 418.277 c -18.439 -23.036 -49.006 -32.588 -77.282 -24.15 L 256 426.328 s 85.333 64.402 151.346 48.303 l 4.83
    -1.612 c 27.371 -8.049 37.031 -33.81 20.93 -54.742"/>
</symbol>
<symbol id="dependency-icon-svelte" viewBox="0 0 256 308">
<path fill="#ff3e00" d="M 239.682 40.707 C 211.113 -.182 154.69 -12.301 113.895 13.69 L 42.247 59.356 a 82.2 82.2 0 0 0 -37.135 55.056 a 86.57
    86.57 0 0 0 8.536 55.576 a 82.4 82.4 0 0 0 -12.296 30.719 a 87.6 87.6 0 0 0 14.964 66.244 c 28.574 40.893 84.997
    53.007 125.787 27.016 l 71.648 -45.664 a 82.18 82.18 0 0 0 37.135 -55.057 a 86.6 86.6 0 0 0 -8.53 -55.577 a 82.4
    82.4 0 0 0 12.29 -30.718 a 87.57 87.57 0 0 0 -14.963 -66.244"/>
<path fill="#fff" d="M 106.889 270.841 c -23.102 6.007 -47.497 -3.036 -61.103 -22.648 a 52.7 52.7 0 0 1 -9.003 -39.85 a 50 50 0 0 1 1.713
    -6.693 l 1.35 -4.115 l 3.671 2.697 a 92.5 92.5 0 0 0 28.036 14.007 l 2.663 .808 l -.245 2.659 a 16.07 16.07 0 0 0
    2.89 10.656 a 17.14 17.14 0 0 0 18.397 6.828 a 15.8 15.8 0 0 0 4.403 -1.935 l 71.67 -45.672 a 14.92 14.92 0 0 0
    6.734 -9.977 a 15.92 15.92 0 0 0 -2.713 -12.011 a 17.16 17.16 0 0 0 -18.404 -6.832 a 15.8 15.8 0 0 0 -4.396 1.933 l
    -27.35 17.434 a 52.3 52.3 0 0 1 -14.553 6.391 c -23.101 6.007 -47.497 -3.036 -61.101 -22.649 a 52.68 52.68 0 0 1
    -9.004 -39.849 a 49.43 49.43 0 0 1 22.34 -33.114 l 71.664 -45.677 a 52.2 52.2 0 0 1 14.563 -6.398 c 23.101 -6.007
    47.497 3.036 61.101 22.648 a 52.7 52.7 0 0 1 9.004 39.85 a 51 51 0 0 1 -1.713 6.692 l -1.35 4.116 l -3.67 -2.693 a
    92.4 92.4 0 0 0 -28.037 -14.013 l -2.664 -.809 l .246 -2.658 a 16.1 16.1 0 0 0 -2.89 -10.656 a 17.14 17.14 0 0 0
    -18.398 -6.828 a 15.8 15.8 0 0 0 -4.402 1.935 l -71.67 45.674 a 14.9 14.9 0 0 0 -6.73 9.975 a 15.9 15.9 0 0 0 2.709
    12.012 a 17.16 17.16 0 0 0 18.404 6.832 a 15.8 15.8 0 0 0 4.402 -1.935 l 27.345 -17.427 a 52.2 52.2 0 0 1 14.552
    -6.397 c 23.101 -6.006 47.497 3.037 61.102 22.65 a 52.68 52.68 0 0 1 9.003 39.848 a 49.45 49.45 0 0 1 -22.34 33.12 l
    -71.664 45.673 a 52.2 52.2 0 0 1 -14.563 6.398"/>
</symbol>
<symbol id="dependency-icon-vue" viewBox="0 0 256 221">
<path fill="#41b883" d="M 204.8 0 H 256 L 128 220.8 L 0 0 h 97.92 L 128 51.2 L 157.44 0 z"/>
<path fill="#41b883" d="m 0 0 l 128 220.8 L 256 0 h -51.2 L 128 132.48 L 50.56 0 z"/>
<path fill="#35495e" d="M 50.56 0 L 128 133.12 L 204.8 0 h -47.36 L 128 51.2 L 97.92 0 z"/>
</symbol>
<symbol id="dependency-icon-unovis" viewBox="0 0 200 200">

    <style>
      #dependency-icon-unovis circle { fill: rgb(23,19,41); }
      #dependency-icon-unovis rect { fill: rgb(226,32,58); }

      @media (prefers-color-scheme: dark) {
        #dependency-icon-unovis circle { fill: rgb(255,214,81); }
        #dependency-icon-unovis rect { fill: rgb(226,32,58); }
      }
    </style>
    <g transform="matrix(1,0,0,1,-752.84,0)">
        <g id="dependency-unovis-Artboard2" transform="matrix(0.332226,0,0,0.332226,794.701,-953.821)">
            <rect x="-126" y="2871" width="602" height="602" style="fill:none;"/>
            <clipPath id="dependency-unovis-_clip1">
                <rect x="-126" y="2871" width="602" height="602"/>
            </clipPath>
            <g clip-path="url(#dependency-unovis-_clip1)">
                <g transform="matrix(7.15946,0,0,7.15946,-19294.4,-9455.96)">
                    <g transform="matrix(0.258016,0,0,0.258016,2616.12,1582.49)">
                        <circle cx="400.25" cy="702.75" r="140.25" />
                    </g>
                    <g transform="matrix(0.0882592,-0.0882592,0.188783,0.188783,2475.91,1665.78)">
                        <rect x="430" y="866" width="788" height="77" />
                    </g>
                </g>
            </g>
        </g>
    </g>

</symbol>
<symbol id="dependency-icon-package" viewBox="0 0 24 24">
  <path d="M 12 2 3 7 v 10 l 9 5 9 -5 V 7 Z M 3 7 l 9 5 9 -5 M 12 12 v 10 M 7.5 4.5 l 9 5" fill="none" stroke="var(--gallery-ink)" stroke-width="1.6" stroke-linejoin="round"/>
</symbol>
`
export const nodeIcon = (d: NodeDatum): string => d.group === 'Dependencies'
  ? '#dependency-icon-package'
  : `#dependency-icon-${d.group === 'Core' ? 'unovis' : d.id.split('/')[1]}`
export const nodeLabel = (d: NodeDatum): string => d.id
export const nodeSubLabel = (d: NodeDatum): string => d.version
export const nodeFill = (d: NodeDatum): string =>
  d.group === 'Core' ? 'var(--vis-color2)' : d.group === 'Frameworks' ? 'var(--vis-color0)' : 'var(--vis-color1)'
export const tooltipTriggers = {
  [Graph.selectors.node]: (d: NodeDatum): string => `<b>${d.id}</b><br/>Declared version / range: ${d.version}<br/>${d.group}`,
}
export function getView (
  state: ExampleState,
  update: UpdateState
): { data: { nodes: NodeDatum[]; links: LinkDatum[] }; events: Record<string, Record<string, (d: NodeDatum) => void>>; summary: string } {
  const matches = new Set(nodes.filter(d => d.id.toLowerCase().includes(state.query.toLowerCase())).map(d => d.id))
  const selectedLinks = state.query ? links.filter(d => matches.has(d.source) || matches.has(d.target)) : links
  const ids = new Set([...matches, ...selectedLinks.flatMap(d => [d.source, d.target])])
  const selectedNodes = nodes.filter(d => ids.has(d.id))
  return {
    data: state.query ? { nodes: selectedNodes, links: selectedLinks } : allData,
    events: {
      [Graph.selectors.node]: { click: (d): void => update({ selected: state.selected === d.id ? '' : d.id }) },
      [Graph.selectors.background]: { click: (): void => update({ selected: '' }) },
    },
    summary: `${selectedNodes.length} packages · ${selectedLinks.length} direct dependency edges${state.selected ? ` · selected: ${state.selected}` : ' · click a package to highlight its connections'}`,
  }
}
