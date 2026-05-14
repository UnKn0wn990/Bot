require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const objectsDir = path.join(__dirname, 'objects');

for (const folder of fs.readdirSync(objectsDir)) {
  const indexPath = path.join(objectsDir, folder, 'index.js');
  if (!fs.existsSync(indexPath)) continue;
  const obj = require(indexPath);
  if (obj.commands) {
    for (const cmd of obj.commands) {
      commands.push(cmd.data.toJSON());
    }
  }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  console.log(`Registering ${commands.length} slash commands...`);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Commands registered!');
})();
