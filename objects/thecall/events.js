const store = require('../../core/store');

// Helper: resolve role by name or ID
function resolveRole(guild, nameOrId) {
  return guild.roles.cache.find(r => r.id === nameOrId || r.name.toLowerCase() === nameOrId.toLowerCase());
}

// Helper: resolve channel by name or ID
function resolveChannel(guild, nameOrId) {
  return guild.channels.cache.find(c => c.id === nameOrId || c.name.toLowerCase() === nameOrId.toLowerCase());
}

const voiceStateUpdate = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    // Only care about joining a channel
    if (!newState.channelId || newState.channelId === oldState.channelId) return;

    const guild = newState.guild;
    const member = newState.member;
    const joinedChannel = newState.channel;

    await guild.members.fetch(); // ensure cache is populated

    const calls = store.read('calls');

    for (const [name, cfg] of Object.entries(calls)) {
      // Check joining role
      const joiningRole = resolveRole(guild, cfg.joiningRole);
      if (!joiningRole || !member.roles.cache.has(joiningRole.id)) continue;

      // Check channel match
      const channelMatch = cfg.channels.includes('all') ||
        cfg.channels.some(ch => {
          const resolved = resolveChannel(guild, ch);
          return resolved && resolved.id === joinedChannel.id;
        });
      if (!channelMatch) continue;

      // Get calling role members and DM them all
      const callingRole = resolveRole(guild, cfg.callingRole);
      if (!callingRole) continue;

      const targets = guild.members.cache.filter(m => m.roles.cache.has(callingRole.id));

      for (const [, target] of targets) {
        try {
          await target.send(cfg.message);
        } catch {
          // DMs may be closed, silently skip
        }
      }

      console.log(`[TheCall] "${name}" triggered by ${member.user.tag} joining ${joinedChannel.name}. DMed ${targets.size} members.`);
    }
  }
};

const modalSubmit = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('setcall_modal:')) return;

    const name = interaction.customId.split(':')[1];
    const joiningRole = interaction.fields.getTextInputValue('joiningRole').trim();
    const channelsRaw = interaction.fields.getTextInputValue('channels').trim();
    const callingRole = interaction.fields.getTextInputValue('callingRole').trim();
    const message = interaction.fields.getTextInputValue('message').trim();

    const channels = channelsRaw.toLowerCase() === 'all'
      ? ['all']
      : channelsRaw.split(',').map(s => s.trim()).filter(Boolean);

    const calls = store.read('calls');
    calls[name] = { joiningRole, channels, callingRole, message };
    store.write('calls', calls);

    await interaction.reply({
      content: `✅ Call \`${name}\` saved!\n` +
        `Joining role: \`${joiningRole}\` → Channels: \`${channels.join(', ')}\` → DMs: \`${callingRole}\``,
      ephemeral: true
    });
  }
};

module.exports = [voiceStateUpdate, modalSubmit];
