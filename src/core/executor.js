'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { applyOperation } = require('./config-ops');
const { Ledger } = require('./ledger');

async function executePlan(plan, io) {
  const ledger = new Ledger(path.join(plan.environment.stateDir, 'install-ledger.jsonl'));
  const backupRoot = path.join(plan.environment.stateDir, 'backups', plan.runId);
  const verified = [];
  const failed = [];

  for (const step of plan.steps) {
    const startedAt = Date.now();
    ledger.append(entryFor(plan, step, 'planned'));
    try {
      let detail;
      if (step.type === 'command') {
        detail = await runCommand(step, io);
      } else {
        detail = applyOperation(step, { backupRoot });
      }
      const durationMs = Date.now() - startedAt;
      ledger.append(entryFor(plan, step, step.verify ? 'verified' : 'applied', { durationMs, detail }));
      if (step.verify) verified.push(step);
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      ledger.append(entryFor(plan, step, 'failed', { durationMs, error: error.message }));
      failed.push({ step, error });
    }
  }

  return { verified, failed, ledgerPath: ledger.filePath };
}

function entryFor(plan, step, state, extra = {}) {
  return {
    runId: plan.runId,
    pluginId: step.pluginId,
    operationId: step.id,
    state,
    target: step.target || null,
    command: step.command || null,
    ...extra,
  };
}

function runCommand(step, io) {
  return new Promise((resolve, reject) => {
    io.stdout.write(`Running ${step.id}: ${step.command}\n`);
    const child = spawn(step.command, { shell: true, stdio: ['ignore', 'pipe', 'pipe'], env: io.env });
    let output = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${step.timeoutMs}ms`));
    }, step.timeoutMs);

    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
      io.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
      io.stderr.write(chunk);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ exitCode: code, output });
      else reject(new Error(`Command exited with ${code}`));
    });
  });
}

module.exports = { executePlan, runCommand };
