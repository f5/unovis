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

// Run pnpm audit and get results
let auditData;

try {
  console.log('Running pnpm audit...\n');
  try {
    const output = execSync('pnpm audit --json', { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      cwd: __dirname
    });
    auditData = JSON.parse(output);
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
  // Returns 'root' for root-level dependencies (paths starting with .>)
  function extractWorkspace(pathString) {
    const match = pathString.match(/^packages__([^>]+)/);
    if (match) {
      return `packages/${match[1]}`;
    }
    // Check if it's a root-level dependency
    if (pathString.startsWith('.>')) {
      return 'root';
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
      url: advisory.url
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
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('VULNERABILITY SUMMARY BY WORKSPACE');
  console.log('='.repeat(80));
  console.log(`\nTotal Workspaces Analyzed: ${workspaceResults.length}`);
  
  if (filterWorkspace) {
    console.log(`Filtering by workspace: ${filteredResults[0].workspace}`);
  }
  
  if (auditData.metadata && auditData.metadata.vulnerabilities) {
    console.log('\nOverall Vulnerabilities:');
    const overall = auditData.metadata.vulnerabilities;
    console.log(`  Critical: ${overall.critical || 0}`);
    console.log(`  High: ${overall.high || 0}`);
    console.log(`  Moderate: ${overall.moderate || 0}`);
    console.log(`  Low: ${overall.low || 0}`);
    console.log(`  Info: ${overall.info || 0}`);
    console.log(`  Total: ${(overall.critical || 0) + (overall.high || 0) + (overall.moderate || 0) + (overall.low || 0) + (overall.info || 0)}`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Print detailed summary for each workspace
  filteredResults.forEach((result, index) => {
    console.log(`\n[${index + 1}] Workspace: ${result.workspace}`);
    console.log('-'.repeat(80));
    console.log(`Total Vulnerabilities: ${result.totalVulnerabilities}`);
    console.log(`Affected Modules: ${result.uniqueModules.length} (${result.uniqueModules.join(', ')})`);
    console.log('\nSeverity Breakdown:');
    console.log(`  Critical: ${result.severityCounts.critical}`);
    console.log(`  High: ${result.severityCounts.high}`);
    console.log(`  Moderate: ${result.severityCounts.moderate}`);
    console.log(`  Low: ${result.severityCounts.low}`);
    console.log(`  Info: ${result.severityCounts.info}`);
    
    if (result.vulnerabilities.length > 0) {
      console.log('\nVulnerability Details:');
      result.vulnerabilities.forEach((vuln, i) => {
        console.log(`\n${drawGridBox(
          vuln.severity,
          vuln.title,
          vuln.module,
          vuln.vulnerableVersions,
          vuln.patchedVersions,
          vuln.paths || [],
          vuln.url,
          vuln.cves
        )}`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('END OF REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Optionally write to a file
  const reportPath = path.join(__dirname, 'vulnerability-report.json');
  const reportData = {
    generatedAt: new Date().toISOString(),
    filteredWorkspace: filterWorkspace,
    workspaces: filterWorkspace ? filteredResults : workspaceResults,
    overallMetadata: auditData.metadata
  };
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n✓ Detailed report saved to: ${reportPath}\n`);
  
  // Generate HTML report
  const htmlReportPath = path.join(__dirname, 'vulnerability-report.html');
  const htmlContent = generateHtmlReport(reportData);
  fs.writeFileSync(htmlReportPath, htmlContent);
  
  console.log(`✓ HTML report saved to: ${htmlReportPath}\n`);
  
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
  
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/vulnerability-report.html') {
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
    console.log(`\n🚀 Server started at http://localhost:${port}`);
    console.log(`📊 View your vulnerability report at: http://localhost:${port}/vulnerability-report.html\n`);
    console.log('Press Ctrl+C to stop the server\n');
    
    // Auto-open browser (macOS, Linux, Windows)
    const open = (url) => {
      const { exec } = require('child_process');
      const command = process.platform === 'darwin' ? 'open' : 
                      process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${command} ${url}`);
    };
    
    setTimeout(() => {
      open(`http://localhost:${port}/vulnerability-report.html`);
    }, 500);
  });
}

// Function to generate HTML report
function generateHtmlReport(reportData) {
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header .timestamp {
            font-size: 0.9em;
            opacity: 0.9;
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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
            background: #4a5568;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8em;
            font-family: 'Courier New', monospace;
        }

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
            border-left: 3px solid #667eea;
            border-radius: 4px;
            word-break: break-all;
        }

        .path-separator {
            color: #a0aec0;
            margin: 0 4px;
        }

        .url-link {
            color: #667eea;
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

        .workspace.collapsed .toggle-icon {
            transform: rotate(-90deg);
        }

        .modules-list {
            font-size: 0.85em;
            color: #4a5568;
            margin-top: 10px;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Unovis Security Vulnerability Report</h1>
            <div class="timestamp" id="timestamp"></div>
        </div>

        <div class="summary">
            <h2>Overall Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="label">Total Workspaces</div>
                    <div class="value" id="totalWorkspaces">0</div>
                </div>
                <div class="summary-card">
                    <div class="label">Total Dependencies</div>
                    <div class="value" id="totalDependencies">0</div>
                </div>
                <div class="summary-card">
                    <div class="label">Total Vulnerabilities</div>
                    <div class="value" style="color: #e53e3e;" id="totalCount">0</div>
                </div>
                <div class="summary-card">
                    <div class="label">Critical</div>
                    <div class="value" style="color: #e53e3e;" id="criticalCount">0</div>
                </div>
                <div class="summary-card">
                    <div class="label">High</div>
                    <div class="value" style="color: #dd6b20;" id="highCount">0</div>
                </div>
                <div class="summary-card">
                    <div class="label">Moderate</div>
                    <div class="value" style="color: #d69e2e;" id="moderateCount">0</div>
                </div>
                <div class="summary-card">
                    <div class="label">Low</div>
                    <div class="value" style="color: #38a169;" id="lowCount">0</div>
                </div>
            </div>
        </div>

        <div class="content" id="workspacesContainer">
            <!-- Workspaces will be inserted here -->
        </div>
    </div>

    <script>
        // Load the JSON data
        const reportData = ${JSON.stringify(reportData)};

        // Initialize the report
        function initializeReport() {
            // Set timestamp
            document.getElementById('timestamp').textContent = 
                \`Generated: \${new Date(reportData.generatedAt).toLocaleString()}\`;

            // Set overall summary
            document.getElementById('totalWorkspaces').textContent = reportData.workspaces.length;
            document.getElementById('totalDependencies').textContent = 
                reportData.overallMetadata?.totalDependencies || 0;
            
            const overallVulns = reportData.overallMetadata?.vulnerabilities || {};
            const totalVulns = (overallVulns.critical || 0) + (overallVulns.high || 0) + 
                              (overallVulns.moderate || 0) + (overallVulns.low || 0) + (overallVulns.info || 0);
            
            document.getElementById('totalCount').textContent = totalVulns;
            document.getElementById('criticalCount').textContent = overallVulns.critical || 0;
            document.getElementById('highCount').textContent = overallVulns.high || 0;
            document.getElementById('moderateCount').textContent = overallVulns.moderate || 0;
            document.getElementById('lowCount').textContent = overallVulns.low || 0;

            // Render workspaces
            renderWorkspaces();
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

                const severityCounts = workspace.severityCounts;
                const totalVulns = workspace.totalVulnerabilities;

                workspaceDiv.innerHTML = \`
                    <div class="workspace-header" onclick="toggleWorkspace(\${index})">
                        <div>
                            <div class="workspace-title">\${workspace.workspace}</div>
                            <div class="modules-list">
                                <strong>Affected Modules:</strong> \${workspace.uniqueModules.join(', ')}
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
                                <div class="vulnerability-card">
                                    <div class="vuln-header">
                                        <div class="vuln-title">\${vuln.title}</div>
                                        <span class="severity-badge \${getSeverityClass(vuln.severity)}">
                                            \${vuln.severity}
                                        </span>
                                    </div>
                                    <div class="vuln-details">
                                        <div class="detail-item">
                                            <div class="detail-label">Package</div>
                                            <div class="detail-value">\${vuln.module}</div>
                                        </div>
                                        <div class="detail-item">
                                            <div class="detail-label">Vulnerable Versions</div>
                                            <div class="detail-value">\${vuln.vulnerableVersions}</div>
                                        </div>
                                        <div class="detail-item">
                                            <div class="detail-label">Patched Versions</div>
                                            <div class="detail-value">\${vuln.patchedVersions}</div>
                                        </div>
                                        <div class="detail-item">
                                            <div class="detail-label">Recommendation</div>
                                            <div class="detail-value">\${vuln.recommendation}</div>
                                        </div>
                                    </div>
                                    \${vuln.cves && vuln.cves.length > 0 ? \`
                                        <div class="cve-list">
                                            \${vuln.cves.map(cve => \`
                                                <span class="cve-badge">\${cve}</span>
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
                                                        \${path.replace(/>/g, '<span class="path-separator">→</span>')}
                                                    </div>
                                                \`).join('')}
                                            </div>
                                        </div>
                                    \` : ''}
                                    <a href="\${vuln.url}" target="_blank" class="url-link">
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

        function toggleWorkspace(index) {
            const workspace = document.getElementById(\`workspace-\${index}\`);
            workspace.classList.toggle('collapsed');
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
