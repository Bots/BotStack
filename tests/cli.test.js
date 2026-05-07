'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Writable, Readable } = require('node:stream');
const test = require('node:test');
const assert = require('node:assert/strict');
const { runCli } = require('../src/cli');

function captureIo(homeDir) {
  let stdout = '';
  let stderr = '';
  return {
    io: {
      stdin: Readable.from([]),
      stdout: new Writable({ write(chunk, enc, cb) { stdout += chunk.toString(); cb(); } }),
      stderr: new Writable({ write(chunk, enc, cb) { stderr += chunk.toString(); cb(); } }),
      env: { HOME: homeDir, PATH: process.env.PATH },
    },
    get stdout() { return stdout; },
    get stderr() { return stderr; },
  };
}

test('install --plan prints plan and does not write to fake home', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-home-'));
  const capture = captureIo(homeDir);

  const code = await runCli(['install', '--plan', '--stack', 'base', '--harness', 'codex', '--home', homeDir], capture.io);

  assert.equal(code, 0);
  assert.match(capture.stdout, /Botstack install plan/);
  assert.match(capture.stdout, /Use --plan to inspect this output without writing files/);
  assert.equal(fs.existsSync(path.join(homeDir, '.botstack')), false);
});

test('docs generate writes manifest reference docs', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-home-'));
  const outDir = path.join(homeDir, 'docs');
  const capture = captureIo(homeDir);

  const code = await runCli(['docs', 'generate', '--out', outDir], capture.io);

  assert.equal(code, 0);
  assert.match(fs.readFileSync(path.join(outDir, 'tools.md'), 'utf8'), /GStack/);
  assert.match(fs.readFileSync(path.join(outDir, 'verification.md'), 'utf8'), /GBrain/);
  assert.match(fs.readFileSync(path.join(outDir, 'support-matrix.md'), 'utf8'), /Codex CLI/);
});

test('tools command lists tool and harness support', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-home-'));
  const capture = captureIo(homeDir);

  const code = await runCli(['tools'], capture.io);

  assert.equal(code, 0);
  assert.match(capture.stdout, /gstack/);
  assert.match(capture.stdout, /harnesses: codex, opencode, claude/);
});

test('install refuses deprecated --yes flag', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-home-'));
  const capture = captureIo(homeDir);

  const code = await runCli(['install', '--yes', '--stack', 'base', '--harness', 'codex', '--home', homeDir], capture.io);

  assert.equal(code, 2);
  assert.match(capture.stderr, /deprecated --yes/);
});

test('install refuses execution without --install', async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'botstack-home-'));
  const capture = captureIo(homeDir);

  const code = await runCli(['install', '--stack', 'base', '--harness', 'codex', '--home', homeDir], capture.io);

  assert.equal(code, 2);
  assert.match(capture.stderr, /without --install/);
});
