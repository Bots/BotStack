'use strict';

const path = require('node:path');
const { loadManifests } = require('./manifest-loader');

function loadPlugins(pluginsDir) {
  return loadManifests(pluginsDir || path.join(__dirname, '..', 'plugins'));
}

function selectPlugins(plugins, selection) {
  if (selection.stack === 'everything') return plugins;
  if (selection.stack === 'custom' || selection.tools.length > 0) {
    const requested = new Set(selection.tools);
    return plugins.filter((plugin) => requested.has(plugin.id));
  }

  return plugins.filter((plugin) => plugin.stacks?.includes('base'));
}

module.exports = { loadPlugins, selectPlugins };
