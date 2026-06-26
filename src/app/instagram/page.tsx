'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { useStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export default function InstagramPage() {
  const isMobile = useIsMobile();
  const { instagramAccounts, addInstagramAccount, removeInstagramAccount, settings } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [manualFollowers, setManualFollowers] = useState('');

  const appId = settings.facebookAppId || '2001458060448073';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we just returned from Facebook OAuth
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('long_lived_token='))) {
      setIsConnecting(true);
      setError('');
      
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('long_lived_token') || params.get('access_token');
      
      // Clean up the URL immediately
      window.history.replaceState(null, '', window.location.pathname);
      
      if (token) {
        // --- NEW: EXCHANGE FOR LONG-LIVED TOKEN ---
        (async () => {
          try {
            // Wait for Firebase Auth to fully initialize so we don't encounter null currentUser on redirect load
            let user = auth.currentUser;
            if (!user) {
              user = await new Promise<any>((resolve) => {
                const unsubscribe = onAuthStateChanged(auth, (u) => {
                  unsubscribe();
                  resolve(u);
                });
              });
            }

            if (!user) {
              console.warn('⚠️ Auth initialization yielded no user.');
              setError('You must be logged in to connect your Instagram account.');
              setIsConnecting(false);
              return;
            }

            const exchangeRes = await fetch('/api/instagram/exchange', {
              method: 'POST',
              body: JSON.stringify({ shortLivedToken: token })
            });
            const exchangeData = await exchangeRes.json();
            
            const finalToken = exchangeData.longLivedToken || token;
            if (exchangeData.longLivedToken) {
              console.log('✅ Successfully upgraded to 60-day token');
            } else {
              console.warn('⚠️ Could not upgrade token, using short-lived one:', exchangeData.error);
            }

            // Fetch the user's pages and connected Instagram accounts using the finalToken
            const igRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{name,followers_count,profile_picture_url,username}&access_token=${finalToken}`);
            const data = await igRes.json();

            if (data.error) {
              setError(data.error.message);
              setIsConnecting(false);
              return;
            }
            
            if (data.data && data.data.length > 0) {
              let foundIg = false;
              const newAccounts: any[] = [];
              data.data.forEach((page: any) => {
                if (page.instagram_business_account) {
                   foundIg = true;
                   const igAccount = page.instagram_business_account;
                   const newAcc = {
                      id: generateId(),
                      username: igAccount.username || page.name || 'Unknown',
                      profilePicture: igAccount.profile_picture_url || '',
                      followerCount: igAccount.followers_count || 0,
                      accessToken: page.access_token || finalToken, // Use page token if available, else finalToken
                      pageId: igAccount.id,
                      connectedAt: new Date().toISOString(),
                   };
                   addInstagramAccount(newAcc);
                   newAccounts.push(newAcc);
                }
              });

              if (!foundIg) {
                setError("No connected Instagram Professional accounts found on your Facebook Pages. Make sure they are linked.");
              } else {
                let merged = [...newAccounts];
                try {
                  const docRef = doc(db, 'users', user.uid);
                  const snap = await getDoc(docRef);
                  const existing: any[] = snap.exists() ? (snap.data().instagramAccounts || []) : [];
                  merged = [
                    ...existing.filter((e: any) => !newAccounts.some((n: any) => n.username === e.username)),
                    ...newAccounts,
                  ];
                  await setDoc(docRef, { instagramAccounts: merged }, { merge: true });
                  console.log('✅ FB accounts saved to Firestore:', merged.length, 'accounts');
                } catch (dbErr) {
                  console.warn('⚠️ Firestore sync failed, using localStorage fallback:', dbErr);
                  let localExisting: any[] = [];
                  try {
                    localExisting = JSON.parse(localStorage.getItem(`ig_accounts_${user.uid}`) || '[]');
                  } catch (_) {}
                  merged = [
                    ...localExisting.filter((e: any) => !newAccounts.some((n: any) => n.username === e.username)),
                    ...newAccounts,
                  ];
                }

                useStore.setState({ instagramAccounts: merged });
                if (typeof window !== 'undefined') {
                  localStorage.setItem(`ig_accounts_${user.uid}`, JSON.stringify(merged));
                }
              }
            } else {
               setError("No Facebook Pages found. You must create a Facebook Page and link it to your Instagram Business account.");
            }
          } catch (err: any) {
            console.error('Connection error:', err);
            setError(`Failed to connect: ${err.message || err}`);
          } finally {
            setIsConnecting(false);
          }
        })();
      } else {
        setIsConnecting(false);
      }
    }
  }, [addInstagramAccount]);

  const handleFBLogin = () => {
    if (!appId) {
      setError('Facebook App ID is missing.');
      return;
    }
    
    setIsConnecting(true);
    
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/instagram` : 'https://makecom-azure.vercel.app/instagram';
    const scope = 'instagram_basic,instagram_content_publish,instagram_manage_comments,pages_show_list,pages_read_engagement,business_management,pages_manage_posts';
    const extras = JSON.stringify({"setup":{"channel":"IG_API_ONBOARDING"}});
    
    const authUrl = `https://www.facebook.com/dialog/oauth?client_id=${appId}&display=page&extras=${encodeURIComponent(extras)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
  };


  const handleManualConnect = async () => {

    if (!manualToken.trim() || !manualUsername.trim()) {
      setError('Please fill in at least username and access token.');
      return;
    }
    const newAcc = {
      id: generateId(),
      username: manualUsername.trim(),
      profilePicture: '',
      followerCount: parseInt(manualFollowers) || 0,
      accessToken: manualToken.trim(),
      pageId: '',
      connectedAt: new Date().toISOString(),
    };
    addInstagramAccount(newAcc);
    // Direct Firestore save with localStorage fallback
    const user = auth.currentUser;
    let merged = [newAcc];
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        const existing: any[] = snap.exists() ? (snap.data().instagramAccounts || []) : [];
        merged = [...existing.filter((e: any) => e.username !== newAcc.username), newAcc];
        await setDoc(docRef, { instagramAccounts: merged }, { merge: true });
      } catch (err) {
        console.warn('⚠️ Manual connect Firestore save failed, using local fallback:', err);
        let localExisting: any[] = [];
        try {
          localExisting = JSON.parse(localStorage.getItem(`ig_accounts_${user.uid}`) || '[]');
        } catch (_) {}
        merged = [...localExisting.filter((e: any) => e.username !== newAcc.username), newAcc];
      }
    }
    useStore.setState({ instagramAccounts: merged });
    if (typeof window !== 'undefined') {
      const key = user ? `ig_accounts_${user.uid}` : 'instagramAccounts';
      localStorage.setItem(key, JSON.stringify(merged));
    }
    setManualToken('');
    setManualUsername('');
    setManualFollowers('');
    setShowManualForm(false);
  };

  const handleDisconnect = async (id: string, username?: string) => {
    // Compute remaining BEFORE store update to avoid React batching timing issues, filtering by both ID and username
    const remaining = useStore.getState().instagramAccounts.filter((a: any) => {
      const idMatch = a.id === id;
      const usernameMatch = username && a.username.toLowerCase() === username.toLowerCase();
      return !idMatch && !usernameMatch;
    });
    
    removeInstagramAccount(id, username);
    
    // Write the exact remaining list to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { instagramAccounts: remaining }, { merge: true });
        console.log('✅ Disconnected and saved:', remaining.length, 'accounts remaining');
      } catch (err) {
        console.error('Disconnect save error:', err);
      }
    }
  };

  return (
    <div className="instagram-container">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          Instagram Connect
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Connect your Instagram Business accounts to start automating
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '10px',
        marginBottom: '28px',
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: 1.7,
      }}>
        <div style={{ fontWeight: 700, color: 'var(--accent-light)', marginBottom: '4px', fontSize: '14px' }}>
          📋 Requirements
        </div>
        <div>1. An <strong style={{ color: 'var(--text-primary)' }}>Instagram Business or Creator account</strong></div>
        <div>2. A <strong style={{ color: 'var(--text-primary)' }}>Facebook App</strong> with Instagram Graph API enabled</div>
        <div>3. Add your Facebook App ID in <strong style={{ color: 'var(--text-primary)' }}>Settings → API Credentials</strong></div>
        <div>4. Required permissions: <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-light)' }}>instagram_basic, instagram_content_publish, pages_read_engagement</code></div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '20px',
          fontSize: '13px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Connected accounts */}
      {instagramAccounts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Connected Accounts ({instagramAccounts.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {instagramAccounts.map((account) => (
              <div key={account.id} className="card" style={{
                padding: isMobile ? '14px' : '20px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '12px' : '20px',
              }}>
                {/* Top row: avatar + name on mobile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--pink))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '2px solid var(--accent)',
                  }}>
                    {account.profilePicture ? (
                      <img src={account.profilePicture} alt={account.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>📸</span>
                    )}
                  </div>

                  {/* Account info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>@{account.username}</span>
                      <span className="badge badge-active">
                        <span className="status-dot active" /> Connected
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>👥 {account.followerCount.toLocaleString()} followers</span>
                      <span>📅 {new Date(account.connectedAt).toLocaleDateString()}</span>
                    </div>
                    {!isMobile && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        Token: <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                          {account.accessToken.slice(0, 20)}...
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Disconnect button — on desktop show here */}
                  {!isMobile && (
                    <button
                      onClick={() => handleDisconnect(account.id, account.username)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '13px',
                        flexShrink: 0,
                      }}>
                      🔌 Disconnect
                    </button>
                  )}
                </div>

                {/* Bottom row on mobile: permissions + disconnect */}
                {isMobile && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border)',
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {[
                        { label: 'instagram_basic', ok: true },
                        { label: 'content_publish', ok: true },
                        { label: 'pages_engagement', ok: true },
                      ].map((perm) => (
                        <div key={perm.label} style={{
                          padding: '2px 6px', borderRadius: '4px',
                          fontSize: '10px',
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981',
                        }}>
                          ✓ {perm.label}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDisconnect(account.id, account.username)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px',
                        padding: '7px 12px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}>
                      🔌 Disconnect
                    </button>
                  </div>
                )}

                {/* Desktop permissions */}
                {!isMobile && (
                  <div style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect buttons */}
      <div className="connect-grid">
        {/* Facebook OAuth button */}
        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📱</div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Facebook OAuth Login</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
            Real OAuth 2.0 login via Facebook.<br />
            Requires App ID in Settings.
          </p>
          <button
            className="btn-primary"
            onClick={handleFBLogin}
            disabled={isConnecting || !appId}
            style={{
              width: '100%',
              opacity: (!appId) ? 0.5 : 1,
              cursor: (!appId) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
            {isConnecting ? (
              <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Connecting...</>
            ) : (
              <><span>f</span> Continue with Facebook</>
            )}
          </button>
          {!appId && (
            <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '8px' }}>
              ⚠️ Add Facebook App ID in Settings first
            </p>
          )}
        </div>

        {/* Manual token input */}
        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Manual Token</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
            Paste your Instagram Graph API<br />
            access token directly.
          </p>
          <button
            className="btn-secondary"
            onClick={() => setShowManualForm(!showManualForm)}
            style={{ width: '100%' }}>
            🔑 Enter Token Manually
          </button>
        </div>
      </div>

      {/* Manual form */}
      {showManualForm && (
        <div className="card animate-fade-in" style={{ padding: '24px', marginTop: '20px', maxWidth: '500px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Manual Token Setup</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Username *</label>
            <input className="input" placeholder="your_instagram_username"
              value={manualUsername} onChange={(e) => setManualUsername(e.target.value)} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Follower Count</label>
            <input className="input" type="number" placeholder="10000"
              value={manualFollowers} onChange={(e) => setManualFollowers(e.target.value)} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Access Token *</label>
            <textarea className="input" rows={3} placeholder="EAABs..."
              value={manualToken} onChange={(e) => setManualToken(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleManualConnect} style={{ flex: 1 }}>
              Connect Account
            </button>
            <button className="btn-secondary" onClick={() => setShowManualForm(false)} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Post capability overview */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>What You Can Automate</h2>
        <div className="capabilities-grid">
          {[
            { icon: '📸', title: 'Single Image Post', desc: 'Post a single image with caption and hashtags' },
            { icon: '🎠', title: 'Carousel (up to 10)', desc: 'Post multiple images in a swipeable carousel' },
            { icon: '🎬', title: 'Reels', desc: 'Upload and publish short-form video reels' },
            { icon: '📍', title: 'Location Tagging', desc: 'Add geographic location to your posts' },
            { icon: '⏰', title: 'Scheduled Posts', desc: 'Queue posts for exact date and time' },
            { icon: '🔗', title: 'Webhook Triggers', desc: 'Trigger automations from external events' },
          ].map((item) => (
            <div key={item.title} className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
