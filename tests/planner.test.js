'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { detectEnvironment } = require('../src/core/environment-detect');
const { buildPlan } = require('../src/core/planner');

const plugins = [
  {
    id: 'base-tool',
    name: 'Base Tool',
    summary: 'Base',
    stacks: ['base', 'everything'],
    install: [{ id: 'dir', type: 'mkdir', target: '${toolsDir}/base-tool' }],
    verify: [{ id: 'check', type: 'command', command: 'true' }],
  },
  {
    id: 'extra-tool',
    name: 'Extra Tool',
    summary: 'Extra',
    stacks: ['everything'],
    install: [{ id: 'dir', type: 'mkdir', target: '${toolsDir}/extra-tool' }],
    verify: [],
  },
];

test('buildPlan selects base stack by default', () => {
  const environment = detectEnvironment({ platform: 'linux', homeDir: '/tmp/home' });
  const plan = buildPlan({ plugins, environment, selection: { stack: 'base', tools: [], harnesses: ['codex'] } });

  assert.deepEqual(plan.plugins.map((plugin) => plugin.id), ['base-tool']);
  assert.equal(plan.errors.length, 0);
  assert.match(plan.steps[0].target, /\/tmp\/home\/\.botstack\/tools\/base-tool/);
});

test('buildPlan selects everything stack', () => {
  const environment = detectEnvironment({ platform: 'linux', homeDir: '/tmp/home' });
  const plan = buildPlan({ plugins, environment, selection: { stack: 'everything', tools: [], harnesses: ['codex'] } });

  assert.deepEqual(plan.plugins.map((plugin) => plugin.id), ['base-tool', 'extra-tool']);
});

test('buildPlan reports unknown harness and tool', () => {
  const environment = detectEnvironment({ platform: 'linux', homeDir: '/tmp/home' });
  const plan = buildPlan({ plugins, environment, selection: { stack: 'custom', tools: ['missing'], harnesses: ['missing-harness'] } });

  assert.deepEqual(plan.errors, ['Unknown tool: missing', 'Unknown harness: missing-harness']);
});
