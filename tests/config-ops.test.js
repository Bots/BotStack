'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { applyOperation } = require('../src/core/config-ops');

test('append_managed_block preserves existing content and creates backup', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-config-'));
  const target = path.join(dir, 'AGENTS.md');
  fs.writeFileSync(target, 'existing\n');

  const result = applyOperation({
    id: 'plugin:block',
    type: 'append_managed_block',
    target,
    value: 'managed',
  }, { backupRoot: path.join(dir, 'backups') });

  const next = fs.readFileSync(target, 'utf8');
  assert.match(next, /existing/);
  assert.match(next, /# >>> botstack:plugin:block/);
  assert.match(next, /managed/);
  assert.ok(result.backupPath);
  assert.equal(fs.readFileSync(result.backupPath, 'utf8'), 'existing\n');
});

test('json.merge deep merges values', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-json-'));
  const target = path.join(dir, 'config.json');
  fs.writeFileSync(target, JSON.stringify({ mcp: { old: true }, keep: true }));

  applyOperation({
    id: 'json',
    type: 'json.merge',
    target,
    value: { mcp: { serena: true } },
  }, { backupRoot: path.join(dir, 'backups') });

  assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), {
    mcp: { old: true, serena: true },
    keep: true,
  });
});
