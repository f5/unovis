import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const { execSync } = require('child_process')

const [major] = process.versions.node.split('.').map(Number)
if (major > 16) {
  execSync('NODE_OPTIONS="--openssl-legacy-provider" ng serve gallery', { stdio: 'inherit' })
} else {
  execSync('ng serve gallery', { stdio: 'inherit' })
}

