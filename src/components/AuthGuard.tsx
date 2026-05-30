'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';
const PUBLIC_ROUTES = ['/privacy'];

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
                  let adminUsernames = ['aruljothiarasu', 'gs.srcc._1942', 'mr_mak_30_', 'ms_creates_03'];
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
              });
            } else {
              // New user — load from their UID-scoped localStorage only
              let localAccounts: any[] = [];
              try {
                localAccounts = JSON.parse(localStorage.getItem(lsKey(uid)) || '[]');
              } catch (_) {}
              if (localAccounts.length > 0) {
                useStore.setState({ instagramAccounts: localAccounts });
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

        // Admin routing
        if (firebaseUser.email === ADMIN_EMAIL && pathname === '/') {
          router.replace('/admin');
        }
        if (firebaseUser.email !== ADMIN_EMAIL && pathname === '/admin') {
          router.replace('/');
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
    return <>{children}</>;
  }

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
          maxWidth: 'calc(100vw - 32px)',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
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

  return <>{children}</>;
}
