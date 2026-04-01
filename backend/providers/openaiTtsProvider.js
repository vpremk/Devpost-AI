/**
 * OpenAI TTS Provider Stub
 * 
 * To use real OpenAI TTS (with API key):
 * 1. Install: npm install openai
 * 2. Set OPENAI_API_KEY env var
 * 3. Set TTS_PROVIDER=openai
 */

async function renderTTS(options) {
  const { text, voice, format, rate } = options;

  // TODO: Implement OpenAI TTS integration
  // const OpenAI = require('openai');
  // const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  //
  // const response = await client.audio.speech.create({
  //   model: 'tts-1',
  //   voice: voice || 'alloy',
  //   input: text,
  //   response_format: format === 'ogg' ? 'opus' : format, // 'mp3', 'opus', 'aac', 'flac'
  // });
  //
  // return await response.arrayBuffer();

  throw new Error('OpenAI TTS provider not yet implemented. Use TTS_PROVIDER=mock for now.');
}

module.exports = {
  renderTTS,
};
