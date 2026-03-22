import { useState } from 'react';
import { useTracker } from '../context/TrackerContext';

const COLORS = [
  '#4ade80', '#60a5fa', '#a78bfa', '#f472b6',
  '#fb923c', '#facc15', '#34d399', '#f87171',
];
const ICONS = [
  'bi-code-slash', 'bi-book', 'bi-diagram-3', 'bi-cpu',
  'bi-brush', 'bi-music-note', 'bi-calculator', 'bi-flask',
  'bi-globe', 'bi-camera', 'bi-controller', 'bi-pen',
];

export default function TopicSelector({ selectedId, onSelect, disabled }) {
  const { topics, addTopic, updateTopic, deleteTopic } = useTracker();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // topic obj or null for new
  const [form, setForm] = useState({ name: '', color: COLORS[0], icon: ICONS[0] });
  const [error, setError] = useState('');

  const openNew = () => {
    setEditTarget(null);
    setForm({ name: '', color: COLORS[0], icon: ICONS[0] });
    setError('');
    setShowModal(true);
  };

  const openEdit = (e, topic) => {
    e.stopPropagation();
    setEditTarget(topic);
    setForm({ name: topic.name, color: topic.color, icon: topic.icon });
    setError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError('Topic name is required.'); return; }
    if (editTarget) {
      updateTopic(editTarget.id, form);
    } else {
      const newTopic = addTopic(form);
      onSelect(newTopic.id);
    }
    setShowModal(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Remove this topic? Sessions will be kept.')) {
      if (selectedId === id) onSelect(topics.find(t => t.id !== id)?.id || '');
      deleteTopic(id);
    }
  };

  const selected = topics.find(t => t.id === selectedId);

  return (
    <>
      {/* ── Selector UI ─────────────────────────────────────── */}
      <div>
        <label className="form-label mb-1" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Topic
        </label>
        <div className="d-flex gap-2 flex-wrap">
          {topics.map(topic => (
            <button
              key={topic.id}
              disabled={disabled}
              onClick={() => onSelect(topic.id)}
              className="btn btn-sm d-flex align-items-center gap-2 position-relative"
              style={{
                background: selectedId === topic.id ? `${topic.color}22` : 'var(--bg-card)',
                border: `1.5px solid ${selectedId === topic.id ? topic.color : 'var(--border)'}`,
                color: selectedId === topic.id ? topic.color : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: selectedId === topic.id ? 600 : 400,
                transition: 'var(--transition)',
                paddingRight: '2rem',
              }}
            >
              <i className={`bi ${topic.icon}`} />
              {topic.name}
              {/* Edit/delete micro-controls */}
              {!disabled && (
                <span className="d-flex gap-1 position-absolute"
                  style={{ right: '0.35rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.7rem' }}>
                  <i className="bi bi-pencil" style={{ cursor: 'pointer' }} onClick={e => openEdit(e, topic)} />
                  <i className="bi bi-x" style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={e => handleDelete(e, topic.id)} />
                </span>
              )}
            </button>
          ))}
          <button
            disabled={disabled}
            onClick={openNew}
            className="btn btn-sm"
            style={{
              background: 'transparent',
              border: '1.5px dashed var(--border)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition)',
            }}
          >
            <i className="bi bi-plus" /> New
          </button>
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-bold">{editTarget ? 'Edit Topic' : 'New Topic'}</h6>
                <button className="btn-close btn-close-white btn-sm" onClick={() => setShowModal(false)} />
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, System Design…"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }}
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  autoFocus
                  maxLength={40}
                />
                {error && <div className="mt-1" style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{error}</div>}
              </div>

              {/* Color */}
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Color</label>
                <div className="d-flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: c, border: form.color === c ? `3px solid white` : '3px solid transparent',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }} />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Icon</label>
                <div className="d-flex gap-2 flex-wrap">
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className="btn btn-sm"
                      style={{
                        background: form.icon === ic ? 'var(--accent-dim)' : 'var(--bg-input)',
                        border: `1px solid ${form.icon === ic ? 'var(--border-focus)' : 'var(--border)'}`,
                        color: form.icon === ic ? 'var(--accent)' : 'var(--text-secondary)',
                        width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <i className={`bi ${ic}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-sm" onClick={() => setShowModal(false)}
                  style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button className="btn btn-sm fw-semibold" onClick={handleSave}
                  style={{ background: 'var(--accent)', color: '#0f1117', border: 'none', minWidth: 80 }}>
                  {editTarget ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
