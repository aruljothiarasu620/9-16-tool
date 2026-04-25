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
        {/* Help & Guide — visible to all */}
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
          <span>Help & Guide</span>
          <span style={{
            marginLeft: 'auto', background: '#7c3aed', color: 'white',
            fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px'
          }}>NEW</span>
        </button>

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

      {/* Help & Guide Side Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '340px',
        background: '#13101f',
        borderLeft: '1px solid var(--border)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isHelpOpen ? '-4px 0 24px rgba(0,0,0,0.5)' : 'none',
        transform: isHelpOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Help & Guide</h2>
          <button onClick={() => setIsHelpOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--accent-light)' }}>1. Connect Your Website</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Embed the InstaFlow tracking widget.</p>
            <ol style={{ fontSize: '13px', color: 'var(--text-primary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Go to the <strong>Settings</strong> tab in the left sidebar.</li>
              <li>Under the API section, <strong>copy your unique script snippet</strong>.</li>
              <li>Go to your website builder (like WordPress, Shopify, or Wix).</li>
              <li>Find the section for <strong>Custom Code</strong> or <strong>Header/Footer Scripts</strong>.</li>
              <li>Paste the snippet into the Body or Footer section and save!</li>
            </ol>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: '#1877F2' }}>2. Connect Facebook</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Authorize InstaFlow for your Facebook Pages.</p>
            <ol style={{ fontSize: '13px', color: 'var(--text-primary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Navigate to the <strong>Instagram</strong> tab from the sidebar.</li>
              <li>Click the <strong>Connect Facebook</strong> button.</li>
              <li>A Facebook popup will open. Log in to your Facebook account.</li>
              <li>Select all the Facebook Pages you want to link.</li>
              <li><strong>Crucial:</strong> Keep all permission toggles turned ON.</li>
              <li>Click "Done". The page will refresh and your accounts will be securely saved!</li>
            </ol>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: '#E1306C' }}>3. Connect Instagram</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Link your IG account via Facebook.</p>
            <ol style={{ fontSize: '13px', color: 'var(--text-primary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>On your phone's Instagram app, go to Settings and switch your account to a <strong>Professional/Business Account</strong>.</li>
              <li>On Facebook, go to your <strong>Page Settings &gt; Linked Accounts</strong>.</li>
              <li>Link your Instagram Business account to your Facebook Page.</li>
              <li>Once linked, follow the <strong>Connect Facebook</strong> steps above. InstaFlow will automatically detect and connect your Instagram!</li>
            </ol>
          </div>
        </div>
      </div>
    </aside>
  );
}
