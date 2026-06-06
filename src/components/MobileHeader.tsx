'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/builder': 'Builder',
  '/instagram': 'Instagram',
  '/img-to-url': 'Img to URL',
  '/settings': 'Settings',
  '/admin': 'Admin',
};

export default function MobileHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith('/builder')) return null;
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const title = PAGE_TITLES[pathname] || 'InstaFlow';
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <>
      {/* Fixed top header */}
      <header className="mobile-header">
        {/* Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.jpg"
            alt="InstaFlow"
            style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {title}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              InstaFlow
            </div>
          </div>
        </div>

        {/* User avatar */}
        {user && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--pink))',
              border: '2px solid var(--border)',
              borderRadius: '50%',
              padding: 0,
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>
                {user.displayName?.[0] || 'U'}
              </span>
            )}
          </button>
        )}
      </header>

      {/* User dropdown */}
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
            minWidth: '220px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.15s ease',
          }}>
            {user && (
              <>
                <div style={{
                  padding: '8px 4px 12px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '10px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.displayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user.email}
                  </div>
                </div>

                {/* Mobile Extra Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '8px',
                        color: 'var(--accent-light)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      <span>🛡️</span> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { setIsHelpOpen(true); setShowMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span>ℹ️</span> Help & Guide
                  </button>
                </div>

                <button
                  onClick={() => { logoutUser(); setShowMenu(false); }}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  🚪 Sign Out
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Help & Guide Mobile Drawer */}
      {isHelpOpen && (
        <>
          <div
            onClick={() => setIsHelpOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '100%', maxWidth: '300px',
            background: '#13101f', borderLeft: '1px solid var(--border)',
            zIndex: 1001, display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
            animation: 'slideInRight 0.3s ease',
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Help & Guide</h2>
              <button onClick={() => setIsHelpOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '16px' }}>
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--accent-light)' }}>1. Switch to Business Account</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Convert your Instagram account from Personal to a Professional Business or Creator account in Instagram app settings.</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: '#1877F2' }}>2. Link Facebook Page</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Link your Instagram Business/Creator account to your Facebook Page.</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--success)' }}>3. Connect Facebook</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Connect your Facebook account to this web app. (Note: The first connection must be done on a PC/Desktop to authorize correctly).</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--pink-light)' }}>4. Ready to Post</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Done! You are now ready to schedule, automate, and publish posts.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
