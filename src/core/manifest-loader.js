'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SUPPORTED_SCHEMA_VERSION = 1;

function readManifest(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return validateManifest(JSON.parse(raw), filePath);
}

function validateManifest(manifest, source = '<memory>') {
  const errors = [];
  const requireString = (field) => {
    if (typeof manifest[field] !== 'string' || manifest[field].trim() === '') errors.push(`${field} must be a non-empty string`);
  };

  if (manifest.schema_version !== SUPPORTED_SCHEMA_VERSION) errors.push(`schema_version must be ${SUPPORTED_SCHEMA_VERSION}`);
  requireString('id');
  requireString('name');
  requireString('summary');
  if (!Array.isArray(manifest.install)) errors.push('install must be an array of operations');
  if (!Array.isArray(manifest.verify)) errors.push('verify must be an array of operations');
  if (!Array.isArray(manifest.harnesses) || manifest.harnesses.some((item) => typeof item !== 'string' || item.trim() === '')) {
    errors.push('harnesses must be an array of non-empty strings');
  }

  for (const [index, operation] of (manifest.install || []).entries()) validateOperation(operation, `install[${index}]`, errors);
  for (const [index, operation] of (manifest.verify || []).entries()) validateOperation(operation, `verify[${index}]`, errors);

  if (errors.length > 0) {
    const error = new Error(`Invalid manifest ${source}: ${errors.join('; ')}`);
    error.code = 'INVALID_MANIFEST';
    throw error;
  }

  return Object.freeze({ ...manifest, source });
}

function validateOperation(operation, label, errors) {
  if (!operation || typeof operation !== 'object') {
    errors.push(`${label} must be an object`);
    return;
  }
  if (typeof operation.id !== 'string' || operation.id.trim() === '') errors.push(`${label}.id must be a non-empty string`);
  if (typeof operation.type !== 'string' || operation.type.trim() === '') errors.push(`${label}.type must be a non-empty string`);
  if (operation.harnesses !== undefined && (!Array.isArray(operation.harnesses) || operation.harnesses.some((item) => typeof item !== 'string' || item.trim() === ''))) {
    errors.push(`${label}.harnesses must be an array of non-empty strings`);
  }

  const supported = new Set(['mkdir', 'command', 'append_managed_block', 'toml.merge', 'json.merge']);
  if (operation.type && !supported.has(operation.type)) errors.push(`${label}.type ${operation.type} is not supported`);
}

function loadManifests(directory) {
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => readManifest(path.join(directory, file)));
}

module.exports = { SUPPORTED_SCHEMA_VERSION, loadManifests, readManifest, validateManifest };
