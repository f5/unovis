#!/usr/bin/env node
/* eslint-disable */
'use strict'

/**
 * Unovis Parallel Command Runner & Live Report
 *
 * Runs all package.json scripts (except publish / update-version) in parallel
 * across configurable worker slots and serves a live, auto-updating HTML report.
 *
 * Usage:
 *   node run-commands-report.js
 *   node run-commands-report.js --port=3737 --concurrency=4 --timeout=300
 *   node run-commands-report.js --clean          # run pnpm install:clean first
 *   CLEAN_FIRST=1 node run-commands-report.js
 *   PORT=8080 CONCURRENCY=6 TIMEOUT=600 node run-commands-report.js
 */

const { spawn, execSync } = require('child_process')
const http = require('http')
const path = require('path')
const fs = require('fs')

// ─── Configuration ────────────────────────────────────────────────────────────

const parseArgs = () => {
  const r = {}
  process.argv.slice(2).forEach(a => {
    const m = a.match(/^--?([^=]+)(?:=(.+))?$/)
    if (m) r[m[1]] = m[2] !== undefined ? m[2] : true
  })
  return r
}

const argv = parseArgs()
const ROOT_DIR = path.resolve(__dirname, '..')
const PORT = parseInt(argv.port || process.env.PORT || '3737', 10)
const WORKERS = parseInt(argv.concurrency || process.env.CONCURRENCY || '10', 10)
const TIMEOUT_S = parseInt(argv.timeout || process.env.TIMEOUT || '600', 10)
// When true, pnpm install:clean runs as phase 0 before any other task.
const CLEAN_FIRST = !!(argv.clean || process.env.CLEAN_FIRST)

/**
 * Skip any script whose name CONTAINS one of these strings.
 *   - 'publish'        → all publish variants
 *   - 'update-version' → version-bump script
 */
const SKIP_CONTAINS = ['publish', 'update-version']

/**
 * Skip these EXACT script names.
 * By default we exclude:
 *   - install:clean  → runs `rm -rf` (destructive)
 *   - dev / website  → long-running dev servers (never exit)
 *   - postinstall    → runs a full build + husky install (covered by build:* scripts below)
 *
 * Remove entries here if you want them included.
 */
// ─── Skip rules ───────────────────────────────────────────────────────────────

// Root: build:* are excluded — each workspace's own build script covers them.
// Long-running servers, destructive helpers, and audit are also skipped.
const ROOT_SKIP_EXACT = new Set([
  'install:clean',
  'dev',
  'website',
  'postinstall',
  'audit-report',
  'lint:fix', // temporarily disabled
  'lint', // temporarily disabled
  'cmds-report'
])
const ROOT_SKIP_CONTAINS = ['publish', 'update-version']
const ROOT_SKIP_STARTS = ['build'] // 'build' and 'build:*'

// Workspace: publish & gallery variants are out. Long-running servers,
// interactive / destructive tooling, and generator pass-throughs too.
const WS_SKIP_CONTAINS = ['publish', 'gallery']
const WS_SKIP_EXACT = new Set([
  'dev',
  'serve',
  'start',
  'watch',
  'ng',
  'deploy',
  'docusaurus',
  'swizzle',
  'write-translations',
  'write-heading-ids',
])

// Per-workspace script skips (workspace name → Set of script names to skip)
const WS_SPECIFIC_SKIP = {
  '@unovis/angular': new Set(['test']),
  '@unovis/dev': new Set(['check', 'test']),
  '@unovis/website': new Set(['typecheck']),
  // 'generate' already runs `lint --fix` after autogeneration; running the
  // standalone `lint` in parallel causes it to see unfixed generated files.
  '@unovis/solid': new Set(['lint']),
}

// ─── Task setup ───────────────────────────────────────────────────────────────

const pkgPath = path.join(ROOT_DIR, 'package.json')
if (!fs.existsSync(pkgPath)) {
  console.error('No package.json found in', ROOT_DIR)
  process.exit(1)
}

const makeId = (workspace, scriptName) =>
  `c-${(`${workspace}-${scriptName}`).replace(/[^a-zA-Z0-9]/g, '-')}`

const makeTask = (workspace, workspaceDir, scriptName, script) => ({
  id: makeId(workspace, scriptName),
  name: `${workspace}:${scriptName}`, // unique lookup key used throughout
  workspace,
  workspaceDir,
  scriptName,
  script,
  status: 'pending',
  output: [],
  startTime: null,
  endTime: null,
  exitCode: null,
})

const tasks = []

// ── Root-level scripts (phase 4) ─────────────────────────────────────────────
const rootPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
Object.entries(rootPkg.scripts || {}).forEach(([name, script]) => {
  if (ROOT_SKIP_EXACT.has(name)) return
  if (ROOT_SKIP_CONTAINS.some(p => name.includes(p))) return
  if (ROOT_SKIP_STARTS.some(p => name === p || name.startsWith(`${p}:`))) return
  const t = makeTask('root', ROOT_DIR, name, script)
  t.phase = 4
  tasks.push(t)
})

// ── Workspace-level scripts ───────────────────────────────────────────────────
// @unovis/ts is sorted first and assigned phase 1 so it runs before all others.
const packagesDir = path.join(ROOT_DIR, 'packages')
const wsDirs = fs.readdirSync(packagesDir)
  .map(d => path.join(packagesDir, d))
  .filter(d => fs.statSync(d).isDirectory())

// Ensure @unovis/ts (the ts package) is processed first
wsDirs.sort((a, b) => {
  const nameOf = dir => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name || '' } catch (_) { return '' } }
  if (nameOf(a) === '@unovis/ts') return -1
  if (nameOf(b) === '@unovis/ts') return 1
  return 0
})

wsDirs.forEach(wsDir => {
  const wsPkgPath = path.join(wsDir, 'package.json')
  if (!fs.existsSync(wsPkgPath)) return
  const wsPkg = JSON.parse(fs.readFileSync(wsPkgPath, 'utf8'))
  const wsLabel = wsPkg.name || path.basename(wsDir)
  Object.entries(wsPkg.scripts || {}).forEach(([name, script]) => {
    if (WS_SKIP_EXACT.has(name)) return
    if (WS_SKIP_CONTAINS.some(p => name.includes(p))) return
    if (WS_SPECIFIC_SKIP[wsLabel]?.has(name)) return
    const t = makeTask(wsLabel, wsDir, name, script)
    t.phase = wsLabel === '@unovis/ts'
      ? 1
      : (wsLabel === '@unovis/dev' || wsLabel === '@unovis/website')
        ? 3
        : 2
    tasks.push(t)
  })
})

// ── Optional phase 1 pre-step: install:clean ──────────────────────────────────
if (CLEAN_FIRST) {
  const cleanScript = rootPkg.scripts['install:clean'] || 'pnpm install:clean'
  const cleanTask = makeTask('setup', ROOT_DIR, 'install:clean', cleanScript)
  cleanTask.phase = 1
  tasks.unshift(cleanTask)
}

if (tasks.length === 0) {
  console.error('No commands to run after filtering.')
  process.exit(1)
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const ANSI_RE = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g
const stripAnsi = s => s.replace(ANSI_RE, '')
const findTask = name => tasks.find(t => t.name === name)

const getGitBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT_DIR, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch (_) {
    return 'unknown'
  }
}

const BRANCH_NAME = getGitBranch()
const sanitizeForFileName = s => (s || 'unknown').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown'
const formatDateForFileName = ts => {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
}
const getReportFileName = completedAt =>
  `unovis-commands-report-${sanitizeForFileName(BRANCH_NAME)}-${formatDateForFileName(completedAt)}.html`

let lastCompletedAt = null

// Track all live child processes so SIGINT kills them cleanly
const activeProcs = new Set()

// ─── SSE ──────────────────────────────────────────────────────────────────────

const sseClients = new Set()

const broadcast = (evt, data) => {
  const msg = `event: ${evt}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients.forEach(res => {
    try { res.write(msg) } catch (_) { sseClients.delete(res) }
  })
}

// ─── State mutations ──────────────────────────────────────────────────────────

const updateTask = (name, patch) => {
  const t = findTask(name)
  if (!t) return
  Object.assign(t, patch)
  broadcast('taskUpdate', { name, ...patch })
}

const appendOutput = (name, raw) => {
  const t = findTask(name)
  if (!t) return
  raw.split('\n').forEach(l => {
    const line = stripAnsi(l).trimEnd()
    if (!line) return
    t.output.push(line)
    broadcast('taskOutput', { id: t.id, line })
  })
}

// ─── Runner ───────────────────────────────────────────────────────────────────

const runTask = task => new Promise(resolve => {
  updateTask(task.name, { status: 'running', startTime: Date.now() })
  console.log(`  ▶ starting  [${task.workspace}] ${task.scriptName}`)

  // shell:true ensures pnpm (a shell script/symlink) is resolved via the
  // user's PATH, and allows scripts that contain shell constructs (e.g.
  // the gather-licenses "for" loop) to run correctly.
  // detached:true creates a new process group so we can kill the whole
  // tree (shell + pnpm + children) at once with proc.pid negation.
  const proc = spawn(`pnpm run ${task.scriptName}`, {
    cwd: task.workspaceDir,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    detached: true,
  })
  activeProcs.add(proc)

  proc.stdout.on('data', d => appendOutput(task.name, d.toString()))
  proc.stderr.on('data', d => appendOutput(task.name, d.toString()))

  let timedOut = false
  const killProc = () => {
    try { process.kill(-proc.pid, 'SIGTERM') } catch (_) { try { proc.kill('SIGTERM') } catch (__) {} }
    setTimeout(() => {
      try { process.kill(-proc.pid, 'SIGKILL') } catch (_) { try { proc.kill('SIGKILL') } catch (__) {} }
    }, 3000)
  }

  const timer = TIMEOUT_S > 0
    ? setTimeout(() => {
      timedOut = true
      appendOutput(task.name, `[TIMEOUT] Exceeded ${TIMEOUT_S}s — killing process.`)
      killProc()
    }, TIMEOUT_S * 1000)
    : null

  const finish = code => {
    if (timer) clearTimeout(timer)
    const exitCode = timedOut ? -1 : (code ?? -1)
    const status = exitCode === 0 ? 'success' : 'failed'
    updateTask(task.name, { status, exitCode, endTime: Date.now() })
    const icon = exitCode === 0 ? '✓' : '✗'
    const elapsed = task.startTime ? `${((Date.now() - task.startTime) / 1000).toFixed(1)}s` : ''
    console.log(`  ${icon} ${exitCode === 0 ? 'done   ' : 'FAILED '} [${task.workspace}] ${task.scriptName}${elapsed ? ` (${elapsed})` : ''}${exitCode !== 0 ? `  exit=${exitCode}` : ''}`)
    resolve()
  }

  proc.on('close', code => { activeProcs.delete(proc); finish(code) })
  proc.on('error', err => {
    activeProcs.delete(proc)
    console.error(`  ! spawn error for [${task.workspace}] ${task.scriptName}: ${err.message}`)
    appendOutput(task.name, `Process error: ${err.message}`)
    finish(-1)
  })
})

const runAllTasks = async () => {
  const runStartedAt = Date.now()
  const runPhase = async (phaseNum, label) => {
    const phaseTasks = tasks.filter(t => t.phase === phaseNum)
    if (phaseTasks.length === 0) return true
    console.log(`\n  ○ ${label} (${phaseTasks.length} task${phaseTasks.length > 1 ? 's' : ''})`)
    const queue = [...phaseTasks]
    const w = Math.min(WORKERS, queue.length)
    const worker = async () => { let t; while ((t = queue.shift())) await runTask(t) }
    await Promise.all(Array.from({ length: w }, worker))
    return phaseTasks.every(t => t.status === 'success')
  }

  // Phase 1: optionally install:clean first, then @unovis/ts — both must complete
  // before any other phase. install:clean runs sequentially before @unovis/ts builds.
  if (tasks.some(t => t.phase === 1)) {
    // Run install:clean alone first (if present), abort if it fails
    const cleanTasks = tasks.filter(t => t.phase === 1 && t.scriptName === 'install:clean')
    if (cleanTasks.length > 0) {
      console.log('\n  ○ Phase 1a — install:clean')
      for (const ct of cleanTasks) await runTask(ct)
      const cleanFailed = cleanTasks.some(t => t.status !== 'success')
      if (cleanFailed) {
        const completedAt = Date.now()
        const durationMs = completedAt - runStartedAt
        console.error('\n  ✗ install:clean failed — aborting remaining phases.')
        const failed = tasks.filter(t => t.status === 'failed').length
        broadcast('allDone', { total: tasks.length, success: 0, failed, completedAt, durationMs })
        return { success: 0, failed, completedAt, durationMs }
      }
    }
    // Now run @unovis/ts tasks: build first, then forcebuild, then remaining in parallel
    const tsTasks = tasks.filter(t => t.phase === 1 && t.scriptName !== 'install:clean')
    if (tsTasks.length > 0) {
      const tsBuildTask = tsTasks.find(t => t.scriptName === 'build')
      const tsForceBuildTask = tsTasks.find(t => t.scriptName === 'forcebuild')
      const tsOtherTasks = tsTasks.filter(t => t.scriptName !== 'build' && t.scriptName !== 'forcebuild')

      if (tsBuildTask) {
        console.log('\n  ○ Phase 1b-i — @unovis/ts build')
        await runTask(tsBuildTask)
      }

      if (tsForceBuildTask) {
        console.log('\n  ○ Phase 1b-ii — @unovis/ts forcebuild')
        await runTask(tsForceBuildTask)
      }

      if (tsOtherTasks.length > 0) {
        console.log('\n  ○ Phase 1b-iii — @unovis/ts remaining (' + tsOtherTasks.length + ' task' + (tsOtherTasks.length > 1 ? 's' : '') + ')')
        const queue = [...tsOtherTasks]
        const w = Math.min(WORKERS, queue.length)
        const worker = async () => { let t; while ((t = queue.shift())) await runTask(t) }
        await Promise.all(Array.from({ length: w }, worker))
      }
    }
  }

  // Phase 2: @unovis/react + other workspace scripts (NOT ts, dev, website)
  await runPhase(2, 'Phase 2 — @unovis/react + other workspaces')

  // Phase 3: @unovis/dev and @unovis/website (run last, depend on built packages)
  if (tasks.some(t => t.phase === 3)) {
    await runPhase(3, 'Phase 3 — @unovis/dev & @unovis/website')
  }

  // Phase 4: root package.json scripts (lint, gather-licenses, etc.)
  if (tasks.some(t => t.phase === 4)) {
    await runPhase(4, 'Phase 4 — root scripts')
  }

  const success = tasks.filter(t => t.status === 'success').length
  const failed = tasks.filter(t => t.status === 'failed').length
  const completedAt = Date.now()
  const durationMs = completedAt - runStartedAt
  broadcast('allDone', { total: tasks.length, success, failed, completedAt, durationMs })
  return { success, failed, completedAt, durationMs }
}

// ─── HTTP server ──────────────────────────────────────────────────────────────

const taskSnapshot = () => tasks.map(({ id, name, workspace, scriptName, script, status, output, startTime, endTime, exitCode, phase }) =>
  ({ id, name, workspace, scriptName, script, status, output, startTime, endTime, exitCode, phase }))

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://x')

  // SSE endpoint
  if (pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx/proxy buffering
    })
    // Disable Nagle's algorithm — without this, Node.js TCP socket
    // batches small SSE writes together and the browser sees them
    // delayed or in bursts instead of in real-time.
    req.socket.setNoDelay(true)
    req.socket.setTimeout(0)
    res.flushHeaders()
    sseClients.add(res)
    res.write(`event: init\ndata: ${JSON.stringify(taskSnapshot())}\n\n`)
    // Keep-alive heartbeat every 15s prevents browser from closing the connection
    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n') } catch (_) { clearInterval(heartbeat) }
    }, 15000)
    req.on('close', () => {
      sseClients.delete(res)
      clearInterval(heartbeat)
    })
    return
  }

  // Downloadable static snapshot
  if (pathname === '/report.html') {
    const completedAt = lastCompletedAt || Date.now()
    const reportFileName = getReportFileName(completedAt)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `attachment; filename="${reportFileName}"` })
    res.end(buildHTML(JSON.stringify(taskSnapshot()), true))
    return
  }

  // Live page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(buildHTML('null', false))
})

// ─── HTML builder ─────────────────────────────────────────────────────────────

/*
 * CLIENT_JS is kept as a plain Node.js template literal with NO ${} interpolation
 * so it can safely contain arbitrary client-side JavaScript.
 * The token  "__UNOVIS_INITIAL_DATA__"  is replaced at build time by buildHTML().
 */
const CLIENT_JS = `
(function () {
  var tasks = {};
  var autoScroll = {};
  var currentFilter = 'all';
  var liveTimers = {};

  /* ── helpers ─────────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmt(ms) {
    if (!ms || ms < 0) return '-';
    if (ms < 1000)     return ms + 'ms';
    if (ms < 60000)    return (ms / 1000).toFixed(1) + 's';
    return Math.floor(ms / 60000) + 'm ' + Math.round((ms % 60000) / 1000) + 's';
  }

  function isErrLine(l)  { return /(?:error|ERR!|failed|exception)/i.test(l); }
  function isWarnLine(l) { return /warn(?:ing)?/i.test(l);  }

  /* ── live duration ticker ─────────────────────────────────── */
  function startTicker(id, startTime) {
    stopTicker(id);
    liveTimers[id] = setInterval(function () {
      var el = document.getElementById('dur-' + id);
      if (el) el.textContent = fmt(Date.now() - startTime);
    }, 500);
  }
  function stopTicker(id) {
    if (liveTimers[id]) { clearInterval(liveTimers[id]); delete liveTimers[id]; }
  }

  /* ── workspace section ───────────────────────────────────── */
  function wsSlug(ws) { return ws.replace(/[^a-zA-Z0-9]/g, '-'); }
  function makeSection(ws, phase) {
    var sec = document.createElement('div');
    sec.className = 'ws-section';
    sec.id = 'ws-' + wsSlug(ws);
    var hdr = document.createElement('div');
    hdr.className = 'ws-hdr';
    // Phase badge
    var badge = document.createElement('span');
    badge.className = 'phase-badge phase-' + (phase || 1);
    badge.textContent = phase === 1 ? 'phase 1'
      : phase === 3 ? 'phase 3'
      : phase === 4 ? 'phase 4'
      : 'phase ' + (phase || 1);
    hdr.appendChild(badge);
    var label = document.createTextNode(' ' + ws);
    hdr.appendChild(label);
    sec.appendChild(hdr);
    var grid = document.createElement('div');
    grid.className = 'ws-grid';
    grid.id = 'wsgrid-' + wsSlug(ws);
    sec.appendChild(grid);
    return sec;
  }

  /* ── card construction ────────────────────────────────────── */
  function makeCard(t) {
    var el = document.createElement('div');
    el.className   = 'card';
    el.id          = 'card-' + t.id;
    el.dataset.status = t.status;
    var dur = (t.startTime && t.endTime)
      ? fmt(t.endTime - t.startTime)
      : t.startTime ? fmt(Date.now() - t.startTime) : '-';

    el.innerHTML =
      '<div class="card-head">' +
        '<div class="dot dot-' + t.status + '" id="dot-' + t.id + '"></div>' +
        '<div class="card-name">' + esc(t.scriptName || t.name) + '</div>' +
        '<span class="badge badge-' + t.status + '" id="badge-' + t.id + '">' + t.status + '</span>' +
        '<span class="dur" id="dur-' + t.id + '">' + dur + '</span>' +
        '<span class="chevron">&#9662;</span>' +
      '</div>' +
      '<div class="script-hint" title="' + esc(t.script) + '">' + esc(t.script) + '</div>' +
      '<div class="log-wrap">' +
        '<div class="log-bar">' +
          '<span class="log-meta">' +
            '<span id="lcnt-' + t.id + '">0 lines</span>' +
            (t.exitCode !== null
              ? ' &nbsp;·&nbsp; exit&nbsp;<code>' + t.exitCode + '</code>'
              : '') +
          '</span>' +
          '<label class="as-label"><input type="checkbox" id="as-' + t.id + '" checked> auto-scroll</label>' +
        '</div>' +
        '<pre class="log" id="log-' + t.id + '"></pre>' +
      '</div>';

    el.querySelector('.card-head').addEventListener('click', function () { toggleCard(t.id); });
    el.querySelector('#as-' + t.id).addEventListener('change', function () { autoScroll[t.id] = this.checked; });

    var logEl = el.querySelector('.log');
    t.output.forEach(function (line) { appendLine(logEl, line); });
    updateLineCnt(t.id, t.output.length);
    autoScroll[t.id] = true;

    if (t.status === 'running' && t.startTime) startTicker(t.id, t.startTime);
    // Auto-expand running and failed cards so output is immediately visible.
    if (t.status === 'failed' || t.status === 'running') el.classList.add('open');

    return el;
  }

  function appendLine(logEl, line) {
    var sp = document.createElement('span');
    sp.className = 'ln' + (isErrLine(line) ? ' ln-e' : isWarnLine(line) ? ' ln-w' : '');
    sp.textContent = line;
    logEl.appendChild(sp);
    logEl.appendChild(document.createTextNode('\\n'));
  }

  function updateLineCnt(id, n) {
    var el = document.getElementById('lcnt-' + id);
    if (el) el.textContent = n + ' lines';
  }

  /* ── public controls ─────────────────────────────────────── */
  window.toggleCard  = function (id) {
    var c = document.getElementById('card-' + id);
    if (c) c.classList.toggle('open');
  };
  window.expandAll   = function () { document.querySelectorAll('.card').forEach(function (c) { c.classList.add('open'); }); };
  window.collapseAll = function () { document.querySelectorAll('.card').forEach(function (c) { c.classList.remove('open'); }); };
  window.setFilter   = function (f, btn) {
    currentFilter = f;
    document.querySelectorAll('.ctrl[data-filter]').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.card').forEach(function (c) {
      if (f === 'all' || c.dataset.status === f) c.classList.remove('hidden');
      else c.classList.add('hidden');
    });
    // Hide workspace sections that have no visible cards after filtering
    document.querySelectorAll('.ws-section').forEach(function (sec) {
      var hasVisible = sec.querySelectorAll('.card:not(.hidden)').length > 0;
      if (hasVisible) sec.classList.remove('hidden'); else sec.classList.add('hidden');
    });
  };

  /* ── stats ───────────────────────────────────────────────── */
  function updateStats() {
    var all = Object.values(tasks);
    var c = { pending: 0, running: 0, success: 0, failed: 0 };
    all.forEach(function (t) { c[t.status] = (c[t.status] || 0) + 1; });
    ['pending','running','success','failed'].forEach(function (k) {
      var el = document.getElementById('cnt-' + k);
      if (el) el.textContent = c[k] || 0;
    });
    var done  = (c.success || 0) + (c.failed || 0);
    var total = all.length;
    var prog  = document.getElementById('prog');
    if (prog) prog.style.width = (total ? (done / total * 100).toFixed(1) : 0) + '%';
  }

  /* ── card update ─────────────────────────────────────────── */
  function applyUpdate(name, data) {
    var t = tasks[name];
    if (!t) return;
    Object.assign(t, data);
    var id   = t.id;
    var card = document.getElementById('card-' + id);
    if (!card) return;
    var st = t.status;
    card.dataset.status = st;
    var isOpen = card.classList.contains('open');
    card.className = 'card' + (isOpen ? ' open' : '');

    var dot = document.getElementById('dot-' + id);
    if (dot) dot.className = 'dot dot-' + st;

    var badge = document.getElementById('badge-' + id);
    if (badge) { badge.className = 'badge badge-' + st; badge.textContent = st; }

    var dur = document.getElementById('dur-' + id);
    if (dur && t.endTime && t.startTime) {
      stopTicker(id);
      dur.textContent = fmt(t.endTime - t.startTime);
    } else if (dur && t.startTime && !t.endTime) {
      startTicker(id, t.startTime);
    }

    if (st === 'failed') card.classList.add('open');
    setFilter(currentFilter, document.querySelector('.ctrl.active[data-filter]'));
    updateStats();
  }

  /* ── init (grouped by workspace) ───────────────────────────────────── */
  function init(taskList) {
    tasks = {};
    var byWs = {};
    var wsOrder = [];
    taskList.forEach(function (t) {
      tasks[t.name] = t;
      var ws = t.workspace || 'root';
      if (!byWs[ws]) { byWs[ws] = { phase: t.phase || 2, tasks: [] }; wsOrder.push(ws); }
      byWs[ws].tasks.push(t);
    });
    // Sort sections by phase so the display always matches execution order.
    wsOrder.sort(function (a, b) { return (byWs[a].phase || 2) - (byWs[b].phase || 2); });
    var container = document.getElementById('grid');
    container.innerHTML = '';
    wsOrder.forEach(function (ws) {
      var sec = makeSection(ws, byWs[ws].phase);
      var grid = sec.querySelector('.ws-grid');
      byWs[ws].tasks.forEach(function (t) { grid.appendChild(makeCard(t)); });
      container.appendChild(sec);
    });
    updateStats();
  }

  function showDone(total, success, failed, completedAt, durationMs) {
    var b = document.getElementById('banner');
    var h = document.getElementById('banner-h');
    var p = document.getElementById('banner-p');
    if (!b) return;
    b.classList.add('show');
    if (failed > 0) {
      h.textContent  = failed + ' command' + (failed > 1 ? 's' : '') + ' failed';
      h.style.color  = 'var(--failed-c)';
    } else {
      h.textContent  = 'All ' + total + ' commands completed successfully \u2713';
      h.style.color  = 'var(--success-c)';
    }
    p.textContent = success + ' / ' + total + ' succeeded. Total runtime: ' + fmt(durationMs || 0) + '.';
    var dot = document.getElementById('live-dot');
    if (dot) dot.classList.add('off');
    // Show completed date/time in header
    var meta = document.getElementById('hdr-meta');
    if (meta) {
      var d = completedAt ? new Date(completedAt) : new Date();
      meta.textContent = 'Completed ' + d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
        ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · Runtime ' + fmt(durationMs || 0);
    }
  }

  /* ── bootstrap ───────────────────────────────────────────── */
  var INITIAL = "__UNOVIS_INITIAL_DATA__";

  if (INITIAL !== null) {
    /* ── static / snapshot mode ── */
    init(INITIAL);
    var anyFailed = INITIAL.some(function (t) { return t.status === 'failed'; });
    var allDone   = INITIAL.every(function (t) { return t.status !== 'pending' && t.status !== 'running'; });
    if (allDone) {
      var earliestStart = Math.min.apply(null, INITIAL.map(function (t) { return t.startTime || Number.MAX_SAFE_INTEGER; }));
      var latestEnd = Math.max.apply(null, INITIAL.map(function (t) { return t.endTime || 0; }));
      showDone(
        INITIAL.length,
        INITIAL.filter(function (t) { return t.status === 'success'; }).length,
        INITIAL.filter(function (t) { return t.status === 'failed';  }).length,
        latestEnd,
        (earliestStart !== Number.MAX_SAFE_INTEGER && latestEnd > 0) ? (latestEnd - earliestStart) : 0
      );
    }
  } else {
    /* ── live SSE mode ── */
    var evtSrc = new EventSource('/events');

    evtSrc.addEventListener('init', function (e) {
      var snap = JSON.parse(e.data);
      init(snap);
      // If all tasks already finished before we connected, show the summary.
      var allDone = snap.every(function (t) { return t.status !== 'pending' && t.status !== 'running'; });
      if (allDone && snap.length > 0) {
        var earliestStart = Math.min.apply(null, snap.map(function (t) { return t.startTime || Number.MAX_SAFE_INTEGER; }));
        var latestEnd = Math.max.apply(null, snap.map(function (t) { return t.endTime || 0; }));
        showDone(
          snap.length,
          snap.filter(function (t) { return t.status === 'success'; }).length,
          snap.filter(function (t) { return t.status === 'failed'; }).length,
          latestEnd,
          (earliestStart !== Number.MAX_SAFE_INTEGER && latestEnd > 0) ? (latestEnd - earliestStart) : 0
        );
      }
    });

    evtSrc.addEventListener('taskUpdate', function (e) {
      var d = JSON.parse(e.data);
      applyUpdate(d.name, d);
    });

    evtSrc.addEventListener('taskOutput', function (e) {
      var d   = JSON.parse(e.data);
      var key = Object.keys(tasks).find(function (n) { return tasks[n].id === d.id; });
      if (!key) return;
      var t   = tasks[key];
      t.output.push(d.line);
      updateLineCnt(d.id, t.output.length);
      var logEl = document.getElementById('log-' + d.id);
      if (!logEl) return;
      appendLine(logEl, d.line);
      if (autoScroll[d.id]) logEl.scrollTop = logEl.scrollHeight;
    });

    evtSrc.addEventListener('allDone', function (e) {
      var d = JSON.parse(e.data);
      showDone(d.total, d.success, d.failed, d.completedAt, d.durationMs);
    });

    evtSrc.onerror = function () {
      var dot = document.getElementById('live-dot');
      if (dot) dot.classList.add('off');
    };
  }
})();
`

function buildHTML (initialDataJSON, isStatic) {
  const safeInitialDataJSON = String(initialDataJSON)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  const clientJS = CLIENT_JS.replace('"__UNOVIS_INITIAL_DATA__"', safeInitialDataJSON)
  const escHtml = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const version = escHtml(rootPkg.version || '')
  const branch = escHtml(BRANCH_NAME)

  const styles = `
:root{--bg:#0d0f18;--surface:#14161f;--surface2:#1a1d2a;--border:#22263a;--text:#dde1f0;--muted:#505878;--pending-c:#6b7280;--running-c:#f59e0b;--success-c:#10b981;--failed-c:#ef4444;--accent:#6366f1;--r:8px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh;font-size:14px}
/* ── Header ── */
.hdr{background:var(--surface);border-bottom:1px solid var(--border);padding:13px 22px;position:sticky;top:0;z-index:10;display:flex;flex-direction:column;gap:9px}
.hdr-row{display:flex;align-items:center;gap:10px}
.ver-badge{font-size:11px;font-weight:600;color:var(--accent);background:rgba(99,102,241,.12);padding:2px 8px;border-radius:10px;flex-shrink:0}
.branch-badge{font-size:11px;font-weight:600;color:var(--running-c);background:rgba(245,158,11,.12);padding:2px 8px;border-radius:10px;flex-shrink:0}
.hdr-meta{font-size:11px;color:var(--muted);margin-left:auto;white-space:nowrap;flex-shrink:0}
h1{font-size:17px;font-weight:700;flex:1}
h1 em{color:var(--accent);font-style:normal}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--success-c);box-shadow:0 0 6px var(--success-c);flex-shrink:0;transition:.3s}
.live-dot.off{background:var(--muted);box-shadow:none}
.stats{display:flex;gap:7px;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.chip-pending{background:rgba(107,114,128,.14);color:var(--pending-c)}
.chip-running{background:rgba(245,158,11,.14);color:var(--running-c)}
.chip-success{background:rgba(16,185,129,.14);color:var(--success-c)}
.chip-failed{background:rgba(239,68,68,.14);color:var(--failed-c)}
.prog-rail{height:3px;background:var(--border);border-radius:2px;overflow:hidden}
.prog-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .5s ease}
.controls{display:flex;gap:5px;flex-wrap:wrap}
.ctrl{padding:4px 11px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer;font-size:12px;transition:.15s;font-family:inherit}
.ctrl:hover{background:var(--border);color:var(--text)}
.ctrl.active{border-color:var(--accent);color:var(--accent);background:rgba(99,102,241,.09)}
/* ── Main ── */
.main{padding:16px 20px;max-width:1600px;margin:0 auto}
.banner{display:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 18px;margin-bottom:14px}
.banner.show{display:block}
.banner h2{font-size:15px;margin-bottom:3px}
.banner p{color:var(--muted);font-size:13px}
.ws-section{margin-bottom:22px}.ws-hdr{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--muted);padding:4px 2px 8px;border-bottom:1px solid var(--border);margin-bottom:8px}.phase-badge{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;padding:2px 6px;border-radius:8px;flex-shrink:0}.phase-0{background:rgba(99,102,241,.18);color:#818cf8}.phase-1{background:rgba(99,102,241,.18);color:#818cf8}.phase-2{background:rgba(99,102,241,.18);color:#818cf8}.phase-3{background:rgba(99,102,241,.18);color:#818cf8}.phase-4{background:rgba(99,102,241,.18);color:#818cf8}.ws-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:9px}
/* ── Card ── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;transition:border-color .25s}
.card[data-status=running]{border-color:rgba(245,158,11,.35)}
.card[data-status=success]{border-color:rgba(16,185,129,.28)}
.card[data-status=failed]{border-color:rgba(239,68,68,.45)}
.card-head{display:flex;align-items:center;gap:8px;padding:10px 13px;cursor:pointer;user-select:none}
.card-head:hover{background:rgba(255,255,255,.02)}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.dot-pending{background:var(--pending-c)}
.dot-running{background:var(--running-c);animation:pulse 1.4s ease-in-out infinite}
.dot-success{background:var(--success-c)}
.dot-failed{background:var(--failed-c)}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.5)}}
.card-name{font-weight:600;font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:2px 7px;border-radius:10px;flex-shrink:0}
.badge-pending{background:rgba(107,114,128,.2);color:var(--pending-c)}
.badge-running{background:rgba(245,158,11,.2);color:var(--running-c)}
.badge-success{background:rgba(16,185,129,.2);color:var(--success-c)}
.badge-failed{background:rgba(239,68,68,.22);color:var(--failed-c)}
.dur{font-size:11px;color:var(--muted);min-width:52px;text-align:right;font-variant-numeric:tabular-nums;flex-shrink:0}
.chevron{color:var(--muted);font-size:11px;transition:transform .2s;flex-shrink:0}
.card.open .chevron{transform:rotate(180deg)}
.script-hint{padding:0 13px 8px;font-size:11px;color:var(--muted);font-family:"Cascadia Code","Fira Code",Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ── Log ── */
.log-wrap{display:none;border-top:1px solid var(--border)}
.card.open .log-wrap{display:block}
.log-bar{display:flex;justify-content:space-between;align-items:center;padding:5px 10px;background:rgba(0,0,0,.28);font-size:11px;color:var(--muted)}
.log-meta code{font-size:11px;background:rgba(255,255,255,.07);padding:0 4px;border-radius:3px}
.as-label{display:inline-flex;align-items:center;gap:4px;cursor:pointer}
pre.log{background:#080a12;font:12px/1.55 "Cascadia Code","Fira Code",Consolas,monospace;padding:10px 12px;max-height:320px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;tab-size:2}
.ln{display:block}
.ln-e{color:#ff5f5f}
.ln-w{color:#f9c74f}
/* ── misc ── */
.hidden{display:none!important}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--muted)}
`

  const filterBtns = ['all', 'running', 'success', 'failed', 'pending']
    .map(f =>
      `<button class="ctrl${f === 'all' ? ' active' : ''
      }" data-filter="${f}" onclick="setFilter('${f}', this)">${
        f.charAt(0).toUpperCase()}${f.slice(1)
      }</button>`
    ).join('\n    ')

  const reportLink = isStatic
    ? ''
    : '<a class="ctrl" href="/report.html" style="text-decoration:none;margin-left:4px">&#8595; Save report</a>'

  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>Unovis Command Runner</title>\n' +
    `<style>${styles}</style>\n` +
    '</head>\n' +
    '<body>\n' +
    '<div class="hdr">\n' +
    '  <div class="hdr-row">\n' +
    '    <h1>Unovis <em>Command Runner</em></h1>\n' +
    `    <span class="ver-badge" title="package version">v${version}</span>\n` +
    `    <span class="branch-badge" title="git branch">${branch}</span>\n` +
    '    <div class="live-dot" id="live-dot" title="Live updates"></div>\n' +
    '    <span class="hdr-meta" id="hdr-meta"></span>\n' +
    '  </div>\n' +
    '  <div class="stats">\n' +
    '    <span class="chip chip-pending">&#9203; <b id="cnt-pending">0</b> pending</span>\n' +
    '    <span class="chip chip-running">&#9889; <b id="cnt-running">0</b> running</span>\n' +
    '    <span class="chip chip-success">&#10003; <b id="cnt-success">0</b> success</span>\n' +
    '    <span class="chip chip-failed">&#10007; <b id="cnt-failed">0</b> failed</span>\n' +
    '  </div>\n' +
    '  <div class="prog-rail"><div class="prog-fill" id="prog" style="width:0%"></div></div>\n' +
    '  <div class="controls">\n' +
    '    <button class="ctrl" onclick="expandAll()">Expand All</button>\n' +
    '    <button class="ctrl" onclick="collapseAll()">Collapse All</button>\n' +
    `    ${filterBtns}\n` +
    `    ${reportLink}\n` +
    '  </div>\n' +
    '</div>\n' +
    '<div class="main">\n' +
    '  <div class="banner" id="banner"><h2 id="banner-h"></h2><p id="banner-p"></p></div>\n' +
    '  <div class="grid" id="grid"></div>\n' +
    '</div>\n' +
    `<script>${clientJS}<\/script>\n` +
    '</body>\n' +
    '</html>'
}

// ─── Entry point ──────────────────────────────────────────────────────────────

// Group tasks by workspace for display
const byWs = {}
tasks.forEach(t => { (byWs[t.workspace] = byWs[t.workspace] || []).push(t) })

console.log('\n  Unovis Parallel Command Runner')
console.log(`  ${'─'.repeat(50)}`)
console.log(`  Total commands : ${tasks.length}`)
console.log(`  Workers        : ${WORKERS} parallel`)
console.log(`  Timeout        : ${TIMEOUT_S}s per command`)
if (CLEAN_FIRST) console.log('  Pre-run        : pnpm install:clean  (phase 1)')
console.log(`  ${'─'.repeat(50)}`)
;[1, 2, 3, 4].forEach(phase => {
  const label = phase === 1
    ? 'Phase 1 — ' + (CLEAN_FIRST ? 'install:clean + ' : '') + '@unovis/ts'
    : phase === 2
      ? 'Phase 2 — @unovis/react + others'
      : phase === 3
        ? 'Phase 3 — @unovis/dev & @unovis/website'
        : 'Phase 4 — root scripts'
  const pTasks = tasks.filter(t => t.phase === phase)
  if (pTasks.length === 0) return
  const wsGroups = {}
  pTasks.forEach(t => { (wsGroups[t.workspace] = wsGroups[t.workspace] || []).push(t) })
  console.log(`\n  ${label}`)
  Object.entries(wsGroups).forEach(([ws, wsTasks]) => {
    console.log(`    [${ws}] ${wsTasks.map(t => t.scriptName).join(', ')}`)
  })
})
console.log(`\n  ${'─'.repeat(50)}\n`)

server.listen(PORT, '0.0.0.0', async () => {
  const url = `http://127.0.0.1:${PORT}`
  console.log(`  Live report → ${url}`)
  console.log('  Ctrl+C to exit early\n')

  // Open browser (best-effort)
  const opener = process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
      ? 'start'
      : 'xdg-open'
  try { spawn(opener, [url], { detached: true, stdio: 'ignore' }).unref() } catch (_) {}

  // Give the browser 1.5s to open and establish the SSE connection
  // before we start firing events, so no updates are missed.
  console.log('  Waiting 1.5s for browser to connect...')
  await new Promise(r => setTimeout(r, 1500))

  // Run everything
  const { success, failed, completedAt, durationMs } = await runAllTasks()
  lastCompletedAt = completedAt || Date.now()

  // Console summary
  console.log('\n  Results:')
  Object.entries(byWs).forEach(([ws, wsTasks]) => {
    console.log(`\n  [${ws}]`)
    wsTasks.forEach(t => {
      const icon = t.status === 'success' ? '✓' : t.status === 'failed' ? '✗' : '~'
      const ms = (t.startTime && t.endTime)
        ? ` (${((t.endTime - t.startTime) / 1000).toFixed(1)}s)`
        : ''
      console.log(`    ${icon} ${t.scriptName}${ms}`)
    })
  })
  const fmtTotal = ms => {
    if (!ms || ms < 0) return '-'
    if (ms < 1000) return ms + 'ms'
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's'
    return Math.floor(ms / 60000) + 'm ' + Math.round((ms % 60000) / 1000) + 's'
  }
  console.log(`\n  Total runtime: ${fmtTotal(durationMs || 0)}`)
  console.log(`\n  ${success}/${tasks.length} succeeded${failed ? `, ${failed} failed` : ' 🎉'}`)

  // Save static report
  const reportPath = path.join(ROOT_DIR, getReportFileName(lastCompletedAt))
  fs.writeFileSync(reportPath, buildHTML(JSON.stringify(taskSnapshot()), true))
  console.log(`\n  Static report saved → ${reportPath}`)
  console.log('  Report complete. Shutting down server.\n')

  const exitCode = failed > 0 ? 1 : 0
  server.close(() => process.exit(exitCode))
  // Fallback in case close callback does not fire promptly.
  setTimeout(() => process.exit(exitCode), 2000)
})

process.on('SIGINT', () => {
  console.log(`\n  Interrupted — killing ${activeProcs.size} child process(es)...`)
  activeProcs.forEach(p => {
    try { process.kill(-p.pid, 'SIGTERM') } catch (_) { try { p.kill('SIGTERM') } catch (__) {} }
  })
  setTimeout(() => process.exit(1), 2000)
})
