'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/builder': 'Builder',
  '/instagram': 'Instagram',
  '/settings': 'Settings',
  '/admin': 'Admin',
};

export default function MobileHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const title = PAGE_TITLES[pathname] || 'InstaFlow';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <>
      <header className="mobile-header">
        {/* Left: Logo + Title */}
        <div className="mobile-header-left">
          <img src="/logo.jpg" alt="InstaFlow" className="mobile-header-logo" />
          <div>
            <div className="mobile-header-title">{title}</div>
            <div className="mobile-header-sub">InstaFlow</div>
          </div>
        </div>

        {/* Right: User avatar */}
        {user && (
          <button className="mobile-header-avatar" onClick={() => setShowMenu(!showMenu)}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>
                {user.displayName?.[0] || '?'}
              </span>
            )}
          </button>
        )}
      </header>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setShowMenu(false)} />
          <div className="mobile-menu-dropdown">
            {user && (
              <>
                <div className="mobile-menu-user">
                  <div className="mobile-menu-name">{user.displayName}</div>
                  <div className="mobile-menu-email">{user.email}</div>
                </div>
                <button
                  className="mobile-menu-signout"
                  onClick={() => { logoutUser(); setShowMenu(false); }}
                >
                  🚪 Sign Out
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
