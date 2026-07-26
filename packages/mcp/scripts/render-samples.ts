/* Superseded by render-samples.mjs, which runs against the built dist under
 * plain node — the tsx loader hangs on dynamic imports inside @unovis/ts
 * graph layouts. Kept as a pointer so a stale invocation fails loudly. */
console.error('This entry moved: run `pnpm samples` (builds, then runs scripts/render-samples.mjs)')
process.exit(1)
