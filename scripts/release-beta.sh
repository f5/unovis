#!/usr/bin/env bash
set -euo pipefail

: "${BETA_VERSION:?BETA_VERSION is required}"
if [[ ! "$BETA_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+-beta\.[0-9]+\.g[0-9a-f]{12}$ ]]; then
  echo "Invalid beta version: $BETA_VERSION" >&2
  exit 1
fi

root=$(pwd)
packages=(ts angular react svelte vue solid ssr mcp)

case "${1:-}" in
  pack)
    mkdir -p beta-packages
    for package in "${packages[@]}"; do
      directory="packages/$package"
      case "$package" in
        ts|react|svelte|vue|solid)
          (cd "$directory/dist" && npm pack --ignore-scripts --pack-destination "$root/beta-packages")
          ;;
        *)
          (cd "$directory" && pnpm pack --pack-destination "$root/beta-packages")
          ;;
      esac
    done
    ;;
  publish)
    for package in "${packages[@]}"; do
      tarball="beta-packages/unovis-$package-$BETA_VERSION.tgz"
      manifest=$(tar -xOf "$tarball" package/package.json)
      node - "$manifest" "@unovis/$package" "${packages[@]/#/@unovis/}" <<'NODE'
const pkg = JSON.parse(process.argv[2])
if (pkg.name !== process.argv[3] || pkg.version !== process.env.BETA_VERSION) {
  throw new Error('Unexpected package name or version')
}
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const [name, version] of Object.entries(pkg[field] || {})) {
    if (version.startsWith('workspace:') || version.startsWith('catalog:')) {
      throw new Error(`Unresolved dependency: ${name}@${version}`)
    }
    if (process.argv.slice(4).includes(name) && version !== process.env.BETA_VERSION) {
      throw new Error(`Mismatched beta dependency: ${name}@${version}`)
    }
  }
}
NODE
    done
    for package in "${packages[@]}"; do
      tarball="beta-packages/unovis-$package-$BETA_VERSION.tgz"
      metadata=$(mktemp)
      status=$(curl --silent --show-error --retry 3 --output "$metadata" --write-out '%{http_code}' \
        "https://registry.npmjs.org/@unovis%2f$package/$BETA_VERSION")
      case "$status" in
        200)
          node - "$metadata" "$tarball" <<'NODE'
const fs = require('node:fs')
const crypto = require('node:crypto')
const metadata = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const integrity = `sha512-${crypto.createHash('sha512').update(fs.readFileSync(process.argv[3])).digest('base64')}`
if (metadata.dist.integrity !== integrity) throw new Error('Published tarball differs from this artifact')
NODE
          ;;
        404)
          npm publish "./$tarball" --tag beta --access public --ignore-scripts
          ;;
        *)
          echo "Registry returned HTTP $status for @unovis/$package@$BETA_VERSION" >&2
          exit 1
          ;;
      esac
      rm "$metadata"
    done
    for package in "${packages[@]}"; do
      npm dist-tag add "@unovis/$package@$BETA_VERSION" beta
    done
    printf 'Published `%s` from commit `%s` under `beta`.\n' "$BETA_VERSION" "$GITHUB_SHA" >> "$GITHUB_STEP_SUMMARY"
    ;;
  *)
    echo 'Usage: bash scripts/release-beta.sh pack|publish' >&2
    exit 1
    ;;
esac
