#!/usr/bin/env bash
# Reproduces every number in RESULTS.md.
#   1. installs each library in its OWN npm project (libs/<library>/, exact versions from the committed
#      package-lock.json) so no library can change another one's dependency resolution or hoisting
#   2. packs the repository build of @unovis/ts and @unovis/react (run `pnpm build:ts && pnpm build:react` first)
#      into libs/unovis-local/ and installs it there, the way `npm install` would install the published packages
#   3. bundles one entry file per library/variant with esbuild (flags below)
#   4. measures minified / gzip -9 / brotli-11 size and analyses each esbuild metafile (analyze.mjs)
# Output: dist/<id>.js, dist/<id>.meta.json, dist/report.md, dist/sizes.json
# Optional overrides: TARGET=es2022 OUT=dist-es2022 ./measure.sh
set -euo pipefail
cd "$(dirname "$0")"

[ -d node_modules ] || npm ci --no-audit --no-fund   # tooling only (esbuild)
for lib in unovis recharts chartjs echarts agcharts nivo react; do
  [ -d "libs/$lib/node_modules" ] || (cd "libs/$lib" && npm ci --no-audit --no-fund)
done

# The Unovis rows measure the repository build: the same tarballs `pnpm publish:ts` / `publish:react` would publish,
# installed with npm so their dependencies resolve the way they do for an app. The published package is a reference row.
REPO_ROOT=$(cd ../../../.. && pwd)
for pkg in ts react; do
  [ -f "$REPO_ROOT/packages/$pkg/dist/package.json" ] || { echo "packages/$pkg/dist is missing: run pnpm build:$pkg first" >&2; exit 1; }
  (cd "$REPO_ROOT/packages/$pkg/dist" && npm pack --silent --pack-destination "$OLDPWD/libs/unovis-local" > /dev/null)
  mv libs/unovis-local/unovis-$pkg-*.tgz "libs/unovis-local/unovis-$pkg.tgz"
done
UNOVIS_LOCAL="Unovis $(node -p "require('$REPO_ROOT/packages/ts/dist/package.json').version") (repository build, $(git -C "$REPO_ROOT" rev-parse --short HEAD))"
UNOVIS_NPM="Unovis $(node -p "require('./libs/unovis/node_modules/@unovis/ts/package.json').version") (published package)"
(cd libs/unovis-local && npm install --no-audit --no-fund --no-package-lock --silent)
cp libs/unovis/unovis-react.jsx libs/unovis/unovis-ts.js libs/unovis-local/

ESBUILD=./node_modules/.bin/esbuild
TARGET=${TARGET:-es2020}
OUT=${OUT:-dist}
mkdir -p "$OUT"
: > "$OUT/variants.tsv"

COMMON=(--bundle --minify --format=esm --platform=browser "--target=$TARGET" '--define:process.env.NODE_ENV="production"' --log-level=warning)
# React itself is excluded from every React bundle: every React app already ships it.
# (esbuild treats --external:react-dom as also covering react-dom/client.)
REACT_EXTERNALS=(--external:react --external:react-dom --external:react/jsx-runtime --jsx=automatic)

# build <id> <group> <library> <variant> <entry> [extra esbuild flags...]
build () {
  local id=$1 group=$2 library=$3 variant=$4 entry=$5
  shift 5
  "$ESBUILD" "$entry" "${COMMON[@]}" "$@" --metafile="$OUT/$id.meta.json" --outfile="$OUT/$id.js"
  printf '%s\t%s\t%s\t%s\t%s\n' "$id" "$group" "$library" "$variant" "$entry" >> "$OUT/variants.tsv"
}

echo "esbuild $("$ESBUILD" --version), target $TARGET, node $(node --version), npm $(npm --version)"

# React variants (react, react-dom, react/jsx-runtime external)
build unovis-react   "React" "$UNOVIS_LOCAL"                                       "@unovis/react"                           libs/unovis-local/unovis-react.jsx "${REACT_EXTERNALS[@]}"
build recharts       "React" "Recharts 3.10.1"                                     "recharts"                                libs/recharts/recharts.jsx       "${REACT_EXTERNALS[@]}"
build chartjs-react  "React" "Chart.js 4.5.1 + react-chartjs-2 5.3.1"              "react-chartjs-2, tree-shaken"            libs/chartjs/chartjs-react.jsx   "${REACT_EXTERNALS[@]}"
build echarts-react  "React" "ECharts 6.1.0 + echarts-for-react 3.0.6"             "echarts-for-react/lib/core, tree-shaken" libs/echarts/echarts-react.jsx   "${REACT_EXTERNALS[@]}"
build agcharts-react "React" "AG Charts Community 14.2.0 + ag-charts-react 14.2.0" "ag-charts-react, selected modules"       libs/agcharts/agcharts-react.jsx "${REACT_EXTERNALS[@]}"
build nivo           "React" "Nivo 0.99.0"                                         "@nivo/line ResponsiveLine"               libs/nivo/nivo.jsx               "${REACT_EXTERNALS[@]}"

# Vanilla variants (no React)
build unovis-ts      "Vanilla" "$UNOVIS_LOCAL"              "@unovis/ts"                        libs/unovis-local/unovis-ts.js
build chartjs        "Vanilla" "Chart.js 4.5.1"             "chart.js, tree-shaken"             libs/chartjs/chartjs.js
build echarts        "Vanilla" "ECharts 6.1.0"              "echarts/core, tree-shaken"         libs/echarts/echarts.js
build agcharts       "Vanilla" "AG Charts Community 14.2.0" "AgCharts.create, selected modules" libs/agcharts/agcharts.js

# Reference builds (same chart, not part of the comparison): the libraries' non-tree-shaken entry
# points, used to check that tree-shaking actually happened, and echarts-for-react's ESM build.
build chartjs-auto      "Reference" "Chart.js 4.5.1"                          "chart.js/auto (everything registered)"   libs/chartjs/chartjs-auto.js
build echarts-full      "Reference" "ECharts 6.1.0"                           "full echarts import"                     libs/echarts/echarts-full.js
build agcharts-all      "Reference" "AG Charts Community 14.2.0"              "AllCommunityModule registered"           libs/agcharts/agcharts-all.js
build echarts-react-esm "Reference" "ECharts 6.1.0 + echarts-for-react 3.0.6" "echarts-for-react/esm/core, tree-shaken" libs/echarts/echarts-react-esm-core.jsx "${REACT_EXTERNALS[@]}"
build unovis-react-npm  "Reference" "$UNOVIS_NPM"                             "@unovis/react, as published on npm"      libs/unovis/unovis-react.jsx            "${REACT_EXTERNALS[@]}"
build unovis-ts-npm     "Reference" "$UNOVIS_NPM"                             "@unovis/ts, as published on npm"         libs/unovis/unovis-ts.js

# Context builds (not charts): React itself, and an AG Charts import that uses nothing but ModuleRegistry.
build react-baseline         "Context" "React 18.3.1 + ReactDOM 18.3.1" "react + react-dom/client + jsx-runtime (the part excluded from the React rows)" libs/react/react-baseline.jsx --jsx=automatic
build agcharts-registry-only "Context" "AG Charts Community 14.2.0"     "import { ModuleRegistry } only, no modules, no chart"                         libs/agcharts/agcharts-registry-only.js

node analyze.mjs "$OUT"
