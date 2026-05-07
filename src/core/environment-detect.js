'use strict';

const os = require('node:os');
const path = require('node:path');

function detectEnvironment(options = {}) {
  const platform = options.platform || os.platform();
  const homeDir = path.resolve(options.homeDir || options.env?.HOME || os.homedir());
  const supported = platform === 'darwin' || platform === 'linux';

  return {
    platform,
    supported,
    homeDir,
    botstackDir: path.join(homeDir, '.botstack'),
    stateDir: path.join(homeDir, '.botstack', 'state'),
    toolsDir: path.join(homeDir, '.botstack', 'tools'),
    harnesses: {
      codex: {
        id: 'codex',
        configPath: path.join(homeDir, '.codex', 'config.toml'),
      },
      opencode: {
        id: 'opencode',
        configPath: path.join(homeDir, '.config', 'opencode', 'opencode.json'),
      },
      claude: {
        id: 'claude',
        configPath: path.join(homeDir, '.claude.json'),
      },
      aider: {
        id: 'aider',
        configPath: path.join(homeDir, '.aider.conf.yml'),
      },
      continue: {
        id: 'continue',
        configPath: path.join(homeDir, '.continue', 'config.json'),
      },
    },
  };
}

module.exports = { detectEnvironment };
