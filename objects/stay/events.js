const { createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const store = require('../../core/store');
const { state } = require('./commands');

async function playSound(connection, url) {
  const player = createAudioPlayer();
  const resource = createAudioResource(url);
  connection.subscribe(player);
  player.play(resource);
  return new Promise((resolve) => {
    player.on(AudioPlayerStatus.Idle, resolve);
    player.on('error', resolve);
  });
}

async function playTTS(connection, text) {
  const tmpFile = path.join('/tmp', `tts_${Date.now()}.mp3`);
  // Use espeak to generate TTS audio and pipe through ffmpeg
  return new Promise((resolve) => {
    exec(
      `espeak -v en -s 150 "${text.replace(/"/g, '')}" --stdout | ffmpeg -i pipe:0 -f mp3 ${tmpFile} -y`,
      async (err) => {
        if (err || !fs.existsSync(tmpFile)) {
          console.error('[Stay TTS] espeak/ffmpeg error:', err?.message);
          return resolve();
        }
        const player = createAudioPlayer();
        const resource = createAudioResource(tmpFile, { inputType: StreamType.Arbitrary });
        connection.subscribe(player);
        player.play(resource);
        player.on(AudioPlayerStatus.Idle, () => {
          fs.unlink(tmpFile, () => {});
          resolve();
        });
        player.on('error', () => {
          fs.unlink(tmpFile, () => {});
          resolve();
        });
      }
    );
  });
}

const voiceStateUpdate = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    // Only care about joining
    if (!newState.channelId || newState.channelId === oldState.channelId) return;

    const config = store.read('stay');
    if (!config.channelId || !config.triggerRoleId || !config.mode) return;
    if (!state.connection) return;

    // Must join the stayed channel
    if (newState.channelId !== config.channelId) return;

    const member = newState.member;
    if (!member.roles.cache.has(config.triggerRoleId)) return;

    console.log(`[Stay] ${member.user.tag} (trigger role) joined stayed VC — playing ${config.mode}`);

    if (config.mode === 'sound' && config.soundUrl) {
      await playSound(state.connection, config.soundUrl);
    } else if (config.mode === 'tts' && config.ttsMessage) {
      await playTTS(state.connection, config.ttsMessage);
    }
  }
};

module.exports = [voiceStateUpdate];
