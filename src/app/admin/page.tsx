'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Real data state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [totalConnectedAccounts, setTotalConnectedAccounts] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email === 'aruljothiarasu620@gmail.com') {
        fetchAllUsers();
      }
    });
    return () => unsub();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let usersList: any[] = [];
      let igAccountCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({ id: doc.id, ...data });
        
        // Count how many IG accounts this user has connected
        if (data.instagramAccounts && Array.isArray(data.instagramAccounts)) {
          igAccountCount += data.instagramAccounts.length;
        }
      });

      setAllUsers(usersList);
      setTotalConnectedAccounts(igAccountCount);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoadingData(false);
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
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
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
                          {u.instagramAccounts?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {u.instagramAccounts.map((acc: any) => (
                                <span key={acc.id} className="badge" style={{ background: 'rgba(225, 48, 108, 0.1)', color: '#E1306C', border: '1px solid rgba(225, 48, 108, 0.2)', width: 'fit-content' }}>
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
                          <span className="badge badge-active"><span className="status-dot active"></span> Active</span>
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

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'var(--accent-light)', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to User Dashboard
        </Link>
      </div>
    </div>
  );
}
