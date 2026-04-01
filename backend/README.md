# Backend TTS API Server

Express server providing the optional `POST /api/tts` endpoint for text-to-speech generation.

## Quick Start

### Install dependencies

```bash
npm install --save-dev cors express express-rate-limit dotenv
```

### Configure environment

Create a `.env` file in the `backend/` directory:

```env
# Enable/disable TTS backend
RETROSPECTIVE_TTS_BACKEND=true

# TTS Provider: 'mock', 'aws', 'gcp', 'azure', 'openai'
TTS_PROVIDER=mock

# Provider-specific keys (only if using real provider)
# AWS
# AWS_REGION=us-east-1

# GCP
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Azure
# AZURE_SPEECH_KEY=your-key
# AZURE_SPEECH_REGION=eastus

# OpenAI
# OPENAI_API_KEY=sk-...

# Server
PORT=3001
NODE_ENV=development
```

### Start the server

```bash
npm run dev
```

Or with Node directly:

```bash
node backend/server.js
```

Server will run on `http://localhost:3001`.

## API Endpoints

### `POST /api/tts`

Generate audio from text using TTS.

**Authentication**: Required. Pass an `Authorization` header (stub authentication for now).

**Request Body**

```json
{
  "text": "Your retrospective notes here",
  "voice": "en-US-Neural2-A",
  "format": "mp3",
  "rate": 1.0
}
```

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `text` | string | Yes | Text to synthesize (max 10,000 chars) | — |
| `voice` | string | No | Provider-specific voice ID | 'default' |
| `format` | string | No | Output format: 'mp3', 'ogg', 'wav' | 'mp3' |
| `rate` | number | No | Speech rate (0.5–2.0) | 1.0 |

**Query Parameters**

- `?download=true` — Force a download response with `Content-Disposition` header.

**Example Request**

```bash
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer stub-token" \
  -d '{
    "text": "Interview was excellent. Strong technical skills and clear communication.",
    "voice": "en-US-Neural2-A",
    "format": "mp3",
    "rate": 1.0
  }' \
  --output interview.mp3
```

**Response**

- `200 OK` — Binary audio stream with appropriate `Content-Type` header (e.g., `audio/mpeg` for MP3).
- `400 Bad Request` — Invalid input (missing text, exceeds length, invalid format, etc.).
- `401 Unauthorized` — Missing or invalid `Authorization` header.
- `429 Too Many Requests` — Rate limit exceeded (30 requests per minute per IP).
- `503 Service Unavailable` — TTS backend not enabled (`RETROSPECTIVE_TTS_BACKEND != true`).
- `500 Internal Server Error` — Provider error or server failure.

### `GET /api/health`

Health check endpoint.

**Response**

```json
{
  "status": "ok",
  "timestamp": "2026-04-01T12:34:56.789Z",
  "ttsBackendEnabled": true,
  "ttsProvider": "mock"
}
```

## Providers

### Mock Provider (Default)

Generates minimal valid audio files (silent) for testing.

- No external dependencies.
- No cost.
- Use for local development and CI/CD.

### AWS Polly

High-quality speech synthesis from Amazon.

**Setup**:

```bash
npm install aws-sdk
```

Set environment variables:
- `TTS_PROVIDER=aws`
- `AWS_REGION=us-east-1` (optional)

Credentials via IAM role or `.aws/credentials`.

**Cost**: ~$0.000004 per 1K characters.

### Google Cloud TTS

Natural-sounding voices from Google.

**Setup**:

```bash
npm install @google-cloud/text-to-speech
```

Set environment variables:
- `TTS_PROVIDER=gcp`
- `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`

**Cost**: ~$0.000004 per 1K characters.

### Azure Cognitive Services

Enterprise-grade TTS from Microsoft.

**Setup**:

```bash
npm install cognitiveservices
```

Set environment variables:
- `TTS_PROVIDER=azure`
- `AZURE_SPEECH_KEY=your-key`
- `AZURE_SPEECH_REGION=eastus`

**Cost**: ~$0.000004 per 1K characters.

### OpenAI TTS

Modern TTS from OpenAI.

**Setup**:

```bash
npm install openai
```

Set environment variables:
- `TTS_PROVIDER=openai`
- `OPENAI_API_KEY=sk-...`

**Cost**: ~$0.000015 per 1K characters.

## Security & Privacy

- **Authentication**: Required. Replace stub with real JWT/session validation.
- **Rate Limiting**: 30 requests/min per IP to prevent abuse.
- **Input Validation**: Text length capped at 10,000 characters; format/rate validated.
- **Data**: Notes are not logged or stored long-term (provider policies vary).
- **Encryption**: Use HTTPS in production.

## Integration with Frontend

The React frontend at the project root sends requests to this backend:

```javascript
const response = await fetch('/api/tts?download=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' },
  body: JSON.stringify({
    text: "Your notes",
    voice: "en-US-Neural2-A",
    format: "mp3",
    rate: 1.0
  })
});
const blob = await response.blob();
// Download or play blob...
```

In production, configure a proxy or API gateway to route `/api/*` requests to this backend.

## Development

### Run tests

```bash
npm test
```

### Run in watch mode

```bash
npm run dev
```

### Build for production

No build step needed; Node runs directly. Ensure dependencies are installed.

## Environment Checklist

- [ ] `.env` file created with `RETROSPECTIVE_TTS_BACKEND=true`
- [ ] Dependencies installed: `npm install`
- [ ] TTS provider configured (default: `mock`)
- [ ] Authentication middleware implemented (stub for now)
- [ ] HTTPS configured for production
- [ ] API gateway / reverse proxy set up to route `/api/tts` to this backend
- [ ] Database / cache layer added for audio caching (optional)
- [ ] Monitoring and alerting set up for provider costs and errors

## Next Steps

1. Implement real authentication (JWT / OAuth / session).
2. Add audio caching layer (Redis, S3).
3. Integrate with chosen TTS provider (AWS, GCP, Azure, OpenAI).
4. Add database to track usage and costs.
5. Deploy to production (Docker, Kubernetes, Lambda, Cloud Run, etc.).

---

**Created**: April 1, 2026  
**Status**: MVP (Mock provider)
