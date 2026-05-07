'use strict';

function renderPlan(plan) {
  const lines = [];
  lines.push('Botstack install plan');
  lines.push(`Platform: ${plan.environment.platform}${plan.environment.supported ? '' : ' (unsupported)'}`);
  lines.push(`Home: ${plan.environment.homeDir}`);
  lines.push(`Stack: ${plan.selection.stack || 'base'}`);
  lines.push(`Harnesses: ${plan.selection.harnesses.join(', ')}`);
  lines.push('');

  if (plan.errors.length > 0) {
    lines.push('Errors:');
    for (const error of plan.errors) lines.push(`  - ${error}`);
    lines.push('');
  }

  lines.push('Selected tools:');
  for (const plugin of plan.plugins) lines.push(`  - ${plugin.name}: ${plugin.summary}`);
  lines.push('');
  lines.push('Steps:');
  for (const [index, step] of plan.steps.entries()) {
    const marker = step.verify ? 'verify' : 'apply';
    lines.push(`  ${index + 1}. [${marker}] ${step.pluginId} ${step.type} - ${step.description}`);
    if (step.target) lines.push(`     target: ${step.target}`);
    if (step.command) lines.push(`     command: ${step.command}`);
  }
  lines.push('');
  lines.push('Use --plan to inspect this output without writing files.');
  return `${lines.join('\n')}\n`;
}

function renderFinalReport(result) {
  const lines = ['Botstack final report'];
  lines.push(`Verified: ${result.verified.length}`);
  lines.push(`Failed: ${result.failed.length}`);
  for (const failed of result.failed) lines.push(`  - ${failed.step.id}: ${failed.error.message}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

module.exports = { renderPlan, renderFinalReport };
