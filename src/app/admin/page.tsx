'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import UserAnalyticsModal from '@/components/UserAnalyticsModal';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Real data state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [totalConnectedAccounts, setTotalConnectedAccounts] = useState(0);

  // Meta Config Settings
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // URL modal settings
  const [selectedUserUrls, setSelectedUserUrls] = useState<any | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Analytics modal settings
  const [selectedUserAnalytics, setSelectedUserAnalytics] = useState<any | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const extractUrls = (userObj: any) => {
    const urls: { source: string; url: string; type: string }[] = [];
    
    // 1. Extract from scenarios
    if (Array.isArray(userObj.scenarios)) {
      userObj.scenarios.forEach((scen: any) => {
        if (scen && Array.isArray(scen.modules)) {
          scen.modules.forEach((mod: any) => {
            if (mod && mod.config) {
              if (typeof mod.config.imageUrl === 'string' && mod.config.imageUrl.trim()) {
                urls.push({
                  source: `Scenario: ${scen.name || 'Unnamed'} (${mod.label || 'Unnamed'})`,
                  url: mod.config.imageUrl.trim(),
                  type: 'Configured Image'
                });
              }
              if (Array.isArray(mod.config.images)) {
                mod.config.images.forEach((img: any, idx: number) => {
                  if (typeof img === 'string' && img.trim()) {
                    urls.push({
                      source: `Scenario: ${scen.name || 'Unnamed'} (${mod.label || 'Unnamed'} - Slide ${idx + 1})`,
                      url: img.trim(),
                      type: 'Configured Image'
                    });
                  }
                });
              }
            }
          });
        }
      });
    }

    // 2. Extract from runLogs (search for urls in details)
    if (Array.isArray(userObj.runLogs)) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      userObj.runLogs.forEach((log: any) => {
        if (log && typeof log.details === 'string') {
          const matches = log.details.match(urlRegex);
          if (matches) {
            matches.forEach((urlStr: string) => {
              urls.push({
                source: `Log: ${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown Date'}`,
                url: urlStr,
                type: 'Execution Output'
              });
            });
          }
        }
      });
    }

    // Deduplicate
    const uniqueUrls: typeof urls = [];
    const seen = new Set<string>();
    urls.forEach((item) => {
      if (item && item.url) {
        const key = `${item.url}-${item.source}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueUrls.push(item);
        }
      }
    });

    return uniqueUrls;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email === 'aruljothiarasu620@gmail.com') {
        fetchAllUsers(u);
        fetchMetaConfig();
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMetaConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'meta');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setMetaAppId(data.appId || '');
        setMetaAppSecret(data.appSecret || '');
      }
    } catch (err) {
      console.error('Error fetching Meta config:', err);
    }
  };

  const saveMetaConfig = async () => {
    setSavingSettings(true);
    setSaveStatus('idle');
    try {
      const docRef = doc(db, 'config', 'meta');
      await setDoc(docRef, {
        appId: metaAppId,
        appSecret: metaAppSecret,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving Meta config:', err);
      setSaveStatus('error');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchAllUsers = async (currentUser: User) => {
    try {
      // Call the server-side API route — it can read all users regardless of Firestore rules
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-uid': currentUser.uid,
          'x-admin-email': currentUser.email || '',
        },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Admin API error:', err);
        setLoadingData(false);
        return;
      }

      const { users, totalIgAccounts } = await res.json();
      setAllUsers(users);
      setTotalConnectedAccounts(totalIgAccounts);

      // Auto-synchronize admin's own accounts list to config/admin_accounts
      const adminUser = users.find((u: any) => u.email === 'aruljothiarasu620@gmail.com');
      if (adminUser) {
        const adminUsernames = (adminUser.instagramAccounts || [])
          .map((acc: any) => acc?.username?.toLowerCase())
          .filter(Boolean);
        await setDoc(doc(db, 'config', 'admin_accounts'), { usernames: adminUsernames }, { merge: true });
        console.log('✅ Admin accounts list synchronized to config/admin_accounts:', adminUsernames);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleResetUserAccounts = async (userId: string) => {
    if (!confirm('Are you sure you want to completely disconnect all Instagram accounts for this user? This will clean up any historical cross-contamination.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user?.email || '',
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        alert('User accounts reset successfully! Please ask the user to refresh their page.');
        if (user) {
          fetchAllUsers(user);
        }
      } else {
        const data = await res.json();
        alert(`Failed to reset user accounts: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error resetting user accounts:', err);
      alert('Network error while resetting user accounts.');
    }
  };

  return (
    <div style={{ padding: '32px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '0' }} className="gradient-text">
          🛡️ Admin Panel
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Restricted access · Logged in as <strong style={{ color: 'var(--accent-light)' }}>{user?.email}</strong>
        </p>
      </div>

      {/* Real Stats */}
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Registered Users', value: loadingData ? '...' : allUsers.length, color: '#7c3aed', icon: '👥' },
          { label: 'Total Connected IG Accounts', value: loadingData ? '...' : totalConnectedAccounts, color: '#E1306C', icon: '📸' },
          { label: 'Platform Status', value: 'Healthy', color: '#10b981', icon: '🟢' },
          { label: 'Errors Today', value: '0', color: '#ef4444', icon: '⚠️' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
              </div>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Meta Config Section */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px', border: '1px solid var(--accent-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1877F2' }}>🛡️</span> Meta App Credentials (60-Day Token Fix)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Enter your App ID and Secret to make Instagram connections last for 2 months.
            </p>
          </div>
          {saveStatus === 'success' && (
            <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>✓ Saved Successfully</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Meta App ID
            </label>
            <input 
              className="input" 
              placeholder="e.g. 123456789012345"
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Meta App Secret
            </label>
            <input 
              type="password"
              className="input" 
              placeholder="••••••••••••••••••••••••"
              value={metaAppSecret}
              onChange={(e) => setMetaAppSecret(e.target.value)}
            />
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={saveMetaConfig}
          disabled={savingSettings}
          style={{ width: 'fit-content', padding: '10px 24px' }}
        >
          {savingSettings ? 'Saving...' : 'Save Meta Config'}
        </button>
      </div>

      {/* Real User Management Table */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>👤 User Management</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          Live view of all registered users and their connected assets.
        </p>
        
        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent)' }}>Loading user database...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>User Profile</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Connected IG Accounts</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Recent Activity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>User Links</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Analytics</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No users found in database yet.
                    </td>
                  </tr>
                ) : (
                  allUsers.map((u) => {
                    const latestLog = u.runLogs?.[0];
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {u.name || 'Unknown User'}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '2px' }}>
                            {u.email || 'No email saved'}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '10px', opacity: 0.7 }}>
                            ID: {u.id}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {Array.isArray(u.instagramAccounts) && u.instagramAccounts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {u.instagramAccounts.map((acc: any) => acc && acc.username && (
                                <span key={acc.id || acc.username} className="badge" style={{ background: 'rgba(225, 48, 108, 0.1)', color: '#E1306C', border: '1px solid rgba(225, 48, 108, 0.2)', width: 'fit-content' }}>
                                  @{acc.username}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                          {latestLog ? (
                            <div>
                              <div style={{ color: latestLog.status === 'success' ? '#10b981' : '#ef4444', fontWeight: 500, marginBottom: '4px' }}>
                                {latestLog.status === 'success' ? '✓' : '✗'} {latestLog.modulesExecuted?.join(', ') || 'Unknown Execution'}
                              </div>
                              <div style={{ fontSize: '11px' }}>
                                {new Date(latestLog.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span style={{ opacity: 0.5 }}>No recent activity</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => setSelectedUserUrls(u)}
                            className="btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🔗 View Links ({extractUrls(u).length})
                          </button>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => setSelectedUserAnalytics(u)}
                            className="btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: 'var(--accent-light)',
                              border: '1px solid rgba(124, 58, 237, 0.2)'
                            }}
                          >
                            📊 View Analytics
                          </button>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className="badge badge-active"><span className="status-dot active"></span> Active</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {u.instagramAccounts?.length > 0 ? (
                            <button
                              onClick={() => handleResetUserAccounts(u.id)}
                              className="btn-danger"
                              style={{
                                padding: '6px 12px',
                                fontSize: '11px',
                                background: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              Reset Accounts
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Clean</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Media Links Modal */}
      {selectedUserUrls && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }} onClick={() => setSelectedUserUrls(null)}>
          <div className="card animate-fade-in" style={{ 
            padding: '28px', 
            width: '100%', 
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '4px' }} className="gradient-text">
                  Media & Output Links
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Extracted URLs for <strong style={{ color: 'var(--text-primary)' }}>{selectedUserUrls.name || selectedUserUrls.email}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedUserUrls(null)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const urls = extractUrls(selectedUserUrls);
                if (urls.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</div>
                      <p style={{ fontSize: '13px' }}>No media or output URLs found for this user.</p>
                      <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                        URLs will appear here once they configure image links in scenario builder modules or run scenarios.
                      </p>
                    </div>
                  );
                }

                return urls.map((item, idx) => {
                  const isImage = /\.(jpeg|jpg|gif|png|webp|svg)/i.test(item.url) || item.url.includes('imgur.com') || item.url.includes('vercel.app') || item.url.includes('fbcdn.net');
                  const isCopied = copiedUrl === item.url;
                  
                  return (
                    <div key={idx} className="card" style={{ 
                      padding: '16px', 
                      background: 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      borderColor: 'var(--border)'
                    }}>
                      {/* Image Thumbnail */}
                      <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '8px', 
                        background: 'var(--bg-card)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid var(--border)'
                      }}>
                        {isImage ? (
                          <img 
                            src={item.url} 
                            alt="Media Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.innerHTML = '🔗';
                                fallback.style.fontSize = '20px';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '20px' }}>🔗</span>
                        )}
                      </div>

                      {/* URL details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ 
                            fontSize: '9px', 
                            padding: '2px 8px', 
                            background: 'rgba(124, 58, 237, 0.15)', 
                            color: 'var(--accent-light)',
                            border: '1px solid rgba(124, 58, 237, 0.3)'
                          }}>
                            {item.type}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {item.source}
                          </span>
                        </div>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-primary)', 
                            textDecoration: 'none',
                            wordBreak: 'break-all',
                            fontWeight: 500,
                            display: 'block'
                          }}
                          className="hover:underline"
                        >
                          {item.url}
                        </a>
                      </div>

                      {/* Copy Action */}
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="btn-secondary"
                        style={{
                          padding: '8px 12px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          background: isCopied ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                          borderColor: isCopied ? 'var(--success)' : 'var(--border)',
                          color: isCopied ? 'var(--success)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                      >
                        {isCopied ? 'Copied! ✓' : 'Copy'}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
            
            <button 
              className="btn-secondary" 
              onClick={() => setSelectedUserUrls(null)} 
              style={{ width: '100%', padding: '12px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* User Analytics Modal */}
      {selectedUserAnalytics && (
        <UserAnalyticsModal
          isOpen={!!selectedUserAnalytics}
          onClose={() => setSelectedUserAnalytics(null)}
          user={selectedUserAnalytics}
        />
      )}

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'var(--accent-light)', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to User Dashboard
        </Link>
      </div>
    </div>
  );
}
