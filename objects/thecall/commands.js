const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const store = require('../../core/store');

const setcall = {
  data: new SlashCommandBuilder()
    .setName('setcall')
    .setDescription('Create or update a call configuration')
    .addStringOption(opt =>
      opt.setName('name').setDescription('Unique name for this call').setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const existing = store.read('calls')[name] || {};

    const modal = new ModalBuilder()
      .setCustomId(`setcall_modal:${name}`)
      .setTitle(`Configure Call: ${name}`);

    const joiningRole = new TextInputBuilder()
      .setCustomId('joiningRole')
      .setLabel('Joining Role (name or ID)')
      .setStyle(TextInputStyle.Short)
      .setValue(existing.joiningRole || '')
      .setRequired(true);

    const channels = new TextInputBuilder()
      .setCustomId('channels')
      .setLabel('Voice Channel(s) — names/IDs, comma sep, or "all"')
      .setStyle(TextInputStyle.Short)
      .setValue(existing.channels ? existing.channels.join(', ') : '')
      .setRequired(true);

    const callingRole = new TextInputBuilder()
      .setCustomId('callingRole')
      .setLabel('Calling Role — members to DM (name or ID)')
      .setStyle(TextInputStyle.Short)
      .setValue(existing.callingRole || '')
      .setRequired(true);

    const message = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Message to DM them')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(existing.message || '')
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(joiningRole),
      new ActionRowBuilder().addComponents(channels),
      new ActionRowBuilder().addComponents(callingRole),
      new ActionRowBuilder().addComponents(message),
    );

    await interaction.showModal(modal);
  }
};

const deletecall = {
  data: new SlashCommandBuilder()
    .setName('deletecall')
    .setDescription('Delete a call configuration')
    .addStringOption(opt =>
      opt.setName('name').setDescription('Name of the call to delete').setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const calls = store.read('calls');
    if (!calls[name]) {
      return interaction.reply({ content: `❌ No call named \`${name}\` found.`, ephemeral: true });
    }
    delete calls[name];
    store.write('calls', calls);
    await interaction.reply({ content: `✅ Deleted call \`${name}\`.`, ephemeral: true });
  }
};

const listcalls = {
  data: new SlashCommandBuilder()
    .setName('listcalls')
    .setDescription('List all configured calls'),
  async execute(interaction) {
    const calls = store.read('calls');
    const entries = Object.entries(calls);
    if (!entries.length) {
      return interaction.reply({ content: '📋 No calls configured yet.', ephemeral: true });
    }
    const lines = entries.map(([name, cfg]) =>
      `**${name}**\n` +
      `  Joining role: \`${cfg.joiningRole}\`\n` +
      `  Channels: \`${cfg.channels.join(', ')}\`\n` +
      `  Calling role: \`${cfg.callingRole}\`\n` +
      `  Message: ${cfg.message}`
    );
    await interaction.reply({ content: lines.join('\n\n'), ephemeral: true });
  }
};

module.exports = [setcall, deletecall, listcalls];
