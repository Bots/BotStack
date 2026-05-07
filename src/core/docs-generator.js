'use strict';

const fs = require('node:fs');
const path = require('node:path');

function writeReferenceDocs(plugins, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const files = [];
  files.push(writeFile(path.join(outputDir, 'tools.md'), renderTools(plugins)));
  files.push(writeFile(path.join(outputDir, 'support-matrix.md'), renderSupportMatrix(plugins)));
  files.push(writeFile(path.join(outputDir, 'install-directories.md'), renderInstallDirs(plugins)));
  files.push(writeFile(path.join(outputDir, 'verification.md'), renderVerification(plugins)));
  return files;
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  return filePath;
}

function renderTools(plugins) {
  const lines = ['# Botstack Tool Reference', ''];
  for (const plugin of plugins) {
    lines.push(`## ${plugin.name}`, '');
    lines.push(plugin.summary, '');
    lines.push(`- ID: \`${plugin.id}\``);
    lines.push(`- Category: \`${plugin.category}\``);
    lines.push(`- Stacks: ${(plugin.stacks || []).map((stack) => `\`${stack}\``).join(', ')}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function renderInstallDirs(plugins) {
  const lines = ['# Install Directories', '', 'Generated from built-in Botstack manifests.', ''];
  for (const plugin of plugins) {
    const operations = plugin.install.filter((item) => item.target);
    if (operations.length === 0) continue;
    lines.push(`## ${plugin.name}`, '');
    for (const operation of operations) {
      const harnesses = operation.harnesses?.length ? ` (${operation.harnesses.join(', ')})` : '';
      lines.push(`- \`${formatDocPath(operation.target)}\`${harnesses} — ${operation.description || operation.id}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function renderVerification(plugins) {
  const lines = ['# Verification Commands', '', 'Generated from built-in Botstack manifests.', ''];
  for (const plugin of plugins) {
    lines.push(`## ${plugin.name}`, '');
    for (const operation of plugin.verify) {
      const harnesses = operation.harnesses?.length ? ` (${operation.harnesses.join(', ')})` : '';
      lines.push(`- \`${operation.command || operation.type}\`${harnesses} — ${operation.description || operation.id}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function renderSupportMatrix(plugins) {
  const harnesses = collectHarnesses(plugins);
  const lines = ['# Support Matrix', '', 'Generated from built-in Botstack manifests.', ''];
  lines.push(`| Tool | ${harnesses.map(formatHarnessName).join(' | ')} |`);
  lines.push(`| --- | ${harnesses.map(() => '---').join(' | ')} |`);
  for (const plugin of plugins) {
    lines.push(`| ${plugin.name} | ${harnesses.map((harness) => plugin.harnesses?.includes(harness) ? 'yes' : 'no').join(' | ')} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function collectHarnesses(plugins) {
  const seen = new Set();
  for (const plugin of plugins) {
    for (const harness of plugin.harnesses || []) seen.add(harness);
  }
  return [...seen].sort();
}

function formatHarnessName(harness) {
  const names = {
    aider: 'Aider',
    claude: 'Claude Code',
    codex: 'Codex CLI',
    continue: 'Continue',
    opencode: 'OpenCode',
  };
  return names[harness] || harness;
}

function formatDocPath(value) {
  if (!value) return value;
  return value
    .replaceAll('${home}', '~')
    .replaceAll('${botstackDir}', '~/.botstack')
    .replaceAll('${cacheDir}', '~/.botstack/cache')
    .replaceAll('${toolsDir}', '~/.botstack/tools')
    .replaceAll('${stateDir}', '~/.botstack/state')
    .replaceAll('${gstackInstallDir}', '~/gstack')
    .replaceAll('${gbrainInstallDir}', '~/gbrain');
}

module.exports = { writeReferenceDocs, renderSupportMatrix };
