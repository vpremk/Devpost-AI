import React, { useState, useEffect, useRef } from 'react';
import './RetrospectiveSpeech.css';

/**
 * RetrospectiveSpeech Component
 * 
 * Provides browser-based text-to-speech controls for interview retrospective notes.
 * Supports voice selection, rate/pitch control, and download options.
 */
function RetrospectiveSpeech({ 
  text = 'Sample retrospective note text', 
  onStart, 
  onPause, 
  onStop, 
  onError 
}) {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [currentTime, setCurrentTime] = useState('00:00');

  const utteranceRef = useRef(null);
  const audioContextRef = useRef(null);
  // mediaRecorderRef and streamRef reserved for future Web Audio API integration
  // const mediaRecorderRef = useRef(null);
  // const streamRef = useRef(null);

  // Populate available voices
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoiceIndex(0);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('retrospectiveSpeech', JSON.stringify({
      voiceIndex: selectedVoiceIndex,
      rate,
      pitch,
    }));
  }, [selectedVoiceIndex, rate, pitch]);

  const handlePlay = () => {
    if (isPlaying && !isPaused) {
      // Pause if already playing
      window.speechSynthesis.pause();
      setIsPaused(true);
      setStatus('Paused');
      onPause?.();
      return;
    }

    if (isPaused) {
      // Resume if paused
      window.speechSynthesis.resume();
      setIsPaused(false);
      setStatus('Playing');
      onStart?.();
      return;
    }

    // Start new playback
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[selectedVoiceIndex] || null;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = utterance.voice?.lang || 'en-US';

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setStatus('Playing');
      onStart?.();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setStatus('Finished');
      setCurrentTime('00:00');
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setIsPaused(false);
      setStatus(`Error: ${event.error}`);
      onError?.(event.error);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setStatus('Stopped');
    setCurrentTime('00:00');
    onStop?.();
  };

  const handleDownload = async () => {
    try {
      setStatus('Generating audio...');

      // Try client-side recording with MediaRecorder
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      // const dest = ctx.createMediaStreamDestination(); // Reserved for future Web Audio API integration

      // Attempt to route speechSynthesis to MediaStream (limited browser support)
      // For MVP, fallback to server or simple download via blob
      
      // Fallback: POST to server for audio generation
      const response = await fetch('/api/tts?download=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voices[selectedVoiceIndex]?.name || 'default',
          format: 'mp3',
          rate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `retrospective-${new Date().toISOString().slice(0, 10)}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setStatus('Downloaded');
    } catch (error) {
      // If server download fails, suggest copying text
      setStatus('Download unavailable. Copy text and use external TTS tool.');
      onError?.(error.message);
    }
  };

  const playButtonLabel = isPlaying && !isPaused ? 'Pause' : isPlaying && isPaused ? 'Resume' : 'Play';

  return (
    <div className="retrospective-speech" role="region" aria-label="Text-to-speech controls">
      <div className="controls">
        <button
          className="btn btn-primary"
          onClick={handlePlay}
          aria-label={playButtonLabel}
          title={`${playButtonLabel} (Space)`}
        >
          ▶️ {playButtonLabel}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleStop}
          aria-label="Stop"
          title="Stop (S)"
          disabled={!isPlaying}
        >
          ⏹️ Stop
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleDownload}
          aria-label="Download as MP3"
          title="Download (D)"
        >
          ⬇️ Download
        </button>
      </div>

      <div className="settings">
        <div className="setting-group">
          <label htmlFor="voice-select">Voice</label>
          <select
            id="voice-select"
            value={selectedVoiceIndex}
            onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
            aria-label="Select voice"
          >
            {voices.length === 0 ? (
              <option>No voices available</option>
            ) : (
              voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="rate-slider">
            Speed: {rate.toFixed(1)}x
          </label>
          <input
            id="rate-slider"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            aria-label="Speech rate"
          />
        </div>

        <div className="setting-group">
          <label htmlFor="pitch-slider">
            Pitch: {pitch.toFixed(1)}
          </label>
          <input
            id="pitch-slider"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            aria-label="Speech pitch"
          />
        </div>
      </div>

      <div className="status" aria-live="polite" aria-atomic="true">
        <span>{status}</span> <span className="time">{currentTime}</span>
      </div>

      <div className="text-display">
        <p>{text}</p>
      </div>
    </div>
  );
}

export default RetrospectiveSpeech;
