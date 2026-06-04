'use client';

import Link from 'next/link';

export default function DeletionInstructions() {
  return (
    <div style={{ 
      padding: '60px 20px', 
      background: 'var(--bg-primary)', 
      minHeight: '100vh',
      color: 'var(--text-primary)',
      lineHeight: '1.6'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Navigation */}
        <Link href="/" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--accent-light)', 
          textDecoration: 'none',
          marginBottom: '40px',
          fontSize: '14px',
          fontWeight: 600
        }}>
          ← Back to Home
        </Link>

        {/* Header */}
        <header style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }} className="gradient-text">
            Data Deletion Instructions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Last Updated: April 24, 2026
          </p>
        </header>

        {/* Content Section */}
        <div className="card" style={{ padding: '40px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              How to Delete Your Data
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              At InstaFlow, we care about your privacy and allow you to request the deletion of your account data at any time. Under Facebook Developer Rules, we provide a Data Deletion Request callback URL.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              If you want to delete your activities and data associated with our application, you can do so by following these simple steps:
            </p>
            <ol style={{ color: 'var(--text-muted)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                Go to your Personal Facebook Profile Settings & Privacy. Click on <strong>Settings</strong>.
              </li>
              <li>
                Scroll down and click on <strong>Apps and Websites</strong> on the left-hand menu.
              </li>
              <li>
                Find and select our app <strong>InstaFlow</strong> (or search for it in the search bar).
              </li>
              <li>
                Click the <strong>Remove</strong> button next to the app name.
              </li>
              <li>
                Alternatively, you can contact us directly at <strong style={{ color: 'var(--accent-light)' }}>support@instaflow-automation.com</strong> with your user ID or Instagram username to request manual deletion of all stored credentials and account data from our databases.
              </li>
            </ol>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Data Retention After Removal
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Once you remove the application access or request manual deletion, all active access tokens, Instagram media caches, and automation workflows associated with your account are immediately and permanently deleted from our active Firebase databases.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          © 2026 InstaFlow Automation Platform.
        </div>
      </div>
    </div>
  );
}
