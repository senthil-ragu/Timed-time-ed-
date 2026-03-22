import { useState, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  formatDate, formatTime, formatDuration, formatDurationShort,
  groupByDate, sumSeconds,
} from '../utils/timeUtils';

export default function SessionHistory() {
  const { sessions, topics, deleteSession, updateSession, getTopicById } = useTracker();
  const [filterTopic, setFilterTopic] = useState('');
  const [editId, setEditId]           = useState(null);
  const [editNote, setEditNote]       = useState('');

  const filtered = useMemo(() => {
    return filterTopic ? sessions.filter(s => s.topicId === filterTopic) : sessions;
  }, [sessions, filterTopic]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const startEdit = (session) => {
    setEditId(session.id);
    setEditNote(session.note || '');
  };
  const saveEdit = () => {
    updateSession(editId, { note: editNote });
    setEditId(null);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-5 fade-in-up" style={{ color: 'var(--text-muted)' }}>
        <i className="bi bi-hourglass" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
        <p className="mt-3 mb-0">No sessions yet. Start the timer!</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="d-flex gap-2 mb-4 flex-wrap align-items-center justify-content-between">
        <div className="d-flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterTopic('')}
            className="btn btn-sm"
            style={{
              background: !filterTopic ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${!filterTopic ? 'var(--border-focus)' : 'var(--border)'}`,
              color: !filterTopic ? 'var(--accent)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}>
            All
          </button>
          {topics.map(t => (
            <button key={t.id}
              onClick={() => setFilterTopic(t.id)}
              className="btn btn-sm"
              style={{
                background: filterTopic === t.id ? `${t.color}22` : 'var(--bg-card)',
                border: `1px solid ${filterTopic === t.id ? t.color : 'var(--border)'}`,
                color: filterTopic === t.id ? t.color : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
              }}>
              <i className={`bi ${t.icon} me-1`} />{t.name}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          {' · '}
          {formatDurationShort(sumSeconds(filtered))} total
        </span>
      </div>

      {/* ── Grouped session list ─────────────────────────────── */}
      {dateKeys.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sessions match this filter.</p>
      ) : (
        dateKeys.map(dateKey => {
          const daySessions = grouped[dateKey];
          const dayTotal    = sumSeconds(daySessions);
          return (
            <div key={dateKey} className="mb-4">
              {/* Date header */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {formatDate(daySessions[0].startedAt)}
                </span>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formatDurationShort(dayTotal)}
                </span>
              </div>

              {/* Sessions */}
              <div className="d-flex flex-column gap-2">
                {daySessions.map(session => {
                  const topic = getTopicById(session.topicId);
                  return (
                    <div key={session.id}
                      className="p-3 d-flex align-items-start gap-3"
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        transition: 'var(--transition)',
                      }}>
                      {/* Color accent */}
                      <div style={{
                        width: 4, borderRadius: 4, alignSelf: 'stretch',
                        background: topic?.color || 'var(--text-muted)',
                        flexShrink: 0,
                      }} />

                      {/* Content */}
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          {topic ? (
                            <span className="badge" style={{
                              background: `${topic.color}22`,
                              color: topic.color,
                              border: `1px solid ${topic.color}55`,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}>
                              <i className={`bi ${topic.icon} me-1`} />{topic.name}
                            </span>
                          ) : (
                            <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                              Deleted topic
                            </span>
                          )}
                          <span className="font-mono fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {formatDuration(session.duration)}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            at {formatTime(session.startedAt)}
                          </span>
                        </div>

                        {/* Note */}
                        {editId === session.id ? (
                          <div className="d-flex gap-2 mt-1">
                            <input
                              className="form-control form-control-sm flex-grow-1"
                              value={editNote}
                              onChange={e => setEditNote(e.target.value)}
                              maxLength={120}
                              autoFocus
                              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                            <button className="btn btn-sm" onClick={saveEdit}
                              style={{ background: 'var(--accent)', color: '#0f1117', border: 'none', fontSize: '0.78rem' }}>
                              Save
                            </button>
                            <button className="btn btn-sm" onClick={() => setEditId(null)}
                              style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          session.note && (
                            <p className="mb-0 mt-1" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <i className="bi bi-chat-left-text me-1" style={{ opacity: 0.5 }} />
                              {session.note}
                            </p>
                          )
                        )}
                      </div>

                      {/* Actions */}
                      {editId !== session.id && (
                        <div className="d-flex gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(session)}
                            className="btn btn-sm"
                            title="Edit note"
                            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '0.75rem', padding: '2px 8px' }}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button onClick={() => { if (confirm('Delete this session?')) deleteSession(session.id); }}
                            className="btn btn-sm"
                            title="Delete session"
                            style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger-dim)', fontSize: '0.75rem', padding: '2px 8px' }}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
