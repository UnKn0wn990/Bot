const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function getPath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read(name) {
  const p = getPath(name);
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function write(name, data) {
  fs.writeFileSync(getPath(name), JSON.stringify(data, null, 2));
}

module.exports = { read, write };
