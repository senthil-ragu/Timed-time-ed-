import { useMemo, useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  formatDurationShort, sumSeconds, groupByDate, todayKey, isoToDateKey,
} from '../utils/timeUtils';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="p-3"
      style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className={`bi ${icon}`} style={{ color: color || 'var(--accent)', fontSize: '1rem' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div className="font-mono fw-bold" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

function MiniBar({ percent, color }) {
  return (
    <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function StatsPanel() {
  const { sessions, topics, clearAllData, getTopicById } = useTracker();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ── Aggregate stats ───────────────────────────────────────────
  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    const totalSec = sumSeconds(sessions);
    const byDate   = groupByDate(sessions);
    const today    = sumSeconds(sessions.filter(s => isoToDateKey(s.startedAt) === todayKey()));

    // Streak (consecutive days up to today)
    const sortedDays = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    const cur = new Date(); cur.setHours(0,0,0,0);
    for (const day of sortedDays) {
      const d = new Date(day + 'T00:00:00');
      const diff = Math.round((cur - d) / 86400000);
      if (diff === streak) { streak++; } else break;
    }

    // Best day
    let bestDay = '', bestSec = 0;
    for (const [day, sArr] of Object.entries(byDate)) {
      const s = sumSeconds(sArr);
      if (s > bestSec) { bestSec = s; bestDay = day; }
    }

    // Per-topic breakdown
    const topicMap = {};
    for (const s of sessions) {
      if (!topicMap[s.topicId]) topicMap[s.topicId] = 0;
      topicMap[s.topicId] += s.duration;
    }

    // Last 7 days bar data
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const key = d.toISOString().slice(0,10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7.push({ label, sec: sumSeconds(byDate[key] || []) });
    }
    const maxDay = Math.max(...last7.map(d => d.sec), 1);

    return { totalSec, today, streak, bestSec, bestDay, topicMap, totalDays: sortedDays.length, last7, maxDay };
  }, [sessions]);

  // ── Export as JSON ────────────────────────────────────────────
  const handleExport = () => {
    const data = { exportedAt: new Date().toISOString(), topics, sessions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `learn-tracker-${todayKey()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!stats) {
    return (
      <div className="text-center py-5 fade-in-up" style={{ color: 'var(--text-muted)' }}>
        <i className="bi bi-bar-chart" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
        <p className="mt-3 mb-0">Record some sessions to see your stats.</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      {/* ── Overview cards ──────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard label="Total Time"    value={formatDurationShort(stats.totalSec)} icon="bi-clock"         color="var(--accent)" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Today"         value={formatDurationShort(stats.today)}    icon="bi-sun"            color="var(--warning)" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Day Streak"    value={`${stats.streak}d`}                  icon="bi-fire"           color="#fb923c" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Sessions"      value={sessions.length}                     icon="bi-collection"     color="var(--info)" />
        </div>
      </div>

      {/* ── Last 7 days ─────────────────────────────────────── */}
      <div className="p-4 mb-4"
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <p className="mb-3" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Last 7 Days
        </p>
        <div className="d-flex align-items-end gap-2">
          {stats.last7.map((day, i) => {
            const pct = (day.sec / stats.maxDay) * 100;
            const isToday = i === 6;
            return (
              <div key={i} className="d-flex flex-column align-items-center flex-grow-1 gap-1">
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {day.sec > 0 ? formatDurationShort(day.sec) : ''}
                </span>
                <div style={{
                  width: '100%', minHeight: 6,
                  height: `${Math.max(pct * 1.2, day.sec > 0 ? 8 : 0)}px`,
                  maxHeight: 120,
                  background: isToday ? 'var(--accent)' : 'var(--info)',
                  borderRadius: '4px 4px 0 0',
                  opacity: day.sec > 0 ? 1 : 0.12,
                  transition: 'height 0.4s ease',
                }} />
                <span style={{ fontSize: '0.65rem', color: isToday ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Per-topic breakdown ──────────────────────────────── */}
      <div className="p-4 mb-4"
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <p className="mb-3" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          By Topic
        </p>
        <div className="d-flex flex-column gap-3">
          {Object.entries(stats.topicMap)
            .sort(([,a],[,b]) => b - a)
            .map(([topicId, sec]) => {
              const topic = getTopicById(topicId);
              const pct   = (sec / stats.totalSec) * 100;
              return (
                <div key={topicId}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: '0.88rem', color: topic?.color || 'var(--text-muted)', fontWeight: 600 }}>
                      {topic ? <><i className={`bi ${topic.icon} me-1`} />{topic.name}</> : 'Deleted'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {formatDurationShort(sec)} <span style={{ color: 'var(--text-muted)' }}>({Math.round(pct)}%)</span>
                    </span>
                  </div>
                  <MiniBar percent={pct} color={topic?.color || 'var(--text-muted)'} />
                </div>
              );
            })}
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="d-flex gap-2 flex-wrap">
        <button onClick={handleExport}
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{ background: 'var(--info-dim)', color: 'var(--info)', border: '1px solid var(--info)', borderRadius: 'var(--radius-sm)' }}>
          <i className="bi bi-download" /> Export JSON
        </button>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)}
            className="btn btn-sm d-flex align-items-center gap-2"
            style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)' }}>
            <i className="bi bi-trash" /> Clear All Data
          </button>
        ) : (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '31px' }}>Sure?</span>
            <button onClick={() => { clearAllData(); setShowClearConfirm(false); }}
              className="btn btn-sm"
              style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)' }}>
              Yes, clear
            </button>
            <button onClick={() => setShowClearConfirm(false)}
              className="btn btn-sm"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
