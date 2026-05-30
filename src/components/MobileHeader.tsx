'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/builder': 'Scenario Builder',
  '/instagram': 'Instagram Connect',
  '/settings': 'Settings',
  '/admin': 'Admin Panel',
};

export default function MobileHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const title = PAGE_TITLES[pathname] || 'InstaFlow';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <>
      <header className="mobile-header" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        zIndex: 400,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.jpg"
            alt="InstaFlow"
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px', objectFit: 'cover',
            }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {title}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1, marginTop: '2px' }}>
              InstaFlow
            </div>
          </div>
        </div>

        {/* Right: User avatar */}
        {user && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'none',
              border: '2px solid var(--border)',
              borderRadius: '50%',
              padding: 0,
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              overflow: 'hidden',
            }}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, var(--accent), var(--pink))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '14px', fontWeight: 700,
              }}>
                {user.displayName?.[0] || '?'}
              </div>
            )}
          </button>
        )}
      </header>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 800,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          <div style={{
            position: 'fixed', top: '64px', right: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px',
            zIndex: 900,
            minWidth: '200px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.15s ease',
          }}>
            {user && (
              <>
                <div style={{ padding: '8px 4px 12px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.displayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => { logoutUser(); setShowMenu(false); }}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px', color: '#ef4444',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  🚪 Sign Out
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
