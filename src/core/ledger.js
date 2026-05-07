'use strict';

const fs = require('node:fs');
const path = require('node:path');

class Ledger {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  append(entry) {
    fs.appendFileSync(this.filePath, `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`);
  }

  readAll() {
    if (!fs.existsSync(this.filePath)) return [];
    return fs.readFileSync(this.filePath, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
  }
}

module.exports = { Ledger };
