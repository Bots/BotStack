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
    harnesses: ['codex'],
    install: [{ id: 'dir', type: 'mkdir', target: '${toolsDir}/base-tool' }],
    verify: [{ id: 'check', type: 'command', command: 'true' }],
  },
  {
    id: 'extra-tool',
    name: 'Extra Tool',
    summary: 'Extra',
    stacks: ['everything'],
    harnesses: ['codex'],
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

test('buildPlan includes only operations matching selected harnesses', () => {
  const environment = detectEnvironment({ platform: 'linux', homeDir: '/tmp/home' });
  const plan = buildPlan({
    plugins: [{
      id: 'multi',
      name: 'Multi',
      summary: 'Multi',
      stacks: ['base'],
      harnesses: ['codex', 'opencode'],
      install: [
        { id: 'dir', type: 'mkdir', target: '${toolsDir}/multi' },
        { id: 'codex', type: 'toml.merge', harnesses: ['codex'], target: '${home}/.codex/config.toml', value: { enabled: true } },
        { id: 'opencode', type: 'json.merge', harnesses: ['opencode'], target: '${home}/.config/opencode/opencode.json', value: { enabled: true } },
      ],
      verify: [],
    }],
    environment,
    selection: { stack: 'base', tools: [], harnesses: ['opencode'] },
  });

  assert.deepEqual(plan.steps.map((step) => step.id), ['multi:dir', 'multi:opencode']);
  assert.equal(plan.steps.some((step) => step.target.includes('.codex')), false);
});

test('buildPlan reports selected plugin harness mismatches', () => {
  const environment = detectEnvironment({ platform: 'linux', homeDir: '/tmp/home' });
  const plan = buildPlan({
    plugins,
    environment,
    selection: { stack: 'base', tools: [], harnesses: ['opencode'] },
  });

  assert.deepEqual(plan.errors, ['Base Tool does not support harness: opencode']);
  assert.deepEqual(plan.steps, []);
});
