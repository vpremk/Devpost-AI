const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiter: 30 requests per minute per IP
const ttsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many TTS requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Mock authentication middleware (replace with real auth)
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  // In production, verify JWT or session here
  req.userId = 'user-stub'; // Stub user ID
  next();
};

// TTS Provider factory
const ttsProviderFactory = () => {
  const provider = process.env.TTS_PROVIDER || 'mock';
  
  switch (provider) {
    case 'aws':
      return require('./providers/awsTtsProvider');
    case 'gcp':
      return require('./providers/gcpTtsProvider');
    case 'azure':
      return require('./providers/azureTtsProvider');
    case 'openai':
      return require('./providers/openaiTtsProvider');
    case 'mock':
    default:
      return require('./providers/mockTtsProvider');
  }
};

/**
 * POST /api/tts
 * Generate audio from text using TTS
 *
 * Body:
 * {
 *   "text": string (required, max 10000 chars),
 *   "voice": string (optional, provider-specific),
 *   "format": string (optional, 'mp3' | 'ogg' | 'wav', default 'mp3'),
 *   "rate": number (optional, 0.5-2.0, default 1.0)
 * }
 *
 * Query:
 * ?download=true - Force file download response
 *
 * Response:
 * 200: Binary audio stream with Content-Type: audio/*
 * 400: Invalid input
 * 401: Unauthorized
 * 429: Rate limited
 * 500: Server error
 */
app.post('/api/tts', authenticateUser, ttsLimiter, async (req, res) => {
  try {
    const { text, voice, format = 'mp3', rate = 1.0 } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid text field' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 10000 characters' });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    const validFormats = ['mp3', 'ogg', 'wav'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: `Invalid format. Must be one of: ${validFormats.join(', ')}` });
    }

    if (rate < 0.5 || rate > 2.0) {
      return res.status(400).json({ error: 'Rate must be between 0.5 and 2.0' });
    }

    // Check if TTS backend is enabled
    if (process.env.RETROSPECTIVE_TTS_BACKEND !== 'true') {
      return res.status(503).json({
        error: 'TTS backend is not enabled',
        hint: 'Set RETROSPECTIVE_TTS_BACKEND=true to enable server-side TTS'
      });
    }

    // Get TTS provider
    const provider = ttsProviderFactory();

    // Log request (in production, log to audit trail)
    console.log(`[TTS] User: ${req.userId}, Format: ${format}, TextLen: ${text.length}, Rate: ${rate}`);

    // Generate audio
    const audioBuffer = await provider.renderTTS({
      text,
      voice: voice || 'default',
      format,
      rate,
    });

    // Set response headers
    const contentType = {
      mp3: 'audio/mpeg',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
    }[format];

    res.set({
      'Content-Type': contentType,
      'Content-Length': audioBuffer.length,
    });

    // If download query param, add download header
    if (req.query.download === 'true') {
      const timestamp = new Date().toISOString().slice(0, 10);
      res.set('Content-Disposition', `attachment; filename="retrospective-${timestamp}.${format === 'mp3' ? 'mp3' : format === 'ogg' ? 'ogg' : 'wav'}"`);
    }

    res.send(audioBuffer);
  } catch (error) {
    console.error('[TTS Error]', error.message);
    res.status(500).json({
      error: 'Failed to generate audio',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ttsBackendEnabled: process.env.RETROSPECTIVE_TTS_BACKEND === 'true',
    ttsProvider: process.env.TTS_PROVIDER || 'mock',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 TTS Backend Server running on http://localhost:${PORT}`);
  console.log(`   RETROSPECTIVE_TTS_BACKEND=${process.env.RETROSPECTIVE_TTS_BACKEND || 'false'}`);
  console.log(`   TTS_PROVIDER=${process.env.TTS_PROVIDER || 'mock'}`);
  console.log(`   POST /api/tts - Generate audio from text`);
  console.log(`   GET /api/health - Health check\n`);
});
