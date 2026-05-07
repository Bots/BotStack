'use strict';

const fs = require('node:fs');
const path = require('node:path');

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function backupFile(filePath, backupRoot) {
  if (!fs.existsSync(filePath)) return null;
  const relative = path.relative(path.parse(filePath).root, filePath).replaceAll(path.sep, '__');
  const backupPath = path.join(backupRoot, `${Date.now()}-${relative}`);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function applyOperation(step, context) {
  if (step.type === 'mkdir') {
    fs.mkdirSync(step.target, { recursive: true });
    return { changed: true };
  }
  if (step.type === 'append_managed_block') return appendManagedBlock(step, context);
  if (step.type === 'json.merge') return mergeJson(step, context);
  if (step.type === 'toml.merge') return mergeTomlBlock(step, context);
  throw new Error(`Unsupported config operation: ${step.type}`);
}

function appendManagedBlock(step, context) {
  ensureParent(step.target);
  const backupPath = backupFile(step.target, context.backupRoot);
  const start = `# >>> botstack:${step.id}`;
  const end = `# <<< botstack:${step.id}`;
  const block = `${start}\n${step.value || ''}\n${end}`;
  const current = fs.existsSync(step.target) ? fs.readFileSync(step.target, 'utf8') : '';
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, 'm');
  const next = pattern.test(current)
    ? current.replace(pattern, block)
    : `${current}${current.endsWith('\n') || current.length === 0 ? '' : '\n'}${block}\n`;
  fs.writeFileSync(step.target, next);
  return { changed: next !== current, backupPath };
}

function mergeJson(step, context) {
  ensureParent(step.target);
  const backupPath = backupFile(step.target, context.backupRoot);
  const current = fs.existsSync(step.target) ? JSON.parse(fs.readFileSync(step.target, 'utf8')) : {};
  const next = deepMerge(current, step.value || {});
  fs.writeFileSync(step.target, `${JSON.stringify(next, null, 2)}\n`);
  return { changed: JSON.stringify(current) !== JSON.stringify(next), backupPath };
}

function mergeTomlBlock(step, context) {
  ensureParent(step.target);
  const backupPath = backupFile(step.target, context.backupRoot);
  const start = `# >>> botstack:${step.id}`;
  const end = `# <<< botstack:${step.id}`;
  const lines = Object.entries(step.value || {}).map(([key, value]) => `${key} = ${formatTomlValue(value)}`);
  const block = `${start}\n${lines.join('\n')}\n${end}`;
  const current = fs.existsSync(step.target) ? fs.readFileSync(step.target, 'utf8') : '';
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, 'm');
  const next = pattern.test(current)
    ? current.replace(pattern, block)
    : `${current}${current.endsWith('\n') || current.length === 0 ? '' : '\n'}${block}\n`;
  fs.writeFileSync(step.target, next);
  return { changed: next !== current, backupPath };
}

function deepMerge(base, patch) {
  const output = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = deepMerge(output[key] && typeof output[key] === 'object' ? output[key] : {}, value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function formatTomlValue(value) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  return JSON.stringify(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { applyOperation, backupFile, deepMerge };
