import { defineConfig } from 'bumpp'

export default defineConfig({
  commit: 'Release: %s',
  tag: '%s',
  all: true,
  printCommits: false,
  ignoreScripts: true,
  recursive: true,
  execute: 'sh update-peerDependencies.sh',
})
