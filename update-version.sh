echo Enter new version:
read -r new_version

# Allow numeric versions with dots and optional prerelease/build suffix.
if ! [[ "$new_version" =~ ^[0-9]+(\.[0-9]+)*([-+][0-9A-Za-z.-]+)?$ ]]; then
	echo "Invalid version format: $new_version" >&2
	exit 1
fi

echo Updating version to $new_version

current_version=$(node -e "console.log(require('./package.json').version)")

CURRENT_VERSION="$current_version" NEW_VERSION="$new_version" node <<'NODE'
const fs = require('node:fs')
const path = require('node:path')

const currentVersion = process.env.CURRENT_VERSION
const newVersion = process.env.NEW_VERSION

const depFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
const packageFiles = ['package.json']
const packagesDir = path.join(process.cwd(), 'packages')

for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
	if (entry.isDirectory()) {
		packageFiles.push(path.join('packages', entry.name, 'package.json'))
	}
}

for (const file of packageFiles) {
	if (!fs.existsSync(file)) continue

	const content = fs.readFileSync(file, 'utf8')
	const pkg = JSON.parse(content)

	const forceVersionUpdate = file === 'packages/website/package.json' || file === 'packages/dev/package.json'
	if (forceVersionUpdate || pkg.version === currentVersion) {
		pkg.version = newVersion
	}

	for (const field of depFields) {
		const deps = pkg[field]
		if (deps && deps['@unovis/ts'] === currentVersion) {
			deps['@unovis/ts'] = newVersion
		}
	}

	fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`)
}
NODE

pnpm install --ignore-scripts
