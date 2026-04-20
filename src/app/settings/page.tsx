'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function SettingsPage() {
  const { instagramAccounts, removeInstagramAccount, settings, updateSettings, runLogs } = useStore();
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const set = (key: string, value: unknown) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: '32px', background: 'var(--bg-primary)', minHeight: '100vh', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configure API credentials, accounts, and preferences</p>
      </div>

      {/* API Credentials */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔑</span> API Credentials
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          Required for Instagram OAuth login. Create a Facebook Developer app at{' '}
          <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
            developers.facebook.com
          </a>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
              Facebook App ID
            </label>
            <input className="input" placeholder="1234567890"
              value={localSettings.facebookAppId}
              onChange={(e) => set('facebookAppId', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
              App Secret
            </label>
            <input className="input" type="password" placeholder="••••••••••••••••"
              value={localSettings.facebookAppSecret}
              onChange={(e) => set('facebookAppSecret', e.target.value)} />
          </div>
        </div>

        {/* Required permissions list */}
        <div style={{ padding: '14px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Required Permissions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              'instagram_basic',
              'instagram_content_publish',
              'pages_read_engagement',
              'pages_manage_posts',
            ].map((perm) => (
              <code key={perm} style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: 'var(--accent-light)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
              }}>
                {perm}
              </code>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: '14px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Setup Steps
          </div>
          {[
            'Go to developers.facebook.com and create a new app',
            'Add "Instagram" and "Facebook Login" products to your app',
            'Configure OAuth redirect URI: https://localhost:3000',
            'Add permissions listed above in the App Review section',
            'Copy App ID and Secret here and click Save',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{
                background: 'var(--accent)',
                color: 'white',
                width: '20px', height: '20px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700,
                flexShrink: 0,
              }}>{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📸</span> Connected Instagram Accounts
          </h2>
          <Link href="/instagram">
            <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
              + Add Account
            </button>
          </Link>
        </div>

        {instagramAccounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.4 }}>📸</div>
            <div style={{ marginBottom: '12px' }}>No Instagram accounts connected</div>
            <Link href="/instagram">
              <button className="btn-primary" style={{ fontSize: '13px' }}>Connect Account</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {instagramAccounts.map((account) => (
              <div key={account.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', border: '2px solid var(--accent)',
                }}>
                  {account.profilePicture
                    ? <img src={account.profilePicture} alt={account.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>📸</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>@{account.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {account.followerCount.toLocaleString()} followers · Connected {new Date(account.connectedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge badge-active">
                  <span className="status-dot active" /> Active
                </span>
                <button
                  onClick={() => removeInstagramAccount(account.id)}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔔</span> Notification Preferences
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {[
            { key: 'notifyOnSuccess', label: 'Notify on successful run', desc: 'Get notified when a scenario completes' },
            { key: 'notifyOnFailure', label: 'Notify on failure', desc: 'Get notified when a scenario fails' },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={localSettings[key as keyof typeof localSettings] as boolean}
                  onChange={(e) => set(key, e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
            Notification Email
          </label>
          <input className="input" type="email" placeholder="you@example.com"
            value={localSettings.notifyEmail}
            onChange={(e) => set('notifyEmail', e.target.value)} />
        </div>
      </div>

      {/* Run History Summary */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> Usage Statistics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Runs', value: runLogs.length, icon: '⚡' },
            { label: 'Successful', value: runLogs.filter(l => l.status === 'success').length, icon: '✅' },
            { label: 'Failed', value: runLogs.filter(l => l.status === 'failed').length, icon: '❌' },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-light)' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.icon} {stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 32px' }}>
          💾 Save Settings
        </button>
        {saved && (
          <span className="badge badge-active" style={{ animation: 'fadeIn 0.3s ease' }}>
            ✓ Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}
