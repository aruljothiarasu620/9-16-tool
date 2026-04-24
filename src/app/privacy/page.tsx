'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Last Updated: April 24, 2026
          </p>
        </header>

        {/* Content Section */}
        <div className="card" style={{ padding: '40px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              1. Introduction
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Welcome to InstaFlow ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we handle your information when you use our Instagram automation platform.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              2. Data We Collect
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
              When you connect your Instagram account via the Meta Graph API, we may access the following information:
            </p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: '20px' }}>
              <li>Instagram Username and Profile Picture</li>
              <li>Follower count and basic account statistics</li>
              <li>Media metadata (for automation purposes)</li>
              <li>Access tokens provided by Meta (to perform actions on your behalf)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              3. How We Use Your Data
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
              We use the data collected strictly for providing the automation services you configure in our builder, including:
            </p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: '20px' }}>
              <li>Publishing content to your Instagram account as scheduled by you</li>
              <li>Responding to comments or DMs based on your automation rules</li>
              <li>Displaying account performance metrics in your dashboard</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              4. Data Storage and Security
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Your access tokens are stored securely and used only for the purpose of executing your automation workflows. We do not sell your personal data to third parties. All communication with Meta APIs is conducted via encrypted HTTPS connections.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              5. Data Deletion
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You can disconnect your Instagram account and revoke access at any time via the "Settings" or "Instagram Connect" page in the application. Upon disconnection, all related access tokens are immediately removed from our active storage.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              6. Contact Us
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              If you have any questions about this Privacy Policy or our data practices, please contact us at: <br />
              <strong style={{ color: 'var(--accent-light)' }}>support@instaflow-automation.com</strong>
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          © 2026 InstaFlow Automation Platform. Built for developers.
        </div>
      </div>
    </div>
  );
}
