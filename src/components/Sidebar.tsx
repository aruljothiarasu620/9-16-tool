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

  // Just track auth state — AuthGuard handles data loading
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        useStore.setState({ instagramAccounts: [], scenarios: [] });
      }
    });
    return () => unsub();
  }, []);

  const isAdmin = firebaseUser?.email === ADMIN_EMAIL;

  return (
    <aside style={{
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
    }}>
      {/* Logo */}
      <div style={{ padding: '0 8px 28px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #7c3aed, #db2777)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>InstaFlow</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automation Builder</div>
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
            <span>{item.label}</span>
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
        {/* Admin link — only visible for admin email */}
        {isAdmin && (
          <Link
            href="/admin"
            className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
            style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}
          >
            <span>🛡️</span>
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid var(--border)' }}>
        {firebaseUser ? (
          <div style={{ marginBottom: '16px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img src={firebaseUser.photoURL || ''} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div style={{ overflow: 'hidden' }}>
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
            Sign in with Google
          </button>
        )}

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {store.instagramAccounts.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="status-dot active" />
              <span>{store.instagramAccounts[0].username}</span>
            </div>
          ) : (
            <div style={{ marginBottom: '8px' }}>No account connected</div>
          )}
          <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', opacity: 0.7, fontSize: '11px' }}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </aside>
  );
}
