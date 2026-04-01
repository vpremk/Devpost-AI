# Devpost AI — Interview Retrospective with Speech-to-Notes

A React-based platform for interview retrospective notes with integrated browser-based text-to-speech (TTS) capabilities. Both interviewer and candidate can listen to summarized notes to prepare for next steps.

## Features

- ✅ **Browser-based TTS**: Uses Web Speech API for privacy-first audio generation
- ✅ **Voice Selection**: Choose from available system voices (OS-dependent)
- ✅ **Speed & Pitch Control**: Adjust playback speed (0.5x–2x) and pitch (0–2)
- ✅ **Play / Pause / Stop**: Full playback control
- ✅ **Download Audio**: Server-fallback option to save notes as MP3
- ✅ **Accessible**: ARIA labels, keyboard shortcuts, focus management
- ✅ **Responsive**: Mobile-friendly UI

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000) in your browser. The app will reload on code changes.

## Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests (Playwright + Playwright BDD)
```bash
npm run test:bdd
npm run test:bdd:ui    # Interactive UI mode
npm run test:bdd:debug # Debug mode
```

Tests cover:
- Component functionality (Play, Pause, Stop, voice selection, speed/pitch controls)
- Keyboard accessibility (Tab, Space, S, D shortcuts)
- Mobile responsiveness
- Backend API validation
- Rate limiting and authentication
- Audio format support (MP3, OGG, WAV)

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## Continuous Integration / Continuous Deployment

GitHub Actions pipelines run on every push and PR:

### CI/CD Workflow (`.github/workflows/ci-cd.yml`)
1. **Setup**: Verify dependencies and Node versions (16, 18, 20)
2. **Lint**: ESLint checks
3. **Build**: React production build
4. **Test Unit**: Jest with coverage upload to Codecov
5. **Test E2E**: Playwright on Chromium, Firefox, WebKit, mobile
6. **Security**: npm audit + Snyk vulnerability scanning
7. **Deploy Staging**: On push to `develop` branch
8. **Deploy Production**: On push to `main` branch

### Accessibility Workflow (`.github/workflows/accessibility.yml`)
1. **Lighthouse**: Performance, accessibility, best practices, SEO scores
2. **Axe**: Automated accessibility scanning
3. **Bundle Size**: Monitor for regressions

### Requirements for Merge
- ✅ All tests passing
- ✅ Build successful
- ✅ No security vulnerabilities (high)
- ✅ Lighthouse accessibility score >= 0.9

### Deployment Environments
- **Staging**: Auto-deployed on `develop` branch
- **Production**: Auto-deployed on `main` branch (requires environment approval)

## Component: RetrospectiveSpeech

The core component is located at `src/components/RetrospectiveSpeech.jsx`.

### Props

```javascript
<RetrospectiveSpeech
  text="Your retrospective notes here"
  onStart={() => console.log('Started')}
  onPause={() => console.log('Paused')}
  onStop={() => console.log('Stopped')}
  onError={(err) => console.error('Error:', err)}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `text` | string | Yes | The text to be spoken |
| `onStart` | function | No | Callback when playback starts |
| `onPause` | function | No | Callback when playback pauses |
| `onStop` | function | No | Callback when playback stops |
| `onError` | function | No | Callback on error with error message |

### Keyboard Shortcuts

- **Space**: Play / Pause
- **S**: Stop
- **D**: Download (when focused on download button)

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome / Edge | ✅ 25+ | Full support |
| Safari | ✅ 14.1+ | Full support |
| Firefox | ⚠️ Partial | Requires experimental flag |
| Mobile | ✅ iOS Safari, Chrome Android | Full support |

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```
REACT_APP_TTS_BACKEND=false
REACT_APP_TTS_PROVIDER=
```

- `REACT_APP_TTS_BACKEND`: Set to `true` to enable server-side TTS (requires `/api/tts` endpoint)
- `REACT_APP_TTS_PROVIDER`: Provider name (e.g., `aws`, `gcp`, `azure`)

## Backend API (Optional)

For server-side TTS, implement `POST /api/tts`:

```bash
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your notes here",
    "voice": "en-US-Neural2-A",
    "format": "mp3",
    "rate": 1.0
  }'
```

**Response**: Binary audio stream with appropriate `Content-Type` header.

## Architecture

```
src/
├── components/
│   ├── RetrospectiveSpeech.jsx    # Main TTS component
│   └── RetrospectiveSpeech.css    # Component styles
├── App.jsx                         # Demo app & landing page
├── App.css                         # App styles
├── index.jsx                       # React entry point
└── index.css                       # Global styles

public/
└── index.html                      # HTML template

docs/
├── retrospective_speech_prd.md     # Product requirements
└── retrospective_speech_spec.md    # Technical specification
```

## Privacy & Security

- **Default**: All speech synthesis happens client-side using the browser's Web Speech API. No data is sent to external servers.
- **Server TTS**: Only available if `REACT_APP_TTS_BACKEND=true` and requires explicit user consent.
- **Data Retention**: Notes are not stored long-term; audio is cached for performance but deleted after N days.

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Component rendering and state management
- Speech synthesis API interactions
- Keyboard accessibility
- Download functionality

## Accessibility Features

- ✅ ARIA labels on all interactive elements
- ✅ `aria-live` regions for dynamic status updates
- ✅ Keyboard navigation support (Tab, Space, S, D)
- ✅ High contrast focus states
- ✅ Respects `prefers-reduced-motion` preference

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Server-side TTS integration (AWS Polly, Google Cloud, Azure, OpenAI)
- [ ] Audio caching and CDN delivery
- [ ] Multiple language support
- [ ] Custom voice profiles
- [ ] Analytics and usage tracking
- [ ] Export to multiple audio formats

## Related Documentation

- [Speech-to-Notes PRD](docs/retrospective_speech_prd.md)
- [Technical Specification](docs/retrospective_speech_spec.md)

## License

MIT

## Support

For issues or questions, please open an issue on the repository or contact the development team.

---

**Last Updated**: April 1, 2026  
**Version**: 1.0.0 (MVP)
