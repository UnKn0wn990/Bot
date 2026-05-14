require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, REST, Routes } = require('discord.js');
const { loadObjects } = require('./core/loader');
const fs = require('fs');
const path = require('path');

async function registerCommands() {
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
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log(`✅ Registered ${commands.length} slash commands.`);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

client.once('ready', async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
  await registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction, client);
  } catch (err) {
    console.error(`[Error] Command ${interaction.commandName}:`, err);
    const msg = { content: '❌ Something went wrong.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

(async () => {
  await loadObjects(client);
  await client.login(process.env.BOT_TOKEN);
})();
