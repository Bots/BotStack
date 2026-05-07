'use strict';

const path = require('node:path');
const readline = require('node:readline/promises');
const { detectEnvironment } = require('./core/environment-detect');
const { loadPlugins } = require('./core/plugin-registry');
const { buildPlan } = require('./core/planner');
const { executePlan } = require('./core/executor');
const { writeReferenceDocs } = require('./core/docs-generator');
const { renderPlan, renderFinalReport } = require('./core/reporter');

function parseArgs(argv) {
  const args = { command: 'install', planOnly: false, install: false, verbose: false, stack: null, tools: [], harnesses: [], homeDir: null, docsOut: null };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--plan') args.planOnly = true;
    else if (arg === '--install') args.install = true;
    else if (arg === '--yes' || arg === '-y') args.deprecatedYes = true;
    else if (arg === '--verbose') args.verbose = true;
    else if (arg === '--stack') args.stack = argv[++index];
    else if (arg === '--tool') args.tools.push(argv[++index]);
    else if (arg === '--harness') args.harnesses.push(argv[++index]);
    else if (arg === '--home') args.homeDir = argv[++index];
    else if (arg === '--out') args.docsOut = argv[++index];
    else if (arg === '--help' || arg === '-h') args.command = 'help';
    else positional.push(arg);
  }

  if (positional[0] === 'docs' && positional[1] === 'generate') args.command = 'docs-generate';
  else if (positional[0] === 'tools') args.command = 'tools';
  else if (positional[0]) args.command = positional[0];

  return args;
}

function usage() {
  return [
    'Usage:',
    '  botstack install --plan [--stack base|everything] [--tool id] [--harness id] [--home path]',
    '  botstack install --install [--stack base|everything] [--tool id] [--harness id] [--home path]',
    '  botstack tools',
    '  botstack docs generate [--out docs/generated]',
    '',
    'Examples:',
    '  botstack tools',
    '  botstack install --plan --stack base --harness codex',
    '  botstack install --plan --tool gbrain --tool serena --harness codex',
  ].join('\n');
}

async function promptForSelection(args, plugins, io) {
  if (args.stack || args.tools.length > 0 || args.install || args.deprecatedYes || !io.stdin.isTTY) {
    return {
      stack: args.stack || (args.tools.length > 0 ? 'custom' : 'base'),
      tools: args.tools,
      harnesses: args.harnesses.length > 0 ? args.harnesses : ['codex'],
    };
  }

  const rl = readline.createInterface({ input: io.stdin, output: io.stdout });
  const stack = (await rl.question('Stack (base/everything/custom) [base]: ')).trim() || 'base';
  let tools = [];
  if (stack === 'custom') {
    const available = plugins.map((plugin) => plugin.id).join(', ');
    const answer = await rl.question(`Tools (${available}): `);
    tools = answer.split(',').map((item) => item.trim()).filter(Boolean);
  }
  const harnessAnswer = (await rl.question('Harnesses [codex]: ')).trim();
  rl.close();

  return {
    stack,
    tools,
    harnesses: harnessAnswer ? harnessAnswer.split(',').map((item) => item.trim()).filter(Boolean) : ['codex'],
  };
}

async function runCli(argv, io) {
  const args = parseArgs(argv);
  if (args.command === 'help') {
    io.stdout.write(`${usage()}\n`);
    return 0;
  }

  const rootDir = path.resolve(__dirname, '..');
  const plugins = loadPlugins(path.join(rootDir, 'src', 'plugins'));

  if (args.command === 'tools') {
    io.stdout.write(renderToolsList(plugins));
    return 0;
  }

  if (args.command === 'docs-generate') {
    const outputDir = path.resolve(args.docsOut || path.join(rootDir, 'docs', 'generated'));
    const files = writeReferenceDocs(plugins, outputDir);
    io.stdout.write(`Generated ${files.length} docs files in ${outputDir}\n`);
    return 0;
  }

  if (args.command !== 'install') {
    io.stderr.write(`Unknown command: ${args.command}\n\n${usage()}\n`);
    return 2;
  }
  if (args.deprecatedYes) {
    io.stderr.write('Refusing to execute with deprecated --yes. Use --install after reviewing --plan.\n');
    return 2;
  }

  const environment = detectEnvironment({ env: io.env, homeDir: args.homeDir });
  const selection = await promptForSelection(args, plugins, io);
  const plan = buildPlan({ plugins, environment, selection });
  io.stdout.write(renderPlan(plan));

  if (args.planOnly) return plan.errors.length > 0 ? 2 : 0;
  if (plan.errors.length > 0) return 2;
  if (!args.install) {
    io.stderr.write('Refusing to execute without --install. Use --plan to inspect first.\n');
    return 2;
  }

  const result = await executePlan(plan, { env: io.env, stdout: io.stdout, stderr: io.stderr });
  io.stdout.write(renderFinalReport(result));
  return result.failed.length > 0 ? 1 : 0;
}

function renderToolsList(plugins) {
  const harnesses = [...new Set(plugins.flatMap((plugin) => plugin.harnesses || []))].sort();
  const lines = ['Botstack tools', ''];
  for (const plugin of plugins) {
    lines.push(`${plugin.id}`);
    lines.push(`  name: ${plugin.name}`);
    lines.push(`  summary: ${plugin.summary}`);
    lines.push(`  stacks: ${(plugin.stacks || []).join(', ')}`);
    lines.push(`  harnesses: ${(plugin.harnesses || []).join(', ')}`);
    lines.push('');
  }
  lines.push(`Harnesses: ${harnesses.join(', ')}`);
  return `${lines.join('\n')}\n`;
}

module.exports = { parseArgs, runCli, renderToolsList };
