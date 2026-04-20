'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⚡' },
  { href: '/builder', label: 'Builder', icon: '🔧' },
  { href: '/instagram', label: 'Instagram', icon: '📸' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { instagramAccounts } = useStore();

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
            {item.href === '/instagram' && instagramAccounts.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--success)',
                width: '8px', height: '8px',
                borderRadius: '50%',
              }} />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {instagramAccounts.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span>{instagramAccounts[0].username}</span>
            </div>
          ) : (
            <span>No account connected</span>
          )}
        </div>
      </div>
    </aside>
  );
}
