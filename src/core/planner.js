'use strict';

const { selectPlugins } = require('./plugin-registry');

function buildPlan({ plugins, environment, selection }) {
  const selectedPlugins = selectPlugins(plugins, selection);
  const errors = [];
  const requestedTools = new Set(selection.tools || []);
  const foundTools = new Set(selectedPlugins.map((plugin) => plugin.id));
  const harnesses = selection.harnesses?.length ? selection.harnesses : ['codex'];

  if (!environment.supported) errors.push(`Unsupported platform: ${environment.platform}`);
  for (const tool of requestedTools) {
    if (!foundTools.has(tool)) errors.push(`Unknown tool: ${tool}`);
  }
  for (const harness of harnesses) {
    if (!environment.harnesses[harness]) errors.push(`Unknown harness: ${harness}`);
  }

  const steps = [];
  for (const plugin of selectedPlugins) {
    for (const operation of plugin.install) {
      if (!appliesToHarness(operation, harnesses)) continue;
      steps.push(stepFor(plugin, operation, environment, harnesses));
    }
    for (const operation of plugin.verify) {
      if (!appliesToHarness(operation, harnesses)) continue;
      steps.push(stepFor(plugin, operation, environment, harnesses, true));
    }
  }

  return {
    runId: `run-${Date.now()}`,
    environment,
    selection: { ...selection, harnesses },
    plugins: selectedPlugins,
    steps,
    errors,
  };
}

function appliesToHarness(operation, harnesses) {
  if (!operation.harnesses || operation.harnesses.length === 0) return true;
  return operation.harnesses.some((harness) => harnesses.includes(harness));
}

function stepFor(plugin, operation, environment, harnesses, verify = false) {
  return {
    id: `${plugin.id}:${operation.id}`,
    pluginId: plugin.id,
    pluginName: plugin.name,
    verify,
    type: operation.type,
    description: operation.description || operation.id,
    timeoutMs: operation.timeout_ms || (verify ? 30000 : 120000),
    target: expandValue(operation.target, environment, harnesses),
    value: expandValue(operation.value, environment, harnesses),
    command: expandValue(operation.command, environment, harnesses),
    rollback: operation.rollback || [],
  };
}

function expandValue(value, environment, harnesses) {
  if (typeof value === 'string') {
    return value
      .replaceAll('${home}', environment.homeDir)
      .replaceAll('${botstackDir}', environment.botstackDir)
      .replaceAll('${toolsDir}', environment.toolsDir)
      .replaceAll('${stateDir}', environment.stateDir)
      .replaceAll('${harnesses}', harnesses.join(','));
  }
  if (Array.isArray(value)) return value.map((item) => expandValue(item, environment, harnesses));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, expandValue(item, environment, harnesses)]));
  }
  return value;
}

module.exports = { buildPlan, expandValue, appliesToHarness };
