# Speech-to-Notes PRD — Interview Retrospective

## Summary
Add a speech-to-notes feature that converts interview retrospective notes and summaries into audio so both interviewer and candidate can listen to a concise briefing preparing them for next steps.

## Goals
- Make retrospective notes accessible as audio (play/download).
- Enable quick preparation for follow-up interviews and hiring decisions.
- Provide an easy, privacy-aware option with minimal infra requirements.

## Non-goals
- Voice cloning or deep personalization of speaker voice.
- Real-time transcription of live interviews (out of scope).

## Users & Personas
- Interviewer: wants to review notes quickly while commuting.
- Candidate (recruiter-facing): wants a concise recap before next stage.
- Hiring manager: wants an audio summary for decision syncs.

## User stories
- As an interviewer, I can click "Play summary" to hear the note summary.
- As a user, I can download the audio file (MP3/OGG) to share or archive.
- As a user, I can choose voice, speed, and language when available.
- As an admin, I can enable/disable server-side TTS or force browser TTS.

## Success metrics
- 90% of users can generate and play audio without errors.
- Median audio generation time < 2s for browser TTS, < 5s for server TTS.
- Audio downloads used in at least 20% of retrospective sessions (70% target engagement within 3 months).

## Constraints & Privacy
- Notes may contain PII; default behavior: do not send notes to third-party services unless explicitly enabled and consented.
- Browser TTS (SpeechSynthesis) is preferred for privacy-free default.
- Server TTS requires opt-in via env var and documented data retention policy.

## Alternatives evaluated
- Browser TTS (Web Speech API): Pros — privacy, no infra; Cons — voice variety varies by client.
- Server TTS (e.g., AWS Polly, Google TTS, Azure TTS, or OpenAI TTS): Pros — high-quality voices, consistency; Cons — cost, data exposure, latency.

## Recommended approach (MVP)
1. Browser-first MVP: implement UI to call `window.speechSynthesis` with selectable voice, rate, and pitch. Provide play/pause/stop and download via MediaRecorder shim or server-side render when requested.
2. Optional server TTS: add an API endpoint `/api/tts` that accepts note text and returns an audio file. This is behind a feature flag and requires env vars for provider keys.

## API / Implementation Spec

### Frontend
- New UI: `RetrospectiveSpeech` component with controls:
  - `Play Summary`, `Pause`, `Stop`, `Download` buttons
  - `Voice` dropdown (populated from `speechSynthesis.getVoices()`)
  - `Rate` and `Pitch` sliders
- Flow:
  - If `browserTTS=true` or server disabled: use Web Speech API to speak text.
  - For `Download`: if browser supports stream capture, generate audio client-side; otherwise POST to `/api/tts?download=true` and return a file.

### Backend (optional)
- Endpoint: `POST /api/tts`
  - Body: `{ text: string, voice?: string, format?: 'mp3'|'ogg'|'wav', rate?: number }`
  - Response: `200` with `audio/*` binary stream or `400` on invalid input.
- Security: require authentication; rate-limit and log usage.

## UI/UX Notes
- Place control bar at top of a selected note or in the note preview modal.
- Keyboard shortcuts: `Space` to play/pause, `S` to stop, `D` to download (announce via aria-live).
- Accessibility: controls must have `aria-label`s and focus states. Ensure transcripts or captions are available via the note text.

## Error handling
- If TTS fails, show a concise message and fallback to copying text to clipboard.
- For server TTS errors, surface provider error code and suggest trying browser TTS.

## Rollout plan
1. Build browser-only MVP behind a feature flag; test with small team.
2. Add server-side provider option and opt-in lab environment.
3. Monitor metrics and roll out to all users.

## Milestones
- Week 0.5: Browser TTS component + UI + docs.
- Week 1: Download support (client or server fallback) + tests.
- Week 2: Server TTS integration + admin flag + privacy docs.

## Open questions
- Is sending notes to a TTS provider allowed under current privacy policy by default?
- Which server TTS provider do we prefer (cost/quality)?

## Next steps
- Implement browser TTS `RetrospectiveSpeech` component.
- Add backend `POST /api/tts` stub (feature-flagged).
- Create `docs/retrospective_speech.md` usage guide and update main `README.md`.
