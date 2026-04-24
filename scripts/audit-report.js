#!/usr/bin/env node
/* eslint-disable */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let filterWorkspace = null;
let openServer = false;
let serverPort = 9030;

// Check for --workspace or -w flag, --serve or -s flag, and --port or -p flag
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--workspace' || args[i] === '-w') {
    filterWorkspace = args[i + 1];
    i++;
  } else if (args[i] === '--serve' || args[i] === '-s') {
    openServer = true;
  } else if (args[i] === '--port' || args[i] === '-p') {
    const portValue = parseInt(args[i + 1], 10);
    if (!isNaN(portValue) && portValue > 0 && portValue <= 65535) {
      serverPort = portValue;
    }
    i++;
  }
}

// Filename helpers
const sanitizeForFileName = s =>
  (s || 'unknown').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown'

const formatDateForFileName = ts => {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
}

// Run pnpm audit and get results
let auditData;

try {
  console.log('pnpm audit has started...');
  try {
    const output = execSync('pnpm audit --json', { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    // pnpm audit exits with code 1 when vulnerabilities are found
    // but still outputs JSON, so we can use the output
    if (error.stdout) {
      auditData = JSON.parse(error.stdout);
    } else if (error.stderr) {
      throw new Error('Failed to run pnpm audit: ' + error.stderr);
    } else {
      throw new Error('Failed to run pnpm audit: ' + error.message);
    }
  }

  
  // Map to store workspace vulnerability summaries
  const workspaceSummaries = new Map();
  
  // Extract workspace name from path (e.g., packages__angular -> packages/angular)
  function extractWorkspace(pathString) {
    const match = pathString.match(/^packages__([^>]+)/);
    if (match) {
      return `packages/${match[1]}`;
    }
    return null;
  }
  
  // Process actions to find vulnerabilities per workspace
  if (auditData.actions && Array.isArray(auditData.actions)) {
    auditData.actions.forEach(action => {
      if (action.resolves && Array.isArray(action.resolves)) {
        action.resolves.forEach(resolve => {
          const workspace = extractWorkspace(resolve.path);
          if (workspace) {
            if (!workspaceSummaries.has(workspace)) {
              workspaceSummaries.set(workspace, {
                workspace,
                vulnerabilities: new Set(),
                paths: [],
                modules: new Set()
              });
            }
            
            const summary = workspaceSummaries.get(workspace);
            summary.vulnerabilities.add(resolve.id);
            summary.paths.push(resolve.path);
            if (action.module) {
              summary.modules.add(action.module);
            }
          }
        });
      }
    });
  }
  
  // Process advisories to get detailed vulnerability information
  const advisories = auditData.advisories || {};
  const vulnerabilityDetails = new Map();
  
  Object.entries(advisories).forEach(([id, advisory]) => {
    vulnerabilityDetails.set(parseInt(id), {
      id: parseInt(id),
      title: advisory.title,
      severity: advisory.severity,
      module: advisory.module_name,
      vulnerableVersions: advisory.vulnerable_versions,
      patchedVersions: advisory.patched_versions,
      recommendation: advisory.recommendation,
      cves: advisory.cves || [],
      url: advisory.url,
      cvssScore: advisory.cvss && advisory.cvss.score > 0 ? advisory.cvss.score : null,
    });
  });
  
  // Helper function to draw grid boxes
  function drawGridBox(severity, title, module, vulnerable, patched, paths, url, cves = []) {
    const labelWidth = 19; // Width for the label column content
    const contentWidth = 56; // Width for the content column
    
    // Helper to wrap text
    function wrapText(text, maxWidth) {
      if (!text || text.length <= maxWidth) return [text || ''];
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= maxWidth) {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }
    
    // Helper to pad string to exact width
    function pad(str, width) {
      const strLen = String(str).length;
      if (strLen >= width) return String(str).substring(0, width);
      return str + ' '.repeat(width - strLen);
    }
    
    const lines = [];
    
    // Top border
    lines.push('┌─────────────────────┬────────────────────────────────────────────────────────┐');
    
    // Severity and Title (may wrap)
    const titleLines = wrapText(title, contentWidth);
    lines.push(`│ ${pad(severity, labelWidth)} │ ${pad(titleLines[0] || '', contentWidth)} │`);
    for (let i = 1; i < titleLines.length; i++) {
      lines.push(`│ ${pad('', labelWidth)} │ ${pad(titleLines[i], contentWidth)} │`);
    }
    
    lines.push('├─────────────────────┼────────────────────────────────────────────────────────┤');
    
    // Package
    lines.push(`│ ${pad('Package', labelWidth)} │ ${pad(module, contentWidth)} │`);
    lines.push('├─────────────────────┼────────────────────────────────────────────────────────┤');
    
    // Vulnerable versions
    lines.push(`│ ${pad('Vulnerable versions', labelWidth)} │ ${pad(vulnerable, contentWidth)} │`);
    lines.push('├─────────────────────┼────────────────────────────────────────────────────────┤');
    
    // Patched versions
    lines.push(`│ ${pad('Patched versions', labelWidth)} │ ${pad(patched, contentWidth)} │`);
    lines.push('├─────────────────────┼────────────────────────────────────────────────────────┤');
    
    // CVEs (if available)
    if (cves && cves.length > 0) {
      const cveText = cves.join(', ');
      const cveLines = wrapText(cveText, contentWidth);
      lines.push(`│ ${pad('CVEs', labelWidth)} │ ${pad(cveLines[0] || '', contentWidth)} │`);
      for (let i = 1; i < cveLines.length; i++) {
        lines.push(`│ ${pad('', labelWidth)} │ ${pad(cveLines[i], contentWidth)} │`);
      }
      lines.push('├─────────────────────┼────────────────────────────────────────────────────────┤');
    }
    
    // Paths (show count)
    const pathCount = paths.length > 0 ? `${paths.length} path(s)` : '';
    lines.push(`│ ${pad('Paths', labelWidth)} │ ${pad(pathCount, contentWidth)} │`);
    lines.push('├─────────────────────┼────────────────────────────────────────────────────────┤');
    
    // More info
    lines.push(`│ ${pad('More info', labelWidth)} │ ${pad(url, contentWidth)} │`);
    
    // Bottom border
    lines.push('└─────────────────────┴────────────────────────────────────────────────────────┘');
    
    return lines.join('\n');
  }
  
  // Build the final summary with severity counts per workspace
  const workspaceResults = Array.from(workspaceSummaries.values()).map(summary => {
    const severityCounts = {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0
    };
    
    const vulnerabilityList = [];
    const pathsByVulnId = new Map();
    
    // Collect paths for each vulnerability
    summary.paths.forEach(path => {
      const pathParts = path.split('>');
      // Extract vulnerability IDs from the path
      summary.vulnerabilities.forEach(vulnId => {
        const details = vulnerabilityDetails.get(vulnId);
        if (details && path.includes(details.module)) {
          if (!pathsByVulnId.has(vulnId)) {
            pathsByVulnId.set(vulnId, []);
          }
          pathsByVulnId.get(vulnId).push(path);
        }
      });
    });
    
    summary.vulnerabilities.forEach(vulnId => {
      const details = vulnerabilityDetails.get(vulnId);
      if (details) {
        vulnerabilityList.push({
          ...details,
          paths: pathsByVulnId.get(vulnId) || []
        });
        if (details.severity && severityCounts.hasOwnProperty(details.severity)) {
          severityCounts[details.severity]++;
        }
      }
    });
    
    return {
      workspace: summary.workspace,
      totalVulnerabilities: summary.vulnerabilities.size,
      uniqueModules: Array.from(summary.modules),
      severityCounts,
      vulnerabilities: vulnerabilityList.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };
        return (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5);
      })
    };
  });
  
  // Sort workspaces by total vulnerabilities (descending)
  workspaceResults.sort((a, b) => b.totalVulnerabilities - a.totalVulnerabilities);
  
  // Filter by workspace if specified
  let filteredResults = workspaceResults;
  if (filterWorkspace) {
    filteredResults = workspaceResults.filter(result => {
      // Support filtering by short name (e.g., 'angular') or full path (e.g., 'packages/angular')
      const workspaceName = result.workspace.split('/').pop();
      return workspaceName === filterWorkspace || result.workspace === filterWorkspace;
    });
    
    if (filteredResults.length === 0) {
      console.error(`\nError: No workspace found matching '${filterWorkspace}'`);
      console.error('\nAvailable workspaces:');
      workspaceResults.forEach(r => console.error(`  - ${r.workspace.split('/').pop()} (${r.workspace})`));
      process.exit(1);
    }
  }
  
  // Capture git branch and package version for the report header
  let gitBranch = 'unknown';
  try { gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(); } catch (_) {}
  let pkgVersion = 'unknown';
  try { pkgVersion = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version || 'unknown'; } catch (_) {}

  // Count total workspaces defined in pnpm-workspace.yaml (not just ones with vulnerabilities)
  let totalWorkspaces = 0;
  try {
    const wsYaml = fs.readFileSync(path.join(__dirname, '..', 'pnpm-workspace.yaml'), 'utf8');
    totalWorkspaces = wsYaml.split('\n').filter(l => /^\s+-\s+/.test(l)).length;
  } catch (_) {}

  const reportData = {
    generatedAt: new Date().toISOString(),
    filteredWorkspace: filterWorkspace,
    workspaces: filterWorkspace ? filteredResults : workspaceResults,
    totalWorkspaces,
    overallMetadata: auditData.metadata,
    branch: gitBranch,
    version: pkgVersion
  };

  // Generate HTML report — dynamic filename: vulnerability-report-<branch>-<YYYYMMDD-HHMMSS>.html
  const reportFileName = `vulnerability-report-${sanitizeForFileName(gitBranch)}-${formatDateForFileName(Date.now())}.html`;
  const htmlReportPath = path.join(__dirname, reportFileName);
  const htmlContent = generateHtmlReport(reportData);
  fs.writeFileSync(htmlReportPath, htmlContent);

  const overall = auditData.metadata?.vulnerabilities || {};
  const pnpmTotal = (overall.critical || 0) + (overall.high || 0) + (overall.moderate || 0) + (overall.low || 0) + (overall.info || 0);
  const displayedTotal = reportData.workspaces.reduce((s, ws) => s + ws.totalVulnerabilities, 0);
  console.log(`Scan complete — pnpm reported ${pnpmTotal} vulnerabilities; report surfaces ${displayedTotal} unique entries across ${reportData.workspaces.length} workspace(s). HTML saved to: ${htmlReportPath}`);

  // Start server if --serve flag is provided
  if (openServer) {
    startServer(htmlReportPath, serverPort);
  }
  
} catch (error) {
  console.error('Error reading or parsing audit results:', error.message);
  process.exit(1);
}

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const http = require('http');
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Function to find an available port starting from the given port
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + maxAttempts - 1}`);
}

// Function to start a simple HTTP server
async function startServer(htmlFilePath, preferredPort = 9030) {
  const http = require('http');
  
  let port;
  try {
    port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`⚠️  Port ${preferredPort} is in use, using port ${port} instead\n`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  
  const reportBaseName = path.basename(htmlFilePath);

  const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname === '/' || pathname === `/${reportBaseName}`) {
      fs.readFile(htmlFilePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading report');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n🚀 Server started at ${url}`);
    console.log(`📊 Vulnerability report: ${url}/${reportBaseName}\n`);

    // Auto-open browser (macOS and Linux only)
    const open = (u) => {
      const { execFile } = require('child_process');
      if (process.platform === 'darwin') {
        execFile('open', [u]);
      } else if (process.platform === 'linux') {
        execFile('xdg-open', [u]);
      }
    };

    setTimeout(() => open(`${url}/${reportBaseName}`), 500);

    // Auto-close after giving the browser time to load the page
    setTimeout(() => {
      console.log('  Report served. Shutting down server.\n');
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 2000);
    }, 5000);
  });
}

// Function to generate HTML report
function generateHtmlReport(reportData) {
  const safeReportDataJSON = JSON.stringify(reportData)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vulnerability Report - Unovis</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #F2F2F2;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 1.8em;
            margin-bottom: 4px;
            font-weight: 700;
        }

        .header .header-meta {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 4px;
        }

        .header .header-badge {
            font-size: 0.8em;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            padding: 2px 8px;
            opacity: 0.95;
        }

        .header .timestamp {
            font-size: 0.8em;
            opacity: 0.85;
        }

        .meta-stat {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.8em;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            padding: 2px 8px;
            opacity: 0.95;
            color: white;
        }

        .meta-stat strong {
            font-weight: 700;
        }

        .audit-note {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-top: 20px;
            padding: 0;
            font-size: 0.78em;
            color: #718096;
            line-height: 1.6;
        }

        .audit-note .audit-note-icon {
            flex-shrink: 0;
            font-size: 0.95em;
            opacity: 0.65;
            margin-top: 1px;
        }

        .audit-note strong {
            font-weight: 600;
            color: #4a5568;
        }

        .summary {
            background: #f8f9fa;
            padding: 30px 40px;
            border-bottom: 2px solid #e9ecef;
        }

        .summary h2 {
            margin-bottom: 20px;
            color: #2d3748;
            font-size: 1.5em;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #D8D8D8;
            text-align: center;
        }

        .summary-card .label {
            font-size: 0.85em;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .summary-card .value {
            font-size: 2em;
            font-weight: 700;
            color: #2d3748;
        }

        .severity-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .severity-critical {
            background: #feb2b2;
            color: #742a2a;
        }

        .severity-high {
            background: #fbd38d;
            color: #7c2d12;
        }

        .severity-moderate {
            background: #feebc8;
            color: #7c2d12;
        }

        .severity-low {
            background: #c6f6d5;
            color: #22543d;
        }

        .severity-info {
            background: #bee3f8;
            color: #2c5282;
        }

        .content {
            padding: 40px;
        }

        .workspace {
            margin-bottom: 40px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }

        .workspace-header {
            background: #f7fafc;
            padding: 20px 30px;
            border-bottom: 2px solid #e2e8f0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
        }

        .workspace-header:hover {
            background: #edf2f7;
        }

        .workspace-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #2d3748;
        }

        .workspace-stats {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .stat-badge {
            background: white;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 0.9em;
            color: #4a5568;
            border: 1px solid #D8D8D8;
        }

        .stat-badge strong {
            color: #2d3748;
        }

        .workspace-content {
            padding: 30px;
            background: white;
        }

        .severity-summary {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .severity-count {
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: 2px solid transparent;
            transition: opacity 0.15s, box-shadow 0.15s, border-color 0.15s;
            user-select: none;
        }

        .severity-count:hover {
            opacity: 0.85;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .severity-count.active {
            border-color: #2d3748;
            box-shadow: 0 0 0 3px rgba(45, 55, 72, 0.2);
        }

        .severity-count.dimmed {
            opacity: 0.35;
        }

        .vulnerabilities-list {
            display: grid;
            gap: 20px;
        }

        .vulnerability-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            background: #fafafa;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .vulnerability-card:hover {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .vuln-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .vuln-title {
            font-size: 1.1em;
            font-weight: 600;
            color: #2d3748;
            flex: 1;
        }

        .vuln-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
        }

        .detail-label {
            font-size: 0.75em;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .detail-value {
            font-size: 0.9em;
            color: #2d3748;
            font-family: 'Courier New', monospace;
        }

        .cve-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
        }

        .cve-badge {
            background: #1A1A2E;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8em;
            font-family: 'Courier New', monospace;
        }

        .cvss-score {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 0.85em;
            font-weight: 700;
            font-family: 'Courier New', monospace;
        }

        .cvss-critical { background: #fed7d7; color: #822727; }
        .cvss-high     { background: #feebc8; color: #7c2d12; }
        .cvss-medium   { background: #fefcbf; color: #744210; }
        .cvss-low      { background: #c6f6d5; color: #22543d; }
        .cvss-none     { background: #e2e8f0; color: #4a5568; }

        .paths-count {
            font-size: 0.85em;
            color: #718096;
            margin-top: 10px;
        }

        .paths-section {
            margin-top: 15px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }

        .paths-toggle {
            background: #edf2f7;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            color: #2d3748;
            font-weight: 600;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .paths-toggle:hover {
            background: #e2e8f0;
        }

        .paths-toggle-icon {
            transition: transform 0.3s;
        }

        .paths-toggle.expanded .paths-toggle-icon {
            transform: rotate(90deg);
        }

        .paths-list {
            display: none;
            margin-top: 12px;
            max-height: 300px;
            overflow-y: auto;
            background: #f7fafc;
            border-radius: 6px;
            padding: 12px;
        }

        .paths-list.show {
            display: block;
        }

        .path-item {
            font-family: 'Courier New', monospace;
            font-size: 0.75em;
            color: #4a5568;
            padding: 8px;
            margin: 4px 0;
            background: white;
            border-left: 3px solid #E4002B;
            border-radius: 4px;
            word-break: break-all;
        }

        .path-separator {
            color: #a0aec0;
            margin: 0 4px;
        }

        .url-link {
            color: #E4002B;
            text-decoration: none;
            font-size: 0.85em;
            display: inline-block;
            margin-top: 10px;
        }

        .url-link:hover {
            text-decoration: underline;
        }

        .toggle-icon {
            font-size: 1.2em;
            transition: transform 0.3s;
        }

        .workspace.collapsed .workspace-content {
            display: none;
        }

        .workspace:not(.collapsed) .toggle-icon {
            transform: rotate(180deg);
        }

        .modules-list {
            font-size: 0.85em;
            color: #4a5568;
            margin-top: 10px;
        }

        .search-bar {
            padding: 20px 40px 14px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }

        .search-bar-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .search-input-wrapper {
            flex: 1;
            position: relative;
        }

        .expand-collapse-btn {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-width: 130px;
            padding: 10px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            background: white;
            color: #4a5568;
            font-size: 0.88em;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: border-color 0.2s, background 0.2s, color 0.2s;
        }

        .expand-collapse-btn:hover {
            border-color: #667eea;
            color: #667eea;
            background: rgba(102,126,234,0.05);
        }

        .summary-card.filter-card {
            cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s, outline 0.15s;
            user-select: none;
        }

        .summary-card.filter-card:hover {
            box-shadow: 0 2px 6px rgba(0,0,0,0.10);
        }

        .summary-card.filter-card.active {
            outline: 3px solid #667eea;
            box-shadow: 0 0 0 4px rgba(102,126,234,0.18);
        }

        .search-input {
            width: 100%;
            padding: 12px 44px 12px 40px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.95em;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            background: white;
            color: #2d3748;
        }

        .search-input::-webkit-search-cancel-button,
        .search-input::-webkit-search-decoration {
            -webkit-appearance: none;
            appearance: none;
        }

        .search-input:focus {
            border-color: #E4002B;
            box-shadow: 0 0 0 3px rgba(228, 0, 43, 0.12);
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            pointer-events: none;
            font-size: 1em;
        }

        .search-clear {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #a0aec0;
            font-size: 1.1em;
            display: none;
            padding: 4px 6px;
            border-radius: 4px;
            line-height: 1;
        }

        .search-clear:hover {
            background: #e2e8f0;
            color: #4a5568;
        }

        .search-clear.visible {
            display: block;
        }

        .search-results-count {
            font-size: 0.82em;
            color: #718096;
            margin-top: 8px;
            min-height: 1.2em;
        }

        .no-results {
            text-align: center;
            padding: 48px 20px;
            color: #a0aec0;
            display: none;
        }

        .no-results.show {
            display: block;
        }

        .no-results p {
            font-size: 1em;
            margin-bottom: 6px;
        }

        .no-results small {
            font-size: 0.85em;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.4em;
            }

            .content {
                padding: 20px;
            }

            .summary {
                padding: 20px;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }

            .workspace-stats {
                flex-direction: column;
                gap: 8px;
                align-items: flex-end;
            }

            .search-bar {
                padding: 16px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Unovis Security Vulnerability Report</h1>
            <div class="header-meta">
                <span class="header-badge" id="branchBadge"></span>
                <span class="header-badge" id="versionBadge"></span>
                <div class="meta-stat">&#128230; <strong id="metaWorkspaces">0</strong>&nbsp;workspaces analysed</div>
                <div class="meta-stat">&#128220; <strong id="metaDependencies">0</strong>&nbsp;total dependencies</div>
                <span class="timestamp" id="timestamp"></span>
            </div>
        </div>

        <div class="summary">
            <h2>Overall Summary</h2>
            <div class="summary-grid">
                <div class="summary-card filter-card" data-severity="all" role="button" aria-pressed="true" title="Show all">
                    <div class="label">Total Vulnerabilities</div>
                    <div class="value" style="color: #e53e3e;" id="totalCount">0</div>
                </div>
                <div class="summary-card filter-card" data-severity="critical" role="button" aria-pressed="false" title="Filter by Critical">
                    <div class="label">Critical</div>
                    <div class="value" style="color: #e53e3e;" id="criticalCount">0</div>
                </div>
                <div class="summary-card filter-card" data-severity="high" role="button" aria-pressed="false" title="Filter by High">
                    <div class="label">High</div>
                    <div class="value" style="color: #dd6b20;" id="highCount">0</div>
                </div>
                <div class="summary-card filter-card" data-severity="moderate" role="button" aria-pressed="false" title="Filter by Moderate">
                    <div class="label">Moderate</div>
                    <div class="value" style="color: #d69e2e;" id="moderateCount">0</div>
                </div>
                <div class="summary-card filter-card" data-severity="low" role="button" aria-pressed="false" title="Filter by Low">
                    <div class="label">Low</div>
                    <div class="value" style="color: #38a169;" id="lowCount">0</div>
                </div>
            </div>
            <div class="audit-note">
                <span class="audit-note-icon">&#9432;</span>
                <span id="auditNoteText">pnpm audit reported vulnerabilities across all packages. This report groups them per workspace, deduplicating shared dependencies &mdash; counts reflect unique vulnerabilities per workspace, not the raw pnpm total.</span>
            </div>
        </div>

        <div class="search-bar">
            <div class="search-bar-row">
                <div class="search-input-wrapper">
                    <span class="search-icon">&#128269;</span>
                    <input
                        type="search"
                        id="searchInput"
                        class="search-input"
                        placeholder="Search by title, package, CVE, or workspace&hellip;"
                        autocomplete="off"
                        aria-label="Search vulnerabilities"
                    >
                    <button class="search-clear" id="searchClear" aria-label="Clear search">&#x2715;</button>
                </div>
                <button class="expand-collapse-btn" id="expandCollapseBtn" onclick="toggleAllWorkspaces()" title="Expand / Collapse all workspaces">
                    <span id="expandCollapseIcon">&#9650;</span>
                    <span id="expandCollapseLabel">Collapse All</span>
                </button>
            </div>
            <div class="search-results-count" id="searchResultsCount" aria-live="polite"></div>
        </div>

        <div class="content" id="workspacesContainer">
            <!-- Workspaces will be inserted here -->
        </div>
        <div id="noResults" class="no-results" role="status" aria-live="polite">
            <p>No vulnerabilities match your search.</p>
            <small>Try a different keyword, package name, severity, or workspace.</small>
        </div>
    </div>

    <script>
        // Load the JSON data
        const reportData = ${safeReportDataJSON};

        // Initialize the report
        function initializeReport() {
            // Set timestamp and header meta
            document.getElementById('timestamp').textContent =
                \`Generated: \${new Date(reportData.generatedAt).toLocaleString()}\`;
            document.getElementById('branchBadge').textContent = \`Branch: \${reportData.branch || 'unknown'}\`;
            document.getElementById('versionBadge').textContent = \`v\${reportData.version || 'unknown'}\`;

            // Meta bar — use total workspace count from pnpm-workspace.yaml, not just vulnerable ones
            const totalWs = reportData.totalWorkspaces || reportData.workspaces.length;
            const affectedWs = reportData.workspaces.length;
            document.getElementById('metaWorkspaces').textContent =
                affectedWs < totalWs
                    ? \`\${totalWs} (\${affectedWs} affected)\`
                    : String(totalWs);
            const totalDeps = reportData.overallMetadata?.totalDependencies || 0;
            document.getElementById('metaDependencies').textContent = totalDeps.toLocaleString();

            // Compute severity counts from the same workspace data that drives the rendered cards
            // (overallMetadata.vulnerabilities can diverge from what's actually displayed)
            const renderedCounts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
            reportData.workspaces.forEach(ws => {
                Object.keys(renderedCounts).forEach(k => {
                    renderedCounts[k] += ws.severityCounts?.[k] || 0;
                });
            });
            const totalVulns = Object.values(renderedCounts).reduce((s, v) => s + v, 0);

            // Update audit note with pnpm raw total vs displayed
            const pnpmVulns = reportData.overallMetadata?.vulnerabilities || {};
            const pnpmTotal = (pnpmVulns.critical || 0) + (pnpmVulns.high || 0) +
                              (pnpmVulns.moderate || 0) + (pnpmVulns.low || 0) + (pnpmVulns.info || 0);
            const severityColors = {
                critical: { bg: '#fed7d7', color: '#822727' },
                high:     { bg: '#feebc8', color: '#7c2d12' },
                moderate: { bg: '#fefcbf', color: '#744210' },
                low:      { bg: '#c6f6d5', color: '#22543d' },
                info:     { bg: '#bee3f8', color: '#2c5282' },
            };
            const severityPills = ['critical','high','moderate','low','info']
                .filter(k => (pnpmVulns[k] || 0) > 0)
                .map(k => {
                    const { bg, color } = severityColors[k];
                    return \`<span style="background:\${bg};color:\${color};border-radius:4px;padding:1px 7px;font-weight:600;font-size:0.95em;">\${k}: \${pnpmVulns[k]}</span>\`;
                }).join(' ');
            document.getElementById('auditNoteText').innerHTML =
                \`pnpm audit reported <strong>\${pnpmTotal}</strong> vulnerabilit\${pnpmTotal === 1 ? 'y' : 'ies'} \u2014 \${severityPills} \u2014 across all packages; this report surfaces <strong>\${totalVulns}</strong> unique \${totalVulns === 1 ? 'entry' : 'entries'} after grouping by workspace.\`;

            document.getElementById('totalCount').textContent = totalVulns;
            document.getElementById('criticalCount').textContent = renderedCounts.critical;
            document.getElementById('highCount').textContent = renderedCounts.high;
            document.getElementById('moderateCount').textContent = renderedCounts.moderate;
            document.getElementById('lowCount').textContent = renderedCounts.low;

            // Render workspaces
            renderWorkspaces();
            initializeSearch();
        }

        function getCvssClass(score) {
            if (score >= 9.0) return 'cvss-critical';
            if (score >= 7.0) return 'cvss-high';
            if (score >= 4.0) return 'cvss-medium';
            if (score > 0)    return 'cvss-low';
            return 'cvss-none';
        }

        function getSeverityClass(severity) {
            return \`severity-\${severity}\`;
        }

        function renderWorkspaces() {
            const container = document.getElementById('workspacesContainer');
            
            reportData.workspaces.forEach((workspace, index) => {
                const workspaceDiv = document.createElement('div');
                workspaceDiv.className = 'workspace';
                workspaceDiv.id = \`workspace-\${index}\`;
                workspaceDiv.dataset.workspace = workspace.workspace;
                workspaceDiv.dataset.severityCounts = JSON.stringify(workspace.severityCounts);

                const severityCounts = workspace.severityCounts;
                const totalVulns = workspace.totalVulnerabilities;

                workspaceDiv.innerHTML = \`
                    <div class="workspace-header" onclick="toggleWorkspace(\${index})">
                        <div>
                            <div class="workspace-title">\${escHtml(workspace.workspace)}</div>
                            <div class="modules-list">
                                <strong>Affected Modules:</strong> \${escHtml(workspace.uniqueModules.join(', '))}
                            </div>
                        </div>
                        <div class="workspace-stats">
                            <div class="stat-badge">
                                <strong>\${totalVulns}</strong> vulnerabilities
                            </div>
                            <span class="toggle-icon">▼</span>
                        </div>
                    </div>
                    <div class="workspace-content">
                        <div class="severity-summary">
                            \${severityCounts.critical > 0 ? \`
                                <div class="severity-count severity-critical">
                                    Critical: \${severityCounts.critical}
                                </div>
                            \` : ''}
                            \${severityCounts.high > 0 ? \`
                                <div class="severity-count severity-high">
                                    High: \${severityCounts.high}
                                </div>
                            \` : ''}
                            \${severityCounts.moderate > 0 ? \`
                                <div class="severity-count severity-moderate">
                                    Moderate: \${severityCounts.moderate}
                                </div>
                            \` : ''}
                            \${severityCounts.low > 0 ? \`
                                <div class="severity-count severity-low">
                                    Low: \${severityCounts.low}
                                </div>
                            \` : ''}
                            \${severityCounts.info > 0 ? \`
                                <div class="severity-count severity-info">
                                    Info: \${severityCounts.info}
                                </div>
                            \` : ''}
                        </div>
                        <div class="vulnerabilities-list">
                            \${workspace.vulnerabilities.map(vuln => \`
                                <div class="vulnerability-card" data-severity="\${escAttr(vuln.severity)}" data-search-text="\${escAttr([vuln.title, vuln.module, vuln.severity, ...(vuln.cves || []), workspace.workspace].join(' ').toLowerCase())}">
                                    <div class="vuln-header">
                                        <div class="vuln-title">\${escHtml(vuln.title)}</div>
                                        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;margin-left:12px;">
                                            \${vuln.cvssScore !== null && vuln.cvssScore !== undefined ? \`<span class="cvss-score \${getCvssClass(vuln.cvssScore)}" title="CVSS Score">CVSS \${vuln.cvssScore}</span>\` : ''}
                                            <span class="severity-badge \${getSeverityClass(vuln.severity)}">\${vuln.severity}</span>
                                        </div>
                                    </div>
                                    <div class="vuln-details">
                                        <div class="detail-item">
                                            <div class="detail-label">Package</div>
                                            <div class="detail-value">\${escHtml(vuln.module)}</div>
                                        </div>
                                        <div class="detail-item">
                                            <div class="detail-label">Vulnerable Versions</div>
                                            <div class="detail-value">\${escHtml(vuln.vulnerableVersions)}</div>
                                        </div>
                                        <div class="detail-item">
                                            <div class="detail-label">Patched Versions</div>
                                            <div class="detail-value">\${escHtml(vuln.patchedVersions)}</div>
                                        </div>
                                        <div class="detail-item">
                                            <div class="detail-label">Recommendation</div>
                                            <div class="detail-value">\${escHtml(vuln.recommendation)}</div>
                                        </div>
                                    </div>
                                    \${vuln.cves && vuln.cves.length > 0 ? \`
                                        <div class="cve-list">
                                            \${vuln.cves.map(cve => \`
                                                <span class="cve-badge">\${escHtml(cve)}</span>
                                            \`).join('')}
                                        </div>
                                    \` : ''}
                                    \${vuln.paths && vuln.paths.length > 0 ? \`
                                        <div class="paths-section">
                                            <button class="paths-toggle" onclick="togglePaths(event, this)">
                                                <span class="paths-toggle-icon">▶</span>
                                                <span>View \${vuln.paths.length} dependency path(s)</span>
                                            </button>
                                            <div class="paths-list">
                                                \${vuln.paths.map(path => \`
                                                    <div class="path-item">
                                                        \${escHtml(path).replace(/&gt;/g, '<span class="path-separator">→</span>')}
                                                    </div>
                                                \`).join('')}
                                            </div>
                                        </div>
                                    \` : ''}
                                    <a href="\${vuln.url && (vuln.url.startsWith('https://') || vuln.url.startsWith('http://')) ? escAttr(vuln.url) : '#'}" target="_blank" rel="noopener noreferrer" class="url-link">
                                        More information →
                                    </a>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;

                container.appendChild(workspaceDiv);
            });
        }

        function escHtml(s) {
            return String(s || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function escAttr(s) {
            return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        }

        function initializeSearch() {
            const input = document.getElementById('searchInput');
            const clearBtn = document.getElementById('searchClear');
            const noResults = document.getElementById('noResults');
            const resultsCount = document.getElementById('searchResultsCount');

            let activeSeverity = 'all';

            function applyFilter() {
                const query = input.value.trim().toLowerCase();
                const workspaceDivs = document.querySelectorAll('.workspace');
                let totalVisible = 0;

                workspaceDivs.forEach(wDiv => {
                    const cards = wDiv.querySelectorAll('.vulnerability-card');
                    let workspaceVisible = 0;

                    cards.forEach(card => {
                        const textMatch = !query || (card.dataset.searchText || '').includes(query);
                        const severityMatch = activeSeverity === 'all' || card.dataset.severity === activeSeverity;
                        const visible = textMatch && severityMatch;
                        card.style.display = visible ? '' : 'none';
                        if (visible) workspaceVisible++;
                    });

                    const hasFilter = query.length > 0 || activeSeverity !== 'all';
                    if (hasFilter && workspaceVisible === 0) {
                        wDiv.style.display = 'none';
                    } else {
                        wDiv.style.display = '';
                        if (hasFilter) wDiv.classList.remove('collapsed');
                        totalVisible += workspaceVisible;
                    }
                });

                clearBtn.classList.toggle('visible', query.length > 0);
                const hasFilter = query.length > 0 || activeSeverity !== 'all';
                noResults.classList.toggle('show', totalVisible === 0 && hasFilter);

                if (!hasFilter) {
                    resultsCount.textContent = '';
                } else {
                    // Count only cards that match the active severity filter (the eligible pool)
                    const totalCards = activeSeverity === 'all'
                        ? document.querySelectorAll('.vulnerability-card').length
                        : document.querySelectorAll(\`.vulnerability-card[data-severity="\${activeSeverity}"]\`).length;
                    resultsCount.textContent = \`Showing \${totalVisible} of \${totalCards} vulnerabilit\${totalCards === 1 ? 'y' : 'ies'}\`;
                }
            }

            function updateSeverityButtons(selected) {
                document.querySelectorAll('.summary-card.filter-card').forEach(card => {
                    const isActive = card.dataset.severity === selected;
                    card.classList.toggle('active', isActive);
                    card.setAttribute('aria-pressed', String(isActive));
                });
            }

            // Mark 'all' card active initially
            updateSeverityButtons('all');

            document.addEventListener('click', e => {
                const card = e.target.closest('.summary-card.filter-card');
                if (!card) return;
                const sev = card.dataset.severity;
                if (!sev) return;
                activeSeverity = (activeSeverity === sev && sev !== 'all') ? 'all' : sev;
                updateSeverityButtons(activeSeverity);
                applyFilter();
            });

            input.addEventListener('input', applyFilter);

            clearBtn.addEventListener('click', () => {
                input.value = '';
                applyFilter();
                input.focus();
            });

            document.addEventListener('keydown', e => {
                if (e.key === '/' && document.activeElement !== input) {
                    e.preventDefault();
                    input.focus();
                    input.select();
                }
                if (e.key === 'Escape') {
                    input.value = '';
                    activeSeverity = 'all';
                    updateSeverityButtons('all');
                    applyFilter();
                }
            });
        }

        function syncExpandCollapseBtn() {
            var allWorkspaces = document.querySelectorAll('.workspace');
            var icon  = document.getElementById('expandCollapseIcon');
            var label = document.getElementById('expandCollapseLabel');
            if (!icon || !label) return;
            var anyExpanded = Array.from(allWorkspaces).some(function(w) { return !w.classList.contains('collapsed'); });
            icon.textContent  = anyExpanded ? '\u25B2' : '\u25BC';
            label.textContent = anyExpanded ? 'Collapse All' : 'Expand All';
        }

        function toggleWorkspace(index) {
            var workspace = document.getElementById(\`workspace-\${index}\`);
            workspace.classList.toggle('collapsed');
            syncExpandCollapseBtn();
        }

        function toggleAllWorkspaces() {
            var allWorkspaces = document.querySelectorAll('.workspace');
            var anyExpanded = Array.from(allWorkspaces).some(function(w) { return !w.classList.contains('collapsed'); });
            allWorkspaces.forEach(function(w) {
                if (anyExpanded) w.classList.add('collapsed');
                else w.classList.remove('collapsed');
            });
            syncExpandCollapseBtn();
        }

        function togglePaths(event, button) {
            event.preventDefault();
            event.stopPropagation();
            button.classList.toggle('expanded');
            const pathsList = button.nextElementSibling;
            pathsList.classList.toggle('show');
        }

        // Initialize when page loads
        initializeReport();
    </script>
</body>
</html>`;

  return htmlTemplate;
}
