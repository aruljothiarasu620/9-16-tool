'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatTimeAgo, formatDate } from '@/lib/utils';
import { generateId } from '@/lib/utils';

export default function DashboardPage() {
  const { scenarios, runLogs, addScenario, updateScenario, deleteScenario } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = scenarios.filter((s) => filter === 'all' || s.status === filter);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newScenario = {
      id: generateId(),
      name: newName.trim(),
      status: 'inactive' as const,
      lastRun: null,
      modules: [],
      connections: [],
      createdAt: new Date().toISOString(),
    };
    addScenario(newScenario);
    setNewName('');
    setShowCreate(false);
  };

  const recentLogs = runLogs.slice(0, 5);

  const stats = {
    total: scenarios.length,
    active: scenarios.filter((s) => s.status === 'active').length,
    success: runLogs.filter((l) => l.status === 'success').length,
    failed: runLogs.filter((l) => l.status === 'failed').length,
  };

  return (
    <div style={{ padding: '32px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}
            className="gradient-text">
            Automation Scenarios
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Build and automate your Instagram content workflow
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>+</span> New Scenario
        </button>
      </div>

      {/* Stats Row */}
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Scenarios', value: stats.total, color: '#7c3aed', icon: '⚡' },
          { label: 'Active', value: stats.active, color: '#10b981', icon: '✅' },
          { label: 'Successful Runs', value: stats.success, color: '#06b6d4', icon: '🚀' },
          { label: 'Failed Runs', value: stats.failed, color: '#ef4444', icon: '❌' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
              </div>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
              background: filter === f ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: filter === f ? 'var(--accent-light)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Scenarios list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 && (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No scenarios yet</div>
              <button className="btn-primary" onClick={() => setShowCreate(true)}>Create First Scenario</button>
            </div>
          )}
          {filtered.map((scenario, i) => {
            const scenarioLogs = runLogs.filter((l) => l.scenarioId === scenario.id);
            const lastLog = scenarioLogs[0];
            return (
              <div key={scenario.id} className="card animate-fade-in"
                style={{ padding: '20px', animationDelay: `${i * 60}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{scenario.name}</h3>
                      <span className={`badge ${scenario.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        <span className={`status-dot ${scenario.status}`} />
                        {scenario.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>
                        🕐 {scenario.lastRun ? formatTimeAgo(scenario.lastRun) : 'Never run'}
                      </span>
                      <span>📦 {scenario.modules.length} modules</span>
                      <span>📅 Created {formatTimeAgo(scenario.createdAt)}</span>
                    </div>
                    {lastLog && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        <span className={`badge ${lastLog.status === 'success' ? 'badge-active' : 'badge-failed'}`}>
                          {lastLog.status === 'success' ? '✓' : '✗'} Last run: {lastLog.details}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    {/* Toggle */}
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={scenario.status === 'active'}
                        onChange={(e) => {
                          const newStatus = e.target.checked ? 'active' : 'inactive';
                          updateScenario(scenario.id, { status: newStatus });
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <Link href={`/builder?id=${scenario.id}`}>
                      <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(scenario.id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right panel: Run Logs */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> Recent Run History
            </h2>
            {recentLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No runs yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentLogs.map((log) => {
                  const scenario = scenarios.find((s) => s.id === log.scenarioId);
                  return (
                    <div key={log.id} className={`log-entry ${log.status === 'success' ? 'success' : log.status === 'failed' ? 'error' : 'info'}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>
                          {scenario?.name || 'Unknown'}
                        </span>
                        <span className={`badge ${log.status === 'success' ? 'badge-active' : log.status === 'running' ? 'badge-running' : 'badge-failed'}`}
                          style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {log.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>{log.details}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{formatDate(log.timestamp)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create scenario modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowCreate(false)}>
          <div className="card animate-fade-in" style={{ padding: '32px', width: '400px' }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>
              <span className="gradient-text">Create New Scenario</span>
            </h2>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Scenario Name
            </label>
            <input
              className="input"
              placeholder="e.g. Daily Product Post"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={{ marginBottom: '20px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={handleCreate} style={{ flex: 1 }}>
                Create Scenario
              </button>
              <button className="btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setDeleteConfirm(null)}>
          <div className="card animate-fade-in" style={{ padding: '32px', width: '380px' }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px', color: '#ef4444' }}>
              Delete Scenario?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              This action cannot be undone. All modules and connections will be lost.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { 
                  deleteScenario(deleteConfirm!); 
                  setDeleteConfirm(null); 
                }}>
                Delete
              </button>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer style={{ marginTop: '60px', padding: '24px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          © 2026 InstaFlow Automation Builder · <Link href="/privacy" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
}
