'use strict';

const fs = require('node:fs');
const path = require('node:path');

function writeReferenceDocs(plugins, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const files = [];
  files.push(writeFile(path.join(outputDir, 'tools.md'), renderTools(plugins)));
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
    lines.push(`## ${plugin.name}`, '');
    for (const operation of plugin.install.filter((item) => item.target)) {
      lines.push(`- \`${formatDocPath(operation.target)}\` — ${operation.description || operation.id}`);
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
      lines.push(`- \`${operation.command || operation.type}\` — ${operation.description || operation.id}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function formatDocPath(value) {
  if (!value) return value;
  return value
    .replaceAll('${home}', '~')
    .replaceAll('${botstackDir}', '~/.botstack')
    .replaceAll('${toolsDir}', '~/.botstack/tools')
    .replaceAll('${stateDir}', '~/.botstack/state');
}

module.exports = { writeReferenceDocs };
