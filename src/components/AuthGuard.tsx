'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';

// Public routes that do NOT need login
const PUBLIC_ROUTES = ['/privacy'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Load their Firestore data into the store
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            useStore.setState({
              instagramAccounts: data.instagramAccounts || [],
              scenarios: data.scenarios || [],
            });
          }
        } catch (err) {
          console.error('AuthGuard: Firestore load error', err);
        }

        // Admin routing: if admin user is not on /admin, redirect there
        if (firebaseUser.email === ADMIN_EMAIL && pathname === '/') {
          router.replace('/admin');
        }
        // Non-admin on /admin? Kick them out
        if (firebaseUser.email !== ADMIN_EMAIL && pathname === '/admin') {
          router.replace('/');
        }
      } else {
        // Logged out — clear store
        useStore.setState({ instagramAccounts: [], scenarios: [] });
      }

      setLoading(false);
    });
    return () => unsub();
  }, [pathname]);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.');
      setSigningIn(false);
    }
  };

  // Show spinner while Firebase restores session
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Public routes: always accessible
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Not logged in: show full-screen Google Sign-In overlay
  if (!user) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '48px 40px',
          width: '380px',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Logo */}
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #7c3aed, #db2777)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', margin: '0 auto 20px',
          }}>⚡</div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}
            className="gradient-text">
            Welcome to InstaFlow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>
            Sign in with your Google account to access your Instagram automation dashboard.
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: '16px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', color: '#ef4444', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={signingIn}
            style={{
              width: '100%', padding: '14px',
              background: 'white', color: '#1f2937',
              border: 'none', borderRadius: '10px',
              cursor: signingIn ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              opacity: signingIn ? 0.7 : 1,
              transition: 'opacity 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {signingIn ? (
              <>
                <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
                Signing in...
              </>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: '20px', height: '20px' }} />
                Continue with Google
              </>
            )}
          </button>

          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '20px', lineHeight: 1.6 }}>
            Your data is stored securely in Firebase and linked to your Google account.
            <br />
            <a href="/privacy" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    );
  }

  // Logged in — render children normally
  return <>{children}</>;
}
