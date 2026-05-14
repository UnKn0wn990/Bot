const { SlashCommandBuilder } = require('discord.js');
const store = require('../../core/store');

const summon = {
  data: new SlashCommandBuilder()
    .setName('summon')
    .setDescription('DM a user with the summon message')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to summon').setRequired(true)
    ),
  async execute(interaction) {
    const config = store.read('summon');
    const message = config.message;

    if (!message) {
      return interaction.reply({ content: '❌ No summon message set. Use `/setsummonmsg` first.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');

    try {
      await target.send(message);
      await interaction.reply({ content: `✅ Summoned ${target.username}!`, ephemeral: true });
    } catch {
      await interaction.reply({ content: `❌ Couldn't DM ${target.username}. They may have DMs disabled.`, ephemeral: true });
    }
  }
};

const setsummonmsg = {
  data: new SlashCommandBuilder()
    .setName('setsummonmsg')
    .setDescription('Set the message sent when summoning a user')
    .addStringOption(opt =>
      opt.setName('message').setDescription('The DM message to send').setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const config = store.read('summon');
    config.message = message;
    store.write('summon', config);
    await interaction.reply({ content: `✅ Summon message set to:\n> ${message}`, ephemeral: true });
  }
};

module.exports = [summon, setsummonmsg];
