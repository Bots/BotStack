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
  assert.equal(result.skipped.length, 0);
  const ledger = fs.readFileSync(path.join(environment.stateDir, 'install-ledger.jsonl'), 'utf8');
  assert.match(ledger, /"state":"failed"/);
});

test('executePlan runs commands with selected home as HOME', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-exec-home-'));
  const environment = detectEnvironment({ platform: 'linux', homeDir });
  const marker = path.join(homeDir, 'home-marker');
  const plan = {
    runId: 'test-run',
    environment,
    steps: [
      {
        id: 'demo:home',
        pluginId: 'demo',
        type: 'command',
        description: 'write home marker',
        command: 'node -e "const fs = require(\\"fs\\"); fs.writeFileSync(process.env.HOME + \\"/home-marker\\", process.env.HOME); if (!process.env.PATH.includes(process.env.HOME + \\"/.bun/bin\\")) process.exit(9);"',
        timeoutMs: 1000,
      },
    ],
  };

  const result = await executePlan(plan, sinkIo());

  assert.equal(result.failed.length, 0);
  assert.equal(fs.readFileSync(marker, 'utf8'), homeDir);
});

test('executePlan skips remaining steps for failed plugin only', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-exec-skip-'));
  const environment = detectEnvironment({ platform: 'linux', homeDir });
  const skippedTarget = path.join(environment.botstackDir, 'failed-plugin.txt');
  const otherTarget = path.join(environment.botstackDir, 'other-plugin.txt');
  const plan = {
    runId: 'test-run',
    environment,
    steps: [
      {
        id: 'failed:install',
        pluginId: 'failed',
        type: 'command',
        description: 'fail install',
        command: 'node -e "process.exit(5)"',
        timeoutMs: 1000,
      },
      {
        id: 'failed:config',
        pluginId: 'failed',
        type: 'append_managed_block',
        description: 'write config',
        target: skippedTarget,
        value: 'should not be written',
        timeoutMs: 1000,
      },
      {
        id: 'other:config',
        pluginId: 'other',
        type: 'append_managed_block',
        description: 'write other config',
        target: otherTarget,
        value: 'other plugin still runs',
        timeoutMs: 1000,
      },
    ],
  };

  const result = await executePlan(plan, sinkIo());

  assert.equal(result.failed.length, 1);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].step.id, 'failed:config');
  assert.equal(fs.existsSync(skippedTarget), false);
  assert.match(fs.readFileSync(otherTarget, 'utf8'), /other plugin still runs/);
  const ledger = fs.readFileSync(path.join(environment.stateDir, 'install-ledger.jsonl'), 'utf8');
  assert.match(ledger, /"operationId":"failed:config","state":"skipped"/);
  assert.match(ledger, /"operationId":"other:config","state":"applied"/);
});
