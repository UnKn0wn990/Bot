const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const store = require('../../core/store');

// Shared connection reference across commands
const state = { connection: null };

const stay = {
  data: new SlashCommandBuilder()
    .setName('stay')
    .setDescription('Bot joins and stays in a voice channel')
    .addStringOption(opt =>
      opt.setName('channel').setDescription('Voice channel name or ID').setRequired(true)
    ),
  async execute(interaction, client) {
    const nameOrId = interaction.options.getString('channel');
    const guild = interaction.guild;
    const channel = guild.channels.cache.find(
      c => (c.id === nameOrId || c.name.toLowerCase() === nameOrId.toLowerCase()) && c.isVoiceBased()
    );

    if (!channel) {
      return interaction.reply({ content: `❌ Voice channel \`${nameOrId}\` not found.`, ephemeral: true });
    }

    if (state.connection) {
      state.connection.destroy();
      state.connection = null;
    }

    state.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    state.connection.on(VoiceConnectionStatus.Disconnected, () => {
      state.connection = null;
    });

    const config = store.read('stay');
    config.channelId = channel.id;
    config.channelName = channel.name;
    store.write('stay', config);

    await interaction.reply({ content: `✅ Now staying in **${channel.name}**.`, ephemeral: true });
  }
};

const unstay = {
  data: new SlashCommandBuilder()
    .setName('unstay')
    .setDescription('Bot leaves the stayed voice channel'),
  async execute(interaction) {
    if (state.connection) {
      state.connection.destroy();
      state.connection = null;

      const config = store.read('stay');
      delete config.channelId;
      delete config.channelName;
      store.write('stay', config);

      return interaction.reply({ content: '✅ Left the voice channel.', ephemeral: true });
    }
    await interaction.reply({ content: '❌ Bot is not in any channel.', ephemeral: true });
  }
};

const stayrole = {
  data: new SlashCommandBuilder()
    .setName('stayrole')
    .setDescription('Set the role that triggers sound/TTS when joining the stayed VC')
    .addRoleOption(opt =>
      opt.setName('role').setDescription('The role to watch for').setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const config = store.read('stay');
    config.triggerRoleId = role.id;
    config.triggerRoleName = role.name;
    store.write('stay', config);
    await interaction.reply({ content: `✅ Trigger role set to **${role.name}**.`, ephemeral: true });
  }
};

const staysound = {
  data: new SlashCommandBuilder()
    .setName('staysound')
    .setDescription('Set the sound URL to play when the trigger role joins')
    .addStringOption(opt =>
      opt.setName('url').setDescription('Direct URL to an audio file').setRequired(true)
    ),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    const config = store.read('stay');
    config.soundUrl = url;
    store.write('stay', config);
    await interaction.reply({ content: `✅ Sound URL set.`, ephemeral: true });
  }
};

const staytts = {
  data: new SlashCommandBuilder()
    .setName('staytts')
    .setDescription('Set the TTS message to speak when the trigger role joins')
    .addStringOption(opt =>
      opt.setName('message').setDescription('Text to speak').setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const config = store.read('stay');
    config.ttsMessage = message;
    store.write('stay', config);
    await interaction.reply({ content: `✅ TTS message set to: "${message}"`, ephemeral: true });
  }
};

const staymode = {
  data: new SlashCommandBuilder()
    .setName('staymode')
    .setDescription('Set whether to play sound or TTS when trigger role joins')
    .addStringOption(opt =>
      opt.setName('mode')
        .setDescription('Choose mode')
        .setRequired(true)
        .addChoices(
          { name: 'Sound file', value: 'sound' },
          { name: 'TTS (text-to-speech)', value: 'tts' },
        )
    ),
  async execute(interaction) {
    const mode = interaction.options.getString('mode');
    const config = store.read('stay');
    config.mode = mode;
    store.write('stay', config);
    await interaction.reply({ content: `✅ Mode set to **${mode}**.`, ephemeral: true });
  }
};

module.exports = { commands: [stay, unstay, stayrole, staysound, staytts, staymode], state };
