/**
 * AWS Polly TTS Provider Stub
 * 
 * To use real AWS Polly:
 * 1. Install: npm install aws-sdk
 * 2. Set AWS credentials via environment or IAM role
 * 3. Set TTS_PROVIDER=aws
 * 4. Set AWS_REGION (optional, default us-east-1)
 */

async function renderTTS(options) {
  const { text, voice, format, rate } = options;

  // TODO: Implement AWS Polly integration
  // const AWS = require('aws-sdk');
  // const polly = new AWS.Polly({ region: process.env.AWS_REGION || 'us-east-1' });
  // 
  // const params = {
  //   Text: text,
  //   OutputFormat: format === 'wav' ? 'pcm' : format, // 'mp3', 'ogg_vorbis', 'pcm'
  //   VoiceId: voice || 'Joanna',
  // };
  //
  // const response = await polly.synthesizeSpeech(params).promise();
  // return response.AudioStream;

  throw new Error('AWS Polly provider not yet implemented. Use TTS_PROVIDER=mock for now.');
}

module.exports = {
  renderTTS,
};
