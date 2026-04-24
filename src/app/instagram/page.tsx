'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { generateId } from '@/lib/utils';

declare global {
  interface Window {
    FB: {
      init: (config: object) => void;
      login: (callback: (response: { authResponse?: { accessToken: string } }) => void, options: object) => void;
      api: (path: string, callback: (response: Record<string, unknown>) => void) => void;
    };
    fbAsyncInit: () => void;
  }
}

export default function InstagramPage() {
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
    if (!appId) return;

    // Load the Facebook SDK
    if (document.getElementById('facebook-sdk')) {
      setSdkLoaded(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
      setSdkLoaded(true);
    };

    const script = document.createElement('script');
    script.id = 'facebook-sdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [appId]);

  const handleFBLogin = () => {
    if (!sdkLoaded || !window.FB) {
      setError('Facebook SDK not loaded. Please ensure App ID is configured in Settings.');
      return;
    }
    setIsConnecting(true);
    setError('');

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const token = response.authResponse.accessToken;
          // Fetch user info
          window.FB.api('/me?fields=name,picture,instagram_business_account{name,followers_count,profile_picture_url,username}', (data) => {
            const igAccount = (data.instagram_business_account as Record<string, unknown>) || {};
            addInstagramAccount({
              id: generateId(),
              username: (igAccount.username as string) || (data.name as string) || 'Unknown',
              profilePicture: ((igAccount.profile_picture_url as string) || (data.picture as { data: { url: string } })?.data?.url) || '',
              followerCount: (igAccount.followers_count as number) || 0,
              accessToken: token,
              pageId: (data.id as string) || '',
              connectedAt: new Date().toISOString(),
            });
            setIsConnecting(false);
          });
        } else {
          setError('Login was cancelled or failed.');
          setIsConnecting(false);
        }
      },
      {
        scope: 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_posts',
      }
    );
  };

  const handleManualConnect = () => {
    if (!manualToken.trim() || !manualUsername.trim()) {
      setError('Please fill in at least username and access token.');
      return;
    }
    addInstagramAccount({
      id: generateId(),
      username: manualUsername.trim(),
      profilePicture: '',
      followerCount: parseInt(manualFollowers) || 0,
      accessToken: manualToken.trim(),
      pageId: '',
      connectedAt: new Date().toISOString(),
    });
    setManualToken('');
    setManualUsername('');
    setManualFollowers('');
    setShowManualForm(false);
  };

  return (
    <div style={{ padding: '32px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
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
              <div key={account.id} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Avatar */}
                <div style={{
                  width: '56px', height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
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

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>@{account.username}</span>
                    <span className="badge badge-active">
                      <span className="status-dot active" /> Connected
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>👥 {account.followerCount.toLocaleString()} followers</span>
                    <span>📅 Connected {new Date(account.connectedAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Token: <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                      {account.accessToken.slice(0, 20)}...
                    </code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    fontSize: '12px', textAlign: 'center',
                  }}>
                    {[
                      { label: 'instagram_basic', ok: true },
                      { label: 'content_publish', ok: true },
                      { label: 'pages_engagement', ok: true },
                    ].map((perm) => (
                      <div key={perm.label} style={{
                        padding: '3px 8px', borderRadius: '4px',
                        background: perm.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${perm.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: perm.ok ? '#10b981' : '#ef4444',
                      }}>
                        {perm.ok ? '✓' : '✗'} {perm.label}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => removeInstagramAccount(account.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '13px',
                      alignSelf: 'center',
                    }}>
                    🔌 Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '700px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
