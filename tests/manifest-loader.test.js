'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateManifest } = require('../src/core/manifest-loader');

test('validateManifest accepts a minimal valid manifest', () => {
  const manifest = validateManifest({
    schema_version: 1,
    id: 'demo',
    name: 'Demo',
    summary: 'Demo tool',
    category: 'demo',
    stacks: ['base'],
    harnesses: ['codex'],
    install: [{ id: 'dir', type: 'mkdir', target: '${toolsDir}/demo' }],
    verify: [{ id: 'check', type: 'command', command: 'true' }],
  });

  assert.equal(manifest.id, 'demo');
});

test('validateManifest rejects wrong schema version', () => {
  assert.throws(() => validateManifest({
    schema_version: 2,
    id: 'demo',
    name: 'Demo',
    summary: 'Demo tool',
    category: 'demo',
    stacks: ['base'],
    harnesses: ['codex'],
    install: [],
    verify: [],
  }), /schema_version must be 1/);
});

test('validateManifest rejects unsupported operation type', () => {
  assert.throws(() => validateManifest({
    schema_version: 1,
    id: 'demo',
    name: 'Demo',
    summary: 'Demo tool',
    category: 'demo',
    stacks: ['base'],
    harnesses: ['codex'],
    install: [{ id: 'bad', type: 'shell_magic' }],
    verify: [],
  }), /shell_magic is not supported/);
});
