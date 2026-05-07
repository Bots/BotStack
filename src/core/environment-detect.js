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
    cacheDir: path.join(homeDir, '.botstack', 'cache'),
    stateDir: path.join(homeDir, '.botstack', 'state'),
    toolsDir: path.join(homeDir, '.botstack', 'tools'),
    installs: {
      gstack: path.join(homeDir, 'gstack'),
      gbrain: path.join(homeDir, 'gbrain'),
    },
    harnesses: {
      codex: {
        id: 'codex',
        configPath: path.join(homeDir, '.codex', 'config.toml'),
        skillsDir: path.join(homeDir, '.codex', 'skills'),
      },
      opencode: {
        id: 'opencode',
        configPath: path.join(homeDir, '.config', 'opencode', 'opencode.json'),
        skillsDir: path.join(homeDir, '.config', 'opencode', 'skills'),
      },
      claude: {
        id: 'claude',
        configPath: path.join(homeDir, '.claude.json'),
        skillsDir: path.join(homeDir, '.claude', 'skills'),
      },
      aider: {
        id: 'aider',
        configPath: path.join(homeDir, '.aider.conf.yml'),
        skillsDir: null,
      },
      continue: {
        id: 'continue',
        configPath: path.join(homeDir, '.continue', 'config.json'),
        skillsDir: null,
      },
    },
  };
}

module.exports = { detectEnvironment };
