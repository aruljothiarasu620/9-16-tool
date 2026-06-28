'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import LandingPage from './LandingPage';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobileMainWrapper from './MobileMainWrapper';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';
const PUBLIC_ROUTES = ['/privacy', '/verified'];

// UID-scoped localStorage key — NEVER shares data between different users
const lsKey = (uid: string) => `ig_accounts_${uid}`;

// Track which UID we've already loaded Firestore data for
let firestoreLoadedForUid: string | null = null;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const whatsappWidget = (
    <a 
      href="https://wa.me/919025408167" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: '#25D366',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.3)';
      }}
      title="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99S14.14 1.139 11.5 1.138c-5.444 0-9.87 4.423-9.873 9.869-.001 1.7.45 3.355 1.306 4.808L1.927 20.4l4.72-1.246zM17.52 14.3c-.324-.16-1.92-.949-2.219-1.059-.299-.11-.517-.16-.735.16-.217.32-.843 1.059-1.033 1.28-.19.22-.38.24-.704.08-.324-.16-1.372-.506-2.615-1.616-.966-.86-1.619-1.927-1.809-2.247-.19-.32-.02-.492.142-.651.146-.143.324-.38.486-.57.16-.19.214-.32.322-.533.109-.214.055-.4-.027-.56-.08-.16-.735-1.77-.999-2.409-.26-.628-.525-.543-.722-.553-.186-.01-.399-.01-.613-.01-.214 0-.563.08-.857.4-.294.32-1.123 1.1-1.123 2.68 0 1.58 1.149 3.11 1.307 3.32.158.21 2.261 3.45 5.476 4.84.765.33 1.36.53 1.82.68.769.24 1.47.21 2.02.13.618-.09 1.92-.786 2.19-1.547.27-.76.27-1.41.19-1.547-.08-.14-.298-.22-.622-.38z"/>
      </svg>
    </a>
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        // ── STEP 1: Clear any OTHER user's data from the Zustand store immediately ──
        // This prevents a previous user's data from briefly showing for the new user
        if (firestoreLoadedForUid !== uid) {
          // Reset store to empty before loading new user's data
          useStore.setState({ instagramAccounts: [], scenarios: [], runLogs: [] });
        }

        // ── STEP 2: Load THIS user's data from Firestore (once per session) ──
        if (firestoreLoadedForUid !== uid) {
          firestoreLoadedForUid = uid;

          try {
            const docRef = doc(db, 'users', uid);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
              const data = snap.data();
              const firestoreAccounts = data.instagramAccounts || [];

              // Read from UID-scoped localStorage key ONLY
              let localAccounts: any[] = [];
              try {
                localAccounts = JSON.parse(localStorage.getItem(lsKey(uid)) || '[]');
              } catch (_) {}

              // Merge: Firestore is source of truth, local fills gaps
              const mergedAccounts = [...firestoreAccounts];
              localAccounts.forEach((localAcc: any) => {
                if (
                  localAcc?.username &&
                  !mergedAccounts.some((fsAcc: any) => fsAcc.username === localAcc.username)
                ) {
                  mergedAccounts.push(localAcc);
                }
              });

              // Persist merged list to UID-scoped localStorage
              try {
                localStorage.setItem(lsKey(uid), JSON.stringify(mergedAccounts));
              } catch (_) {}

              // Auto-sync local-only accounts to Firestore in the background
              if (mergedAccounts.length > firestoreAccounts.length) {
                (async () => {
                  try {
                    const { setDoc } = await import('firebase/firestore');
                    await setDoc(docRef, { instagramAccounts: mergedAccounts }, { merge: true });
                    console.log('✅ Synced local-only accounts to Firestore');
                  } catch (fsErr) {
                    console.warn('⚠️ Background Firestore sync failed:', fsErr);
                  }
                })();
              }
              // ── STEP 3: Auto-cleanup duplicate admin accounts from non-admin users ──
              if (firebaseUser.email !== ADMIN_EMAIL) {
                try {
                  const adminAccsRef = doc(db, 'config', 'admin_accounts');
                  const adminAccsSnap = await getDoc(adminAccsRef);
                  let adminUsernames = ['aruljothiarasu', 'gs.srcc._1942', 'mr_mak_30_', 'ms_creates_03', 'mamitha.crushae'];
                  if (adminAccsSnap.exists()) {
                    adminUsernames = adminAccsSnap.data().usernames || adminUsernames;
                  }
                  
                  // Convert all to lowercase for case-insensitive match
                  const adminLowerList = adminUsernames.map(name => name.toLowerCase());

                  const cleanAccounts = mergedAccounts.filter((acc: any) => {
                    return acc && acc.username && !adminLowerList.includes(acc.username.toLowerCase());
                  });

                  if (cleanAccounts.length < mergedAccounts.length) {
                    console.log(`🧹 Auto-filtered ${mergedAccounts.length - cleanAccounts.length} leaked admin accounts from non-admin session`);
                    
                    // Write clean accounts to local storage
                    try {
                      localStorage.setItem(lsKey(uid), JSON.stringify(cleanAccounts));
                    } catch (_) {}

                    // Update the merged list in-place
                    mergedAccounts.splice(0, mergedAccounts.length, ...cleanAccounts);

                    // Write to Firestore immediately
                    const { setDoc } = await import('firebase/firestore');
                    await setDoc(docRef, { instagramAccounts: cleanAccounts }, { merge: true });
                  }
                } catch (cleanErr) {
                  console.warn('⚠️ Auto-cleanup check failed:', cleanErr);
                }
              }

              useStore.setState({
                instagramAccounts: mergedAccounts,
                scenarios: data.scenarios || [],
                runLogs: data.runLogs || [],
                tier: data.tier || 'free',
              });
            } else {
              // New user — load from their UID-scoped localStorage only
              let localAccounts: any[] = [];
              try {
                localAccounts = JSON.parse(localStorage.getItem(lsKey(uid)) || '[]');
              } catch (_) {}
              if (localAccounts.length > 0) {
                useStore.setState({ instagramAccounts: localAccounts, tier: 'free' });
              }
            }

            // Save basic profile info for Admin panel
            const { setDoc } = await import('firebase/firestore');
            await setDoc(
              doc(db, 'users', uid),
              { email: firebaseUser.email, name: firebaseUser.displayName || 'Unknown User' },
              { merge: true }
            );
          } catch (err) {
            console.error('AuthGuard: Firestore load error', err);
            // Fallback: load from THIS USER's UID-scoped localStorage only
            let localAccounts: any[] = [];
            try {
              localAccounts = JSON.parse(localStorage.getItem(lsKey(uid)) || '[]');
            } catch (_) {}
            if (localAccounts.length > 0) {
              useStore.setState({ instagramAccounts: localAccounts });
            }
          }
        }

      } else {
        // Logged out — wipe store and reset UID tracker
        firestoreLoadedForUid = null;
        useStore.setState({ instagramAccounts: [], scenarios: [], runLogs: [] });
        // NOTE: We do NOT clear localStorage here — it's UID-scoped so it's safe
      }

      setLoading(false);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (user.email !== ADMIN_EMAIL && pathname === '/admin') {
        router.replace('/');
      }
    }
  }, [pathname, user, loading, router]);

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

  if (PUBLIC_ROUTES.includes(pathname)) {
    return (
      <>
        {children}
        {whatsappWidget}
      </>
    );
  }

  if (!user) {
    if (pathname === '/') {
      return (
        <>
          <LandingPage
            handleLogin={handleGoogleLogin}
            signingIn={signingIn}
            error={error}
          />
          {whatsappWidget}
        </>
      );
    }
    return (
      <>
        <div className="auth-container" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
        {/* ── LEFT PANEL: White form area ── */}
        <div className="auth-left-panel" style={{
          flex: '0 0 45%',
          background: '#f8f8fa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflowY: 'auto',
        }}>
          {/* Mobile-only logo */}
          <div style={{
            position: 'absolute', top: '24px', left: '28px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <img 
              src="/logo.png?v=4" 
              alt="Logo" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#1a1a2e', letterSpacing: '-0.3px' }}>InstaFlow</span>
          </div>

          <div style={{ width: '100%', maxWidth: '360px', animation: 'fadeIn 0.4s ease' }}>
            <h1 style={{
              fontSize: '28px', fontWeight: 800, color: '#0f0f1a',
              marginBottom: '8px', letterSpacing: '-0.5px',
            }}>
              Sign in
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
              Welcome back. Access your automation dashboard.
            </p>

            {error && (
              <div style={{
                padding: '10px 14px', marginBottom: '20px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px', color: '#dc2626', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            {/* Google Button */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={signingIn}
              onMouseEnter={(e) => {
                if (!signingIn) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px var(--accent-glow)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
              style={{
                width: '100%', padding: '14px 20px',
                background: 'white', color: '#111827',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                cursor: signingIn ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                opacity: signingIn ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: 'none',
                fontFamily: 'inherit',
                marginBottom: '24px',
              }}
            >
              {signingIn ? (
                <>
                  <div style={{
                    width: '20px', height: '20px',
                    border: '2.5px solid var(--accent-glow)',
                    borderTopColor: 'var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', lineHeight: 1.7 }}>
              By signing in, you agree to our{' '}
              <a href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: Dark purple branding ── */}
        <div className="auth-right-panel" style={{
          flex: 1,
          background: 'linear-gradient(160deg, #0b0f17 0%, #1a2333 40%, #070a10 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow effects */}
          <div style={{
            position: 'absolute', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 65%)',
            top: '-100px', right: '-100px',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(255,105,180,0.12) 0%, transparent 65%)',
            bottom: '-80px', left: '-80px',
            pointerEvents: 'none',
          }} />
          {/* Dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }} />

          {/* Top-right logo (Desktop only) */}
          <div className="desktop-logo-only" style={{
            position: 'absolute', top: '28px', right: '32px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <img 
              src="/logo.png?v=4" 
              alt="Logo" 
              style={{ 
                width: '36px', 
                height: '36px', 
                objectFit: 'contain',
                animation: 'float 3s ease-in-out infinite',
              }} 
            />
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'white', letterSpacing: '-0.3px' }}>InstaFlow</span>
          </div>

          {/* Main branding text */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px', width: '100%' }}>
            {/* Mobile Logo */}
            <div className="mobile-logo-only" style={{
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}>
              <img 
                src="/logo.png?v=4" 
                alt="Logo" 
                style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
              />
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'white', letterSpacing: '-0.3px' }}>InstaFlow</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '16px',
              letterSpacing: '-1px',
            }}>
              Automate smarter
            </h2>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, var(--accent), var(--pink))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
              marginBottom: '28px',
              letterSpacing: '-1px',
            }}>
              #withInstaFlow
            </h2>

            <p style={{
              fontSize: '16px', color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7, marginBottom: '40px',
            }}>
              From scheduling to analytics, build and automate your
              entire Instagram workflow in one powerful visual platform.
            </p>

            {/* Mobile Sign In Section */}
            <div className="mobile-login-container">
              {error && (
                <div style={{
                  padding: '10px 14px', marginBottom: '20px',
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', color: '#fca5a5', fontSize: '13px',
                  textAlign: 'left',
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={signingIn}
                style={{
                  width: '100%', padding: '14px 20px',
                  background: 'white', color: '#111827',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: signingIn ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontSize: '15px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  opacity: signingIn ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  fontFamily: 'inherit',
                  marginBottom: '20px',
                }}
              >
                {signingIn ? (
                  <>
                    <div style={{
                      width: '20px', height: '20px',
                      border: '2.5px solid var(--accent-glow)',
                      borderTopColor: 'var(--accent)',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      flexShrink: 0,
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.7, marginBottom: '0' }}>
                By signing in, you agree to our{' '}
                <a href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Trust badges */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '8px', flexWrap: 'wrap',
            }}>
              {[
                { icon: '⚡', text: 'Auto-Post' },
                { icon: '🔄', text: 'Scenarios' },
                { icon: '📊', text: 'Analytics' },
                { icon: '🔒', text: 'Secure' },
              ].map((item) => (
                <div key={item.text} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '13px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.85)',
                }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof line */}
            <p style={{
              marginTop: '36px', fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.3px',
            }}>
              Trusted by Instagram creators · Free forever
            </p>
          </div>
        </div>

        {/* ── MOBILE RESPONSIVE MERGE STYLING ── */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          
          .mobile-login-container {
            display: none;
          }
          .mobile-logo-only {
            display: none;
          }

          @media (max-width: 768px) {
            .auth-container {
              flex-direction: column !important;
            }
            .auth-left-panel {
              display: none !important;
            }
            .auth-right-panel {
              flex: 1 1 100% !important;
              width: 100% !important;
              min-height: 100vh !important;
              padding: 40px 24px !important;
              justify-content: center !important;
            }
            .mobile-login-container {
              display: block !important;
              width: 100% !important;
              max-width: 360px !important;
              margin: 24px auto 32px !important;
              animation: fadeIn 0.4s ease !important;
            }
            .mobile-logo-only {
              display: flex !important;
            }
            .desktop-logo-only {
              display: none !important;
            }
          }
        `}</style>
        </div>
        {whatsappWidget}
      </>
    );
  }

  const store = useStore();
  const userTier = store.tier || 'free';
  const isSuperAdmin = user?.email === 'aruljothiarasu620@gmail.com';

  if (user && !isSuperAdmin) {
    if (pathname === '/img-to-url') {
      if (userTier !== 'lifetime') {
        router.push('/');
        return null;
      }
    }
    if (pathname === '/analytics') {
      if (userTier !== 'yearly_saver' && userTier !== 'lifetime') {
        router.push('/');
        return null;
      }
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar />
      <MobileHeader />
      <MobileMainWrapper>
        {children}
      </MobileMainWrapper>
      <MobileBottomNav />
      {whatsappWidget}
    </div>
  );
}
