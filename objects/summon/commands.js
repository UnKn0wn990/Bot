const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const IMAGE_URL = 'https://cdn.discordapp.com/attachments/1504439009492074599/1504441018618216499/image.png?ex=6a06ff62&is=6a05ade2&hm=21f1edc1c872eb96ea5435e3067ae91bf19fc606a78dd43289d60ca500aa5459&';
const EMBED_COLOR = 0x0e592b;

const summon = {
  data: new SlashCommandBuilder()
    .setName('summon')
    .setDescription('Send a royal summons to a user')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to summon').setRequired(true)
    ),
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const invoker = interaction.user;
    const channel = interaction.channel;

    // Build voice channel link (discord.com deep link)
    const channelLink = `https://discord.com/channels/${interaction.guildId}/${channel.id}`;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`Royal Kakro Summons Decree`)
      .setDescription(
        `Issued from the Cucumber Throne of the Great Kakro United,\n\n` +
        `By the divine crunch and everlasting freshness of His Imperial Kakros III, Emperor Kakros III, Supreme Ruler of all Kakro Lands and Eternal Protector of the Imperial Kakros United\n\n` +
        `You are hereby summoned by **${invoker.username}** to appear before the glorious ${channelLink} of Kakro United without delay, by direct command of the Emerald Throne itself.\n\n` +
        `Your presence has been requested in matters of imperial importance, and you are expected to arrive in **${channel.name}**.\n\n` +
        `Signed and sealed by:\nEmperor Kakros III\nLord of Kakro`
      )
      .setImage(IMAGE_URL)
      .setFooter({ text: '🥒 Long live the Kakro United' });

    try {
      await target.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Summons dispatched to ${target.username}!`, ephemeral: true });
    } catch {
      await interaction.reply({ content: `❌ Couldn't DM ${target.username}. They may have DMs disabled.`, ephemeral: true });
    }
  }
};

module.exports = [summon];
