const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} = require('@discordjs/voice');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const store = require('../../core/store');
const { state } = require('./commands');

// Stream a URL through ffmpeg and play it
async function playSound(connection, url) {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', url,
      '-analyzeduration', '0',
      '-loglevel', '0',
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1'
    ]);

    const player = createAudioPlayer();
    const resource = createAudioResource(ffmpeg.stdout, {
      inputType: StreamType.Raw,
    });

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, resolve);
    player.on('error', (err) => {
      console.error('[Stay Sound] Player error:', err.message);
      resolve();
    });
    ffmpeg.on('error', (err) => {
      console.error('[Stay Sound] ffmpeg error:', err.message);
      resolve();
    });
  });
}

// TTS using Google Translate TTS (no install needed)
async function playTTS(connection, text) {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=en&client=tw-ob`;
  return playSound(connection, url);
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

    console.log(`[Stay] ${member.user.tag} joined stayed VC — playing ${config.mode}`);

    if (config.mode === 'sound' && config.soundUrl) {
      await playSound(state.connection, config.soundUrl);
    } else if (config.mode === 'tts' && config.ttsMessage) {
      await playTTS(state.connection, config.ttsMessage);
    }
  }
};

module.exports = [voiceStateUpdate];
