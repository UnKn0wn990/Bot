const fs = require('fs');
const path = require('path');

async function loadObjects(client) {
  const objectsDir = path.join(__dirname, '..', 'objects');
  const folders = fs.readdirSync(objectsDir);

  for (const folder of folders) {
    const indexPath = path.join(objectsDir, folder, 'index.js');
    if (!fs.existsSync(indexPath)) continue;

    const obj = require(indexPath);

    // Register commands into client.commands map
    if (obj.commands) {
      for (const cmd of obj.commands) {
        client.commands.set(cmd.data.name, cmd);
      }
    }

    // Register event listeners
    if (obj.events) {
      for (const event of obj.events) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
      }
    }

    console.log(`[Loader] Loaded object: ${folder}`);
  }
}

module.exports = { loadObjects };
