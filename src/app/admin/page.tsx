'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, logoutUser } from '@/lib/firebase';
import Link from 'next/link';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div style={{ padding: '32px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          🛡️ Admin Panel
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Restricted access · Logged in as <strong style={{ color: 'var(--accent-light)' }}>{user?.email}</strong>
        </p>
      </div>

      {/* Stats placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: '—', color: '#7c3aed', icon: '👥' },
          { label: 'Active Sessions', value: '—', color: '#10b981', icon: '🟢' },
          { label: 'Posts Today', value: '—', color: '#06b6d4', icon: '📸' },
          { label: 'Errors Today', value: '—', color: '#ef4444', icon: '⚠️' },
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

      {/* Admin sections shell */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>👤 User Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            View and manage all registered users, their connected accounts and usage statistics.
          </p>
          <div style={{
            marginTop: '16px', padding: '12px', background: 'rgba(124,58,237,0.08)',
            borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)',
          }}>
            🔧 Content will be added in the next phase.
          </div>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>📊 Platform Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Monitor post volume, success rates, error trends, and API usage across all users.
          </p>
          <div style={{
            marginTop: '16px', padding: '12px', background: 'rgba(124,58,237,0.08)',
            borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)',
          }}>
            🔧 Content will be added in the next phase.
          </div>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>⚙️ App Configuration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Manage global Facebook App ID, API rate limits, and feature flags.
          </p>
          <div style={{
            marginTop: '16px', padding: '12px', background: 'rgba(124,58,237,0.08)',
            borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)',
          }}>
            🔧 Content will be added in the next phase.
          </div>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>🪵 System Logs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Real-time audit logs of all scenario executions, API failures, and auth events.
          </p>
          <div style={{
            marginTop: '16px', padding: '12px', background: 'rgba(124,58,237,0.08)',
            borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)',
          }}>
            🔧 Content will be added in the next phase.
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'var(--accent-light)', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to User Dashboard
        </Link>
      </div>
    </div>
  );
}
