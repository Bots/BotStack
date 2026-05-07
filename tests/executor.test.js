'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Writable } = require('node:stream');
const test = require('node:test');
const assert = require('node:assert/strict');
const { detectEnvironment } = require('../src/core/environment-detect');
const { executePlan } = require('../src/core/executor');

function sinkIo() {
  return {
    stdout: new Writable({ write(chunk, enc, cb) { cb(); } }),
    stderr: new Writable({ write(chunk, enc, cb) { cb(); } }),
    env: { PATH: process.env.PATH },
  };
}

test('executePlan writes ledger states for applied and verified steps', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-exec-'));
  const environment = detectEnvironment({ platform: 'linux', homeDir });
  const plan = {
    runId: 'test-run',
    environment,
    steps: [
      {
        id: 'demo:dir',
        pluginId: 'demo',
        type: 'mkdir',
        description: 'make dir',
        target: path.join(environment.toolsDir, 'demo'),
        timeoutMs: 1000,
      },
      {
        id: 'demo:verify',
        pluginId: 'demo',
        type: 'command',
        verify: true,
        description: 'verify',
        command: 'node --version',
        timeoutMs: 1000,
      },
    ],
  };

  const result = await executePlan(plan, sinkIo());

  assert.equal(result.failed.length, 0);
  assert.equal(result.verified.length, 1);
  assert.equal(fs.existsSync(path.join(environment.toolsDir, 'demo')), true);
  const ledger = fs.readFileSync(path.join(environment.stateDir, 'install-ledger.jsonl'), 'utf8');
  assert.match(ledger, /"state":"planned"/);
  assert.match(ledger, /"state":"applied"/);
  assert.match(ledger, /"state":"verified"/);
});

test('executePlan records failed verification without throwing', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-exec-fail-'));
  const environment = detectEnvironment({ platform: 'linux', homeDir });
  const plan = {
    runId: 'test-run',
    environment,
    steps: [
      {
        id: 'demo:verify',
        pluginId: 'demo',
        type: 'command',
        verify: true,
        description: 'verify',
        command: 'node -e "process.exit(7)"',
        timeoutMs: 1000,
      },
    ],
  };

  const result = await executePlan(plan, sinkIo());

  assert.equal(result.failed.length, 1);
  const ledger = fs.readFileSync(path.join(environment.stateDir, 'install-ledger.jsonl'), 'utf8');
  assert.match(ledger, /"state":"failed"/);
});
