/**
 * Mock TTS Provider
 * 
 * Generates a silent WAV/OGG/MP3 file for demonstration.
 * In production, replace with real TTS provider implementations.
 */

const crypto = require('crypto');

/**
 * Generate a minimal valid WAV file (silent audio, 1 second)
 * This is a valid WAV header + silent PCM data
 */
function generateSilentWav() {
  // WAV header for 1 second of 16-bit PCM at 16kHz mono
  const sampleRate = 16000;
  const duration = 1; // seconds
  const numSamples = sampleRate * duration;
  const byteRate = sampleRate * 2;

  const header = Buffer.alloc(44);
  let offset = 0;

  // RIFF header
  header.write('RIFF', offset); offset += 4;
  header.writeUInt32LE(36 + numSamples * 2, offset); offset += 4; // File size - 8
  header.write('WAVE', offset); offset += 4;

  // fmt sub-chunk
  header.write('fmt ', offset); offset += 4;
  header.writeUInt32LE(16, offset); offset += 4; // Sub-chunk size
  header.writeUInt16LE(1, offset); offset += 2; // Audio format (PCM)
  header.writeUInt16LE(1, offset); offset += 2; // Num channels (mono)
  header.writeUInt32LE(sampleRate, offset); offset += 4; // Sample rate
  header.writeUInt32LE(byteRate, offset); offset += 4; // Byte rate
  header.writeUInt16LE(2, offset); offset += 2; // Block align
  header.writeUInt16LE(16, offset); offset += 2; // Bits per sample

  // data sub-chunk
  header.write('data', offset); offset += 4;
  header.writeUInt32LE(numSamples * 2, offset);

  // Silent PCM data (all zeros)
  const pcmData = Buffer.alloc(numSamples * 2);

  return Buffer.concat([header, pcmData]);
}

/**
 * Generate a minimal valid OGG file
 * For MVP, return a minimal OGG Opus file
 */
function generateSilentOgg() {
  // Minimal OGG Opus page (page 0, EOS flag)
  // This is a simplified structure; real OGG files are more complex
  const buf = Buffer.alloc(256);
  buf.write('OggS', 0); // OGG page signature
  buf[4] = 0x00; // Version
  buf[5] = 0x02; // Header type (BOS - Beginning of stream)
  
  // Granule position (little-endian)
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(0, 10);
  
  // Serial number
  buf.writeUInt32LE(1, 14);
  
  // Sequence number
  buf.writeUInt32LE(0, 18);
  
  // CRC
  buf.writeUInt32LE(0, 22);
  
  // Number of page segments
  buf[26] = 1;
  
  // Segment size
  buf[27] = 0;

  return buf.slice(0, 28);
}

/**
 * Generate a minimal valid MP3 file
 * For MVP, return minimal ID3 tag + minimal MP3 frame
 */
function generateSilentMp3() {
  // ID3v2 header (simplistic)
  const id3 = Buffer.alloc(10);
  id3.write('ID3', 0); // ID3v2 identifier
  id3[3] = 0x04; // Version 2.4
  id3[4] = 0x00;
  id3[5] = 0x00; // Flags
  id3.writeUInt32BE(0, 6); // Size (encoded)

  // Minimal MPEG frame header (silent frame)
  const frameHeader = Buffer.alloc(4);
  frameHeader[0] = 0xFF; // Sync
  frameHeader[1] = 0xFB; // MPEG 1 Layer III, no CRC
  frameHeader[2] = 0x10; // Bitrate, sample rate
  frameHeader[3] = 0x00; // Padding, private bit

  return Buffer.concat([id3, frameHeader]);
}

/**
 * Main renderTTS function
 * @param {Object} options
 * @param {string} options.text - Text to convert to speech
 * @param {string} options.voice - Voice name (unused in mock)
 * @param {string} options.format - Audio format ('mp3', 'ogg', 'wav')
 * @param {number} options.rate - Speech rate (unused in mock)
 * @returns {Promise<Buffer>} Audio data
 */
async function renderTTS(options) {
  const { text, voice, format, rate } = options;

  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 100));

  // Generate appropriate format
  let audioBuffer;
  switch (format) {
    case 'ogg':
      audioBuffer = generateSilentOgg();
      break;
    case 'wav':
      audioBuffer = generateSilentWav();
      break;
    case 'mp3':
    default:
      audioBuffer = generateSilentMp3();
      break;
  }

  console.log(`[MockTTS] Generated ${format} audio (${audioBuffer.length} bytes) for text: "${text.slice(0, 50)}..."`);

  return audioBuffer;
}

module.exports = {
  renderTTS,
};
