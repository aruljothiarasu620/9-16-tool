'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { auth, loginWithGoogle, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⚡' },
  { href: '/builder', label: 'Builder', icon: '🔧' },
  { href: '/instagram', label: 'Instagram', icon: '📸' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const store = useStore();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setIsMobileOpen(false); // Close sidebar on navigation
  }, [pathname]);

  const isAdmin = firebaseUser?.email === ADMIN_EMAIL;

  return (
    <>
      <button 
        className="mobile-nav-toggle" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      <aside 
        className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: '220px',
          minHeight: '100vh',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 12px',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 8px 28px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} 
          />
          <div className="sidebar-label">
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>InstaFlow</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>made by mamitha.crushae</div>
          </div>
        </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.href === '/instagram' && store.instagramAccounts.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--success)',
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                }} />
              )}
            </Link>
          ))}
          {/* Help & Guide */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className={`nav-item ${isHelpOpen ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: '10px 12px' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </span>
            <span className="sidebar-label">Help & Guide</span>
            <span className="sidebar-label" style={{
              marginLeft: 'auto', background: '#7c3aed', color: 'white',
              fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px'
            }}>NEW</span>
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
              style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}
            >
              <span>🛡️</span>
              <span className="sidebar-label">Admin</span>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid var(--border)' }}>
          {firebaseUser ? (
            <div style={{ marginBottom: '16px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img src={firebaseUser.photoURL || ''} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div className="sidebar-label" style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{firebaseUser.displayName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Logged in</div>
                </div>
              </div>
              <button onClick={logoutUser} style={{ width: '100%', padding: '6px', fontSize: '11px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} style={{ width: '100%', marginBottom: '16px', padding: '10px', fontSize: '13px', background: 'white', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: '16px', height: '16px' }} />
              <span className="sidebar-label">Sign in</span>
            </button>
          )}

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="sidebar-label">
            {store.instagramAccounts.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="status-dot active" />
                <span>{store.instagramAccounts[0].username}</span>
              </div>
            ) : (
              <div style={{ marginBottom: '8px' }}>No account</div>
            )}
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', opacity: 0.7, fontSize: '11px' }}>
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Guide Panel */}
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '340px',
          background: '#13101f', borderLeft: '1px solid var(--border)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          boxShadow: isHelpOpen ? '-4px 0 24px rgba(0,0,0,0.5)' : 'none',
          transform: isHelpOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Help & Guide</h2>
            <button onClick={() => setIsHelpOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              ✕
            </button>
          </div>
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--accent-light)' }}>1. Connect Website</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Paste script snippet in your header.</p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: '#1877F2' }}>2. Connect Facebook</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Authorize access to your IG business accounts.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
