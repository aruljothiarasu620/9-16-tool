'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatTimeAgo, formatDate } from '@/lib/utils';
import { generateId } from '@/lib/utils';

export default function DashboardPage() {
  const store = useStore();
  const { scenarios, runLogs, addScenario, updateScenario, deleteScenario } = store;
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showMediaLinksModal, setShowMediaLinksModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const extractUrls = () => {
    const urls: { source: string; url: string; type: string }[] = [];
    
    // 1. Extract from scenarios
    if (Array.isArray(scenarios)) {
      scenarios.forEach((scen: any) => {
        if (scen && Array.isArray(scen.modules)) {
          scen.modules.forEach((mod: any) => {
            if (mod && mod.config) {
              if (typeof mod.config.imageUrl === 'string' && mod.config.imageUrl.trim()) {
                urls.push({
                  source: `Scenario: ${scen.name || 'Unnamed'} (${mod.label || 'Unnamed'})`,
                  url: mod.config.imageUrl.trim(),
                  type: 'Configured Image'
                });
              }
              if (Array.isArray(mod.config.images)) {
                mod.config.images.forEach((img: any, idx: number) => {
                  if (typeof img === 'string' && img.trim()) {
                    urls.push({
                      source: `Scenario: ${scen.name || 'Unnamed'} (${mod.label || 'Unnamed'} - Slide ${idx + 1})`,
                      url: img.trim(),
                      type: 'Configured Image'
                    });
                  }
                });
              }
            }
          });
        }
      });
    }

    // 2. Extract from runLogs
    if (Array.isArray(runLogs)) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      runLogs.forEach((log: any) => {
        if (log && typeof log.details === 'string') {
          const matches = log.details.match(urlRegex);
          if (matches) {
            matches.forEach((urlStr: string) => {
              urls.push({
                source: `Log: ${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown Date'}`,
                url: urlStr,
                type: 'Execution Output'
              });
            });
          }
        }
      });
    }
    return urls;
  };

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
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '32px' }} className="dashboard-page">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '28px',
        gap: '16px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, marginBottom: '6px' }}
            className="gradient-text">
            Automation Scenarios
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Build and automate your Instagram content workflow
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {store.tier === 'lifetime' && (
            <button className="btn-secondary" onClick={() => setShowMediaLinksModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', fontWeight: 600 }}>
              <span>🔗</span> <span className="btn-label">Media & Output Links</span>
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span>+</span> <span className="btn-label">New Scenario</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="responsive-grid stats-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Scenarios', value: stats.total, color: 'var(--accent)', icon: '⚡' },
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
              background: filter === f ? 'var(--accent-glow)' : 'transparent',
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
                <div className="scenario-card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
                  <div className="scenario-card-actions" style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
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
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }} onClick={() => setShowCreate(false)}>
          <div className="card animate-fade-in" style={{ padding: '28px', width: '100%', maxWidth: '420px' }}
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
              style={{ marginBottom: '20px', fontSize: '16px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={handleCreate} style={{ flex: 1 }}>
                Create
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
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }} onClick={() => setDeleteConfirm(null)}>
          <div className="card animate-fade-in" style={{ padding: '28px', width: '100%', maxWidth: '380px' }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px', color: '#ef4444' }}>
              Delete Scenario?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              This action cannot be undone. All modules and connections will be lost.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
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
      {/* Media & Output Links Modal */}
      {showMediaLinksModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }} onClick={() => setShowMediaLinksModal(false)}>
          <div className="card animate-fade-in" style={{ padding: '28px', width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gradient-text">🔗 Media & Output Links</span>
              </h2>
              <button 
                onClick={() => setShowMediaLinksModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {(() => {
                const urls = extractUrls();
                if (urls.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>No media or output links found.</p>
                      <p style={{ fontSize: '13px' }}>Once your scenarios execute successfully, your generated images and published post URLs will appear here.</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {urls.map((item, idx) => (
                      <div key={idx} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span className="badge" style={{
                              background: item.type === 'Execution Output' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: item.type === 'Execution Output' ? '#10b981' : '#3b82f6',
                              border: `1px solid ${item.type === 'Execution Output' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                              fontSize: '11px',
                              padding: '2px 8px'
                            }}>
                              {item.type}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.source}</span>
                          </div>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)', fontSize: '13px', textDecoration: 'underline', fontWeight: 500 }}>
                              {item.url}
                            </a>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            🌐 Open
                          </a>
                          <button 
                            className="btn-primary" 
                            onClick={() => handleCopyUrl(item.url)}
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: copiedUrl === item.url ? '#10b981' : 'var(--accent)' }}
                          >
                            {copiedUrl === item.url ? '✓ Copied' : '📋 Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer style={{ marginTop: '60px', padding: '24px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          © 2026 InstaFlow · made by mamitha.crushae · <Link href="/privacy" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
}
