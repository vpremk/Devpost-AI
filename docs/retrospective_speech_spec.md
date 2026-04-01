# Retrospective Speech — Technical Implementation Spec

## Overview
Concrete, implementable spec for the browser-first TTS MVP described in the PRD. Includes frontend component API, optional backend endpoint, environment flags, basic security, tests, and accessibility requirements.

## MVP Goals
- Support browser TTS (Web Speech API) to speak selected notes.
- Provide Play / Pause / Stop controls and a Download option (client or server fallback).
- Expose simple configuration: voice, rate, pitch, language.
- Feature-flag server-side TTS and require opt-in via env var.

## Feature Flags & Env
- `FEATURE_RETROSPECTIVE_TTS` (boolean) — master flag to enable feature.
- `RETROSPECTIVE_TTS_BACKEND` (boolean) — when true, allow backend TTS generation.
- `TTS_PROVIDER` — optional provider key name (e.g., `aws`, `gcp`, `azure`, `openai`).
- `TTS_PROVIDER_KEY` — provider API key (only required if `RETROSPECTIVE_TTS_BACKEND=true`).

## Frontend: `RetrospectiveSpeech` component
Props
- `text: string` — required, the note or summary text to speak.
- `autoPlay?: boolean` — optional, whether to start speaking immediately.
- `onStart?: () => void`, `onPause?: () => void`, `onStop?: () => void`, `onError?: (err) => void`

State
- `isPlaying: boolean`
- `voiceList: Array<Voice>` (from `speechSynthesis.getVoices()`)
- `selectedVoiceId: string | null`
- `rate: number` (0.5–2.0 default 1.0)
- `pitch: number` (0–2 default 1.0)

Public UI
- Play/Pause toggle button (Space shortcut)
- Stop button (S shortcut)
- Voice select dropdown
- Rate slider
- Pitch slider
- Download button
- Small status display (e.g., "Playing — 00:12") with aria-live

Behavior
1. On mount, populate `voiceList` via `speechSynthesis.getVoices()`. If list empty, add `speechSynthesis.onvoiceschanged` listener.
2. On Play:
   - Create `SpeechSynthesisUtterance(text)`
   - Set `voice` (match by `selectedVoiceId`), `rate`, `pitch`, `lang`.
   - Call `speechSynthesis.speak(utterance)`.
3. On Pause / Resume: call `speechSynthesis.pause()` / `speechSynthesis.resume()`.
4. On Stop: call `speechSynthesis.cancel()` and reset playback state.
5. Handle `utterance.onend` and `utterance.onerror` to update state and call callbacks.
6. Persist user-selected voice/rate/pitch in localStorage (optional) for convenience.

Download flow (MVP)
- Preferred (client): Attempt to capture audio via `MediaRecorder` on a hidden `AudioContext` if supported. Implementation notes:
  - Create `AudioContext`, route `SpeechSynthesis` output into MediaStream via `AudioContext.createMediaStreamDestination()` (browser support varies).
  - Use `MediaRecorder` to record and assemble an audio Blob, then offer download as `audio/webm` or `audio/ogg`.
  - If capture fails due to browser restrictions, fall back to server-side `POST /api/tts`.
- Fallback (server): POST `{ text, voice, format, rate }` to `/api/tts?download=true` and download returned stream as chosen filename.

Accessibility
- All controls have `aria-label` and visible focus ring.
- Use `aria-live="polite"` region to announce play/pause/stop states.
- Ensure contrast and keyboard operability.

Frontend Example (React, simplified)
```jsx
function RetrospectiveSpeech({ text }) {
  // state: voices, selectedVoice, rate, pitch, isPlaying
  // handlers: play(), pause(), stop(), download()
}
```

## Backend: `POST /api/tts` (optional, feature-flagged)
Endpoint: `/api/tts`
- Method: POST
- Auth: require standard application auth (JWT/session) — should not be public.
- Body: { text: string, voice?: string, format?: 'mp3'|'ogg'|'wav', rate?: number }
- Query: `?download=true` to force a file response
- Response: `200` with `Content-Type: audio/<format>` and binary stream

Server Implementation Notes
- Validate input length (e.g., max 10k chars) and sanitize text for provider.
- Rate-limit per user to avoid abuse (e.g., 30 requests/min with burst controls).
- If using external provider, add async caching: hashed key of (text, voice, rate, format) store audio in artifact storage (S3) for N days.
- Log provider usage and do not store original notes long-term unless policy allows.

Provider Adapter Interface (pseudocode)
- `renderTTS({text, voice, rate, format}) => Promise<Buffer>`
- Implement adapters for chosen providers and map voice names to provider voice IDs.

Security & Privacy
- Require `RETROSPECTIVE_TTS_BACKEND` for server usage; default disabled.
- Explicit UI consent before sending notes to providers; show a short privacy disclosure.
- Ensure provider keys are in environment, not in source.

Tests
- Unit tests for utility mapping functions and provider adapter mocks.
- E2E tests (Play, Pause, Stop) using a headless browser that supports SpeechSynthesis or by mocking the `speechSynthesis` API.
- Backend tests: stub provider responses, test caching and file responses.

Metrics & Logging
- Track events: `tts_play`, `tts_download`, `tts_backend_request`, `tts_error` with user id and timing.
- Alert on high error rates or provider cost spikes.

Rollout Plan
1. Develop component behind `FEATURE_RETROSPECTIVE_TTS` and test in staging with a small user group.
2. Enable client-only mode (`RETROSPECTIVE_TTS_BACKEND=false`) for privacy-first rollout.
3. Add backend TTS as opt-in for teams that need downloads or consistent voice.

Open Implementation Tasks
- Scaffold `RetrospectiveSpeech` component and demo page.
- Implement client recording/download flow and tests.
- Add backend `POST /api/tts` stub and provider adapter skeleton (feature-flagged).
- Update docs: [docs/retrospective_speech_prd.md](docs/retrospective_speech_prd.md) and create usage guide.


---

Created by onboarding assistant.
