import { test, expect } from '@playwright/test';

test.describe('Backend TTS API', () => {
  const API_URL = 'http://localhost:3001';
  const AUTH_HEADER = 'Bearer test-token';

  test('health check returns status', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('ttsBackendEnabled');
    expect(data).toHaveProperty('ttsProvider');
    expect(data).toHaveProperty('timestamp');
  });

  test('POST /api/tts requires authentication', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts`, {
      data: { text: 'Test audio' },
    });
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Missing Authorization');
  });

  test('POST /api/tts generates audio for valid request', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts`, {
      headers: { Authorization: AUTH_HEADER },
      data: {
        text: 'Interview was excellent. Strong technical skills.',
        format: 'mp3',
        rate: 1.0,
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('audio/mpeg');

    const buffer = await response.body();
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('POST /api/tts rejects missing text', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts`, {
      headers: { Authorization: AUTH_HEADER },
      data: { format: 'mp3' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing or invalid text field');
  });

  test('POST /api/tts rejects empty text', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts`, {
      headers: { Authorization: AUTH_HEADER },
      data: { text: '   ', format: 'mp3' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('empty');
  });

  test('POST /api/tts rejects text exceeding max length', async ({ request }) => {
    const longText = 'a'.repeat(10001);
    const response = await request.post(`${API_URL}/api/tts`, {
      headers: { Authorization: AUTH_HEADER },
      data: { text: longText, format: 'mp3' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('exceeds maximum length');
  });

  test('POST /api/tts validates format parameter', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts`, {
      headers: { Authorization: AUTH_HEADER },
      data: {
        text: 'Test audio',
        format: 'invalid_format',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid format');
  });

  test('POST /api/tts validates rate parameter', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts`, {
      headers: { Authorization: AUTH_HEADER },
      data: {
        text: 'Test audio',
        rate: 3.0,
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Rate must be between');
  });

  test('POST /api/tts supports different audio formats', async ({ request }) => {
    const formats = ['mp3', 'ogg', 'wav'];

    for (const format of formats) {
      const response = await request.post(`${API_URL}/api/tts`, {
        headers: { Authorization: AUTH_HEADER },
        data: {
          text: 'Test audio',
          format,
        },
      });

      expect(response.status()).toBe(200);
      const contentTypes = {
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg',
        wav: 'audio/wav',
      };
      expect(response.headers()['content-type']).toBe(contentTypes[format]);
    }
  });

  test('POST /api/tts with ?download=true sets content-disposition', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tts?download=true`, {
      headers: { Authorization: AUTH_HEADER },
      data: {
        text: 'Download this audio',
        format: 'mp3',
      },
    });

    expect(response.status()).toBe(200);
    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
    expect(contentDisposition).toContain('retrospective-');
  });

  test('POST /api/tts respects rate limiting', async ({ request }) => {
    const requestData = {
      text: 'Test audio for rate limit',
      format: 'mp3',
    };

    let tooManyRequests = false;

    // Send 35 requests quickly
    for (let i = 0; i < 35; i++) {
      const response = await request.post(`${API_URL}/api/tts`, {
        headers: { Authorization: AUTH_HEADER },
        data: requestData,
      });

      if (response.status() === 429) {
        tooManyRequests = true;
        break;
      }
    }

    // Should hit rate limit
    expect(tooManyRequests).toBe(true);
  });

  test('404 for unknown endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/nonexistent`);
    expect(response.status()).toBe(404);
  });
});
