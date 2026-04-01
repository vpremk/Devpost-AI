import React from 'react';
import RetrospectiveSpeech from './components/RetrospectiveSpeech';
import './App.css';

const sampleNotes = `
Interview Retrospective — Senior Software Engineer Role

Candidate: Alice Chen
Date: April 1, 2026

Technical Round Summary:
- Strong problem-solving skills demonstrated in coding exercise.
- Completed the system design challenge with clear architecture and trade-off analysis.
- Asked thoughtful questions about scalability and data consistency.

Communication & Collaboration:
- Excellent communication; explained reasoning clearly.
- Engaged well with interviewer feedback and iterated solutions.

Areas of Excellence:
- 8+ years of backend development experience with microservices.
- Deep knowledge of distributed systems and cloud infrastructure.
- Strong test-driven development practices.

Growth Areas:
- Limited frontend experience (mentioned but comfortable learning).
- First time interviewing for this company's tech stack.

Overall Assessment:
Strong technical candidate with excellent fundamentals. Ready to move forward to 
final round with hiring manager. Recommend discussion about onboarding timeline 
and team pairing opportunities.

Next Steps:
Schedule final round interview within 1 week. Provide overview of team structure 
and day-to-day responsibilities before the call.
`;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Interview Retrospective — Speech-to-Notes Demo</h1>
        <p>Convert your interview notes to audio for quick review</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Live Demo: Text-to-Speech Controls</h2>
          <RetrospectiveSpeech 
            text={sampleNotes}
            onStart={() => console.log('🔊 Speech started')}
            onPause={() => console.log('⏸️  Speech paused')}
            onStop={() => console.log('⏹️  Speech stopped')}
            onError={(err) => console.error('❌ TTS Error:', err)}
          />
        </section>

        <section className="info-section">
          <h2>How to Use</h2>
          <ul>
            <li><strong>Play/Pause:</strong> Click the Play button or press Space to start/pause speech.</li>
            <li><strong>Stop:</strong> Click Stop to end playback and reset.</li>
            <li><strong>Voice Selection:</strong> Choose a voice from the dropdown (varies by browser/OS).</li>
            <li><strong>Speed Control:</strong> Adjust the playback speed from 0.5x to 2x.</li>
            <li><strong>Pitch Control:</strong> Modify the pitch of the voice (0–2 range).</li>
            <li><strong>Download:</strong> Click Download to save audio as MP3 (requires server support).</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Browser Compatibility</h2>
          <p>
            This demo uses the Web Speech API (SpeechSynthesis), which is supported on:
          </p>
          <ul>
            <li>Chrome / Edge 25+</li>
            <li>Safari 14.1+</li>
            <li>Firefox (limited; experimental flag)</li>
            <li>Mobile browsers (iOS Safari, Chrome Android)</li>
          </ul>
          <p>
            <strong>Privacy Note:</strong> By default, notes remain on your device. 
            Download via server requires opt-in.
          </p>
        </section>
      </main>

      <footer className="App-footer">
        <p>
          🚀 Part of the Devpost AI onboarding initiative. 
          See <code>docs/retrospective_speech_prd.md</code> for feature spec.
        </p>
      </footer>
    </div>
  );
}

export default App;
