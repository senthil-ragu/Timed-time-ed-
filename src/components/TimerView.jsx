import { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useTracker } from '../context/TrackerContext';
import { formatDuration, formatDurationShort, sumSeconds } from '../utils/timeUtils';
import TopicSelector from './TopicSelector';

export default function TimerView({ onSessionSaved }) {
  const { topics, sessions, addSession, getTopicById } = useTracker();
  const { isRunning, elapsed, start, stop, reset } = useTimer();

  const [selectedTopicId, setSelectedTopicId] = useState(() => topics[0]?.id || '');
  const [note, setNote]                       = useState('');
  const [saved, setSaved]                     = useState(false);   // flash feedback

  // Keep selectedTopicId valid if topics list changes
  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) setSelectedTopicId(topics[0].id);
  }, [topics, selectedTopicId]);

  // Recover topic context after page refresh mid-session
  useEffect(() => {
    const raw = localStorage.getItem('lt_active_session');
    if (raw) {
      try {
        const { topicId } = JSON.parse(raw);
        if (topicId) setSelectedTopicId(topicId);
      } catch { /* ignore */ }
    }
  }, []);

  const handleStart = () => {
    if (!selectedTopicId) return;
    setSaved(false);
    start(selectedTopicId);
  };

  const handleStop = () => {
    const { startedAt, elapsed: dur } = stop();
    if (dur < 5) { reset(); return; }   // ignore accidental < 5s taps
    addSession({ topicId: selectedTopicId, startedAt, duration: dur, note });
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSessionSaved?.();
  };

  const topic       = getTopicById(selectedTopicId);
  const topicTotal  = sumSeconds(sessions.filter(s => s.topicId === selectedTopicId));

  const displayTime = formatDuration(elapsed);

  return (
    <div className="fade-in-up">
      {/* ── Clock face ──────────────────────────────────────── */}
      <div className="text-center mb-4">
        <div
          className={`d-inline-flex align-items-center justify-content-center ${isRunning ? 'pulse-ring' : ''}`}
          style={{
            width: 220, height: 220,
            borderRadius: '50%',
            background: `radial-gradient(circle at 60% 40%, ${topic?.color || 'var(--accent)'}18, transparent 70%), var(--bg-card)`,
            border: `2.5px solid ${isRunning ? (topic?.color || 'var(--accent)') : 'var(--border)'}`,
            transition: 'border-color 0.4s ease',
            boxShadow: isRunning ? `0 0 40px ${topic?.color || 'var(--accent)'}30` : 'var(--shadow-card)',
          }}
        >
          <div>
            <div className="font-mono" style={{
              fontSize: '2.6rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: isRunning ? (topic?.color || 'var(--accent)') : 'var(--text-primary)',
              lineHeight: 1,
              transition: 'color 0.3s',
            }}>
              {displayTime}
            </div>
            {isRunning && (
              <div className="text-center mt-1 tick-anim" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ● recording
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Topic selector ──────────────────────────────────── */}
      <div className="mb-4">
        <TopicSelector
          selectedId={selectedTopicId}
          onSelect={setSelectedTopicId}
          disabled={isRunning}
        />
      </div>

      {/* ── Note field ─────────────────────────────────────── */}
      {!isRunning && (
        <div className="mb-4">
          <label className="form-label mb-1" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Session Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="What will you work on? e.g. 'React hooks deep dive'"
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={120}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      {/* ── Control buttons ────────────────────────────────── */}
      <div className="d-flex gap-3 justify-content-center">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!selectedTopicId || topics.length === 0}
            className="btn fw-bold px-5 py-2"
            style={{
              background: 'var(--accent)',
              color: '#0f1117',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              letterSpacing: '-0.01em',
              transition: 'var(--transition)',
              minWidth: 160,
            }}
          >
            <i className="bi bi-play-fill me-2" />
            Start Session
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="btn fw-bold px-5 py-2"
            style={{
              background: 'var(--danger)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              minWidth: 160,
            }}
          >
            <i className="bi bi-stop-fill me-2" />
            Stop &amp; Save
          </button>
        )}
      </div>

      {/* ── Saved toast ─────────────────────────────────────── */}
      {saved && (
        <div className="text-center mt-3 fade-in-up"
          style={{ color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 500 }}>
          <i className="bi bi-check-circle me-1" />
          Session saved!
        </div>
      )}

      {/* ── Topic cumulative stat ───────────────────────────── */}
      {topic && topicTotal > 0 && (
        <div className="mt-4 p-3 text-center"
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Total time on </span>
          <span style={{ color: topic.color, fontWeight: 600 }}>
            <i className={`bi ${topic.icon} me-1`} />{topic.name}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>: </span>
          <span className="font-mono fw-bold" style={{ color: 'var(--text-primary)' }}>
            {formatDurationShort(topicTotal)}
          </span>
        </div>
      )}
    </div>
  );
}
